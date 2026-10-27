const axios = require('axios');
const cheerio = require('cheerio');

// رابط موقع شركة Alyalina الرسمي
const ALYALINA_URL = "https://alyalina.tr"; 

async function fetchAlyalinaProducts() {
    try {
        // جلب كود الـ HTML الخاص بالصفحة الرئيسية للموقع
        const { data } = await axios.get(ALYALINA_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        
        const $ = cheerio.load(data);
        const products = [];
        const profitMargin = 0.15; // هامش ربح 15%

        // استهداف عناصر المنتجات بناءً على الهيكلية القياسية للموقع
        $('.showcase, .product-item, [class*="product"]').each((index, element) => {
            const name = $(element).find('.showcase-title, .product-name, a').first().text().trim();
            let rawPrice = $(element).find('.showcase-price, .product-price, .price').first().text().trim();
            let imageUrl = $(element).find('img').first().attr('src') || $(element).find('img').first().attr('data-src');

            if (name && rawPrice) {
                // تنظيف نص السعر وتحويله إلى رقم عشري
                let numericPrice = parseFloat(rawPrice.replace(/[^0-30-9,.]/g, '').replace(',', '.'));
                
                if (!isNaN(numericPrice)) {
                    // احتساب السعر النهائي للزبون مع زيادة 15% تلقائياً
                    const finalCustomerPrice = (numericPrice * (1 + profitMargin)).toFixed(2);
                    
                    // تصحيح روابط الصور إذا كانت نسبية
                    if (imageUrl && !imageUrl.startsWith('http')) {
                        imageUrl = imageUrl.startsWith('/') ? `${ALYALINA_URL}${imageUrl}` : `${ALYALINA_URL}/${imageUrl}`;
                    }

                    products.push({
                        id: index + 1,
                        name: name,
                        originalPrice: numericPrice,
                        customerPrice: finalCustomerPrice,
                        image: imageUrl || "https://alyalina.tr/images/logo.png" // صورة بديلة في حال لم تتوفر
                    });
                }
            }
        });

        return products;
    } catch (error) {
        console.error("خطأ أثناء جلب المنتجات من موقع Alyalina تلقائياً:", error.message);
        return [];
    }
}

module.exports = {
    fetchAlyalinaProducts
};
