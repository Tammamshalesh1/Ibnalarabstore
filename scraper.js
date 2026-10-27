const axios = require('axios');
const cheerio = require('cheerio');

// 🔐 ضع بيانات حسابك هنا بشكل صحيح لتسجيل الدخول الفعلي في الموقع
const ALYALINA_EMAIL = "TR96809466"; 
const ALYALINA_PASSWORD = "1234";

const ALYALINA_URL = "https://www.alyalina.tr";
const LOGIN_URL = "https://alyalina.tr";

// دالة عامة لجلب المنتجات بناءً على محتوى الصفحة بعد تسجيل الدخول
async function fetchLiveCatalog(targetType) {
    try {
        // إنشاء الجلسة وتكوين الروابط
        const session = axios.create({
            baseURL: ALYALINA_URL,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            withCredentials: true
        });

        // إرسال بيانات تسجيل الدخول لاستعادة الأسعار الحقيقية والعروض المخفية
        const loginData = new URLSearchParams({
            'txtEmail': ALYALINA_EMAIL,
            'txtPassword': ALYALINA_PASSWORD
        });
        await session.post(LOGIN_URL, loginData.toString());

        // جلب الصفحة الرئيسية لقراءة البيانات الحية
        const { data } = await session.get(ALYALINA_URL);
        const $ = cheerio.load(data);
        const products =;
        const profitMargin = 0.15; // نسبة ربحك الثابتة 15%

        // تحديد المستهدف بناءً على طلب المستخدم (عروض وفرص ممتازة أم منتجات عامة)
        let selector = '.product-item, .showcase, [class*="product-box"]';
        if (targetType === 'offers') {
            // استهداف قسم الفرص والعروض المحددة بالموقع (Muhteşem Fırsatlar)
            selector = '.product-item:contains("Fırsat"), .showcase:contains("İndirim"), div:contains("FIRSAT") .product-item';
        }

        $(selector).each((index, element) => {
            const name = $(element).find('.product-title, .product-name, .showcase-title, a').first().text().trim();
            let rawPrice = $(element).find('.product-price, .showcase-price, .price').first().text().trim();
            let imageUrl = $(element).find('img').first().attr('src') || $(element).find('img').first().attr('data-src');

            if (name && rawPrice) {
                // تنظيف السعر الحقيقي وتحويله لقمة رياضية
                let numericPrice = parseFloat(rawPrice.replace(/[^0-9,.]/g, '').replace(',', '.'));
                
                if (!isNaN(numericPrice) && numericPrice > 0) {
                    const finalCustomerPrice = (numericPrice * (1 + profitMargin)).toFixed(2);
                    
                    // تصحيح رابط الصورة الفعلي ليعرض الصورة الحقيقية للمنتج
                    if (imageUrl && !imageUrl.startsWith('http')) {
                        imageUrl = imageUrl.startsWith('/') ? `${ALYALINA_URL}${imageUrl}` : `${ALYALINA_URL}/${imageUrl}`;
                    }

                    products.push({
                        id: index + 1,
                        name: name,
                        customerPrice: finalCustomerPrice,
                        image: imageUrl
                    });
                }
            }
        });

        return products;
    } catch (error) {
        console.error("خطأ في الاتصال وجلب البيانات الحية:", error.message);
        return;
    }
}

module.exports = { fetchLiveCatalog };
