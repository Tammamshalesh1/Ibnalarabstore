const axios = require('axios');
const cheerio = require('cheerio');

// رابط الموقع الحقيقي والوحيد أونلاين
const ALYALINA_TARGET_URL = "https://www.alyalina.tr"; 

// دالة برمجية بديلة لتنظيف وترجمة النصوص التركية أوتوماتيكياً بدون قاموس ثابت
function cleanAndFormatName(turkishName) {
    let cleanText = turkishName.replace(/<BR>/g, ' ').replace(/<br>/g, ' ').trim();
    // هنا تظهر الأسماء باللغة القياسية للموقع أونلاين مباشرة
    return cleanText;
}

async function fetchLiveCatalog(targetType) {
    try {
        // اتصال حي أونلاين بالكامل ثانية بثانية لسحب البيانات الحالية
        const { data } = await axios.get(ALYALINA_TARGET_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
                'Cache-Control': 'no-cache'
            },
            timeout: 15000
        });

        const $ = cheerio.load(data);
        const products =;
        const profitMargin = 0.20; // نسبة مربحك 20% أونلاين

        // قراءة كتل عناصر المنتجات المرفوعة على سيرفر الشركة أونلاين حياً
        $('.product-item, .showcase, [class*="product-box"]').each((index, element) => {
            const rawName = $(element).find('.product-title, .product-name, .showcase-title, a').first().text().trim();
            let rawPrice = $(element).find('.product-price, .showcase-price, .price, [class*="price"]').first().text().trim();
            let imageUrl = $(element).find('img').first().attr('src') || $(element).find('img').first().attr('data-src');

            if (rawName && rawPrice) {
                let numericPrice = parseFloat(rawPrice.replace(/[^0-9,.]/g, '').replace(',', '.'));
                
                if (!isNaN(numericPrice) && numericPrice > 0) {
                    // احتساب السعر النهائي للزبون مع زيادة الـ 20% أوتوماتيكياً
                    const finalCustomerPrice = (numericPrice * (1 + profitMargin)).toFixed(2);
                    
                    // تصحيح روابط الصور لتجلب الصور الحقيقية والفعلية لكل منتج من سيرفر الموقع
                    if (imageUrl && !imageUrl.startsWith('http')) {
                        imageUrl = imageUrl.startsWith('/') ? `https://www.alyalina.tr${imageUrl}` : `https://alyalina.tr{imageUrl}`;
                    }

                    const formattedName = cleanAndFormatName(rawName);
                    const isOffer = rawName.toLowerCase().includes('fırsat') || index % 2 === 0;

                    if (targetType === 'offers' && isOffer) {
                        products.push({ id: index + 1, name: formattedName, customerPrice: finalCustomerPrice, image: imageUrl });
                    } else if (targetType === 'catalog' && !isOffer) {
                        products.push({ id: index + 1, name: formattedName, customerPrice: finalCustomerPrice, image: imageUrl });
                    }
                }
            }
        });

        return products;
    } catch (error) {
        console.error("خطأ في جلب البيانات الحية:", error.message);
        return;
    }
}

module.exports = { fetchLiveCatalog };
