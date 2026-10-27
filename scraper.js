const axios = require('axios');
const cheerio = require('cheerio');

const ALYALINA_URL = "https://alyalina.tr";

// دالة أونلاين بالكامل تجلب كافة البيانات من الموقع مباشرة دون أي منتجات ثابتة
async function fetchLiveCatalog(targetType) {
    try {
        // الاتصال بالموقع بشكل حي للحصول على كود الـ HTML الحالي
        const { data } = await axios.get(ALYALINA_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
            },
            timeout: 15000 // مهلة الاتصال 15 ثانية لضمان استقرار الجلب
        });

        const $ = cheerio.load(data);
        const products = [];
        const profitMargin = 0.15; // نسبة ربحك 15%

        // تحديد الحاوية بناءً على اختيار المستخدم (الكتالوج العام أم قسم العروض الأكثر مبيعاً)
        // الموقع يحتوي على كتل برمجية واضحة للمنتجات الجديدة والعروض
        let itemsSelector = '.product-item, .showcase, .product-box';
        
        if (targetType === 'offers') {
            // كشط حصري لقسم "Çok Satan Ürünler" المنتجات الأكثر مبيعاً والعروض داخل الموقع
            itemsSelector = 'div:contains("Çok Satan") .product-item, div:contains("Çok Tercih") .showcase, .product-item:URI(*indirim*)';
        } else {
            // كشط لقسم "YENİ ÜRÜNLER" والكتالوج المعروض على الصفحة الرئيسية
            itemsSelector = 'div:contains("YENİ ÜRÜNLER") .product-item, div:contains("Yeni Ürün") .showcase, .product-item';
        }

        $(itemsSelector).each((index, element) => {
            // جلب العناوين والأسماء الفعلية للمنتجات من قلب الأكواد الحية
            const name = $(element).find('.product-title, .product-name, .showcase-title, a').first().text().trim();
            let rawPrice = $(element).find('.product-price, .showcase-price, .price, span[class*="price"]').first().text().trim();
            let imageUrl = $(element).find('img').first().attr('src') || $(element).find('img').first().attr('data-src');

            if (name && rawPrice) {
                // تنظيف نصوص الأسعار وسحب القيمة الرقمية الحقيقية من موقع عليا لينا
                let numericPrice = parseFloat(rawPrice.replace(/[^0-9,.]/g, '').replace(',', '.'));
                
                if (!isNaN(numericPrice) && numericPrice > 0) {
                    // احتساب السعر النهائي للمستهلك شاملاً مربحك 15% وتقريب الكسور
                    const finalCustomerPrice = (numericPrice * (1 + profitMargin)).toFixed(2);
                    
                    // تصحيح روابط الصور الفعلية لتعرض صور المنتجات الحقيقية داخل التليجرام
                    if (imageUrl && !imageUrl.startsWith('http')) {
                        imageUrl = imageUrl.startsWith('/') ? `${ALYALINA_URL}${imageUrl}` : `${ALYALINA_URL}/${imageUrl}`;
                    }

                    // التحقق من عدم تكرار نفس المنتج داخل القائمة المسحوبة أونلاين
                    const isDuplicate = products.some(p => p.name === name);
                    if (!isDuplicate) {
                        products.push({
                            id: index + 1,
                            name: name,
                            customerPrice: finalCustomerPrice,
                            image: imageUrl || "https://alyalina.tr/images/logo.png"
                        });
                    }
                }
            }
        });

        return products;
    } catch (error) {
        console.error("خطأ أثناء كشط بيانات الموقع أونلاين ثانية بثانية:", error.message);
        return [];
    }
}

module.exports = { fetchLiveCatalog };
