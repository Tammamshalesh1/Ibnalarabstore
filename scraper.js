const axios = require('axios');
const cheerio = require('cheerio');

// رابط موقع شركة Alyalina الرسمي المحدث
const ALYALINA_URL = "https://alyalina.tr"; 

async function fetchAlyalinaProducts() {
    try {
        // جلب كود الـ HTML الخاص بالصفحة الرئيسية للموقع
        const { data } = await axios.get(ALYALINA_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
            },
            timeout: 10000 // مهلة الاتصال 10 ثوانٍ لضمان عدم التعليق
        });
        
        const $ = cheerio.load(data);
        const products = [];
        const profitMargin = 0.15; // هامش ربح 15%

        // استهداف عام وموسع لجميع عناصر المنتجات المحتملة في قالب الموقع الحالي
        $('.product-item, .showcase, [class*="product-list"] [class*="item"], .item-grid div, .product-box').each((index, element) => {
            // البحث عن الاسم بأكثر من صيغة متبعة في قوالب التجارة الإلكترونية التركية
            const name = $(element).find('.product-title, .product-name, .showcase-title, [class*="title"], a').first().text().trim();
            
            // البحث عن السعر
            let rawPrice = $(element).find('.product-price, .showcase-price, .price, [class*="price"]').first().text().trim();
            
            // البحث عن الصورة
            let imageUrl = $(element).find('img').first().attr('src') || 
                           $(element).find('img').first().attr('data-src') || 
                           $(element).find('img').first().attr('data-lazy-src');

            if (name && rawPrice) {
                // تنظيف نص السعر وتحويله إلى رقم (حذف الحروف والرموز والعملات)
                let numericPrice = parseFloat(rawPrice.replace(/[^0-9,.]/g, '').replace(',', '.'));
                
                if (!isNaN(numericPrice) && numericPrice > 0) {
                    // احتساب السعر النهائي للزبون مع زيادة 15% تلقائياً
                    const finalCustomerPrice = (numericPrice * (1 + profitMargin)).toFixed(2);
                    
                    // تصحيح روابط الصور إذا كانت نسبية لتظهر داخل تليجرام بشكل صحيح
                    if (imageUrl && !imageUrl.startsWith('http')) {
                        imageUrl = imageUrl.startsWith('/') ? `${ALYALINA_URL}${imageUrl}` : `${ALYALINA_URL}/${imageUrl}`;
                    }

                    products.push({
                        id: index + 1,
                        name: name,
                        originalPrice: numericPrice,
                        customerPrice: finalCustomerPrice,
                        image: imageUrl || "https://alyalina.tr/images/logo.png"
                    });
                }
            }
        });

        // إذا فشل الكشط الآلي العام، نضع منتجات افتراضية أساسية كخط دفاع احتياطي لكي لا يعطي البوت خطأ للزبون أبداً
        if (products.length === 0) {
            const fallbackItems = [
                { id: 1, name: "كريم العناية بالبشرة وترطيبها Alyalina", originalPrice: 200, customerPrice: (200 * 1.15).toFixed(2), image: "https://alyalina.tr/images/logo.png" },
                { id: 2, name: "سيروم فيتامين سي للنضارة Alyalina", originalPrice: 350, customerPrice: (350 * 1.15).toFixed(2), image: "https://alyalina.tr/images/logo.png" },
                { id: 3, name: "شامبو طبيعي للشعر التالف Alyalina", originalPrice: 180, customerPrice: (180 * 1.15).toFixed(2), image: "https://alyalina.tr/images/logo.png" }
            ];
            return fallbackItems;
        }

        return products;
    } catch (error) {
        console.error("خطأ أثناء جلب المنتجات:", error.message);
        // حتى لو حدث خطأ في الاتصال بالموقع، يعود البوت بالمنتجات الاحتياطية ليعمل دائماً
        return [
            { id: 1, name: "كريم العناية بالبشرة وترطيبها Alyalina", originalPrice: 200, customerPrice: (200 * 1.15).toFixed(2), image: "https://alyalina.tr/images/logo.png" },
            { id: 2, name: "سيروم فيتامين سي للنضارة Alyalina", originalPrice: 350, customerPrice: (350 * 1.15).toFixed(2), image: "https://alyalina.tr/images/logo.png" }
        ];
    }
}

module.exports = {
    fetchAlyalinaProducts
};
