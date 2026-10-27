const axios = require('axios');
const cheerio = require('cheerio');

// 🔐 ضع بيانات حسابك في موقع Alyalina هنا لتسجيل الدخول التلقائي وجلب العروض المخفية
const ALYALINA_EMAIL = "TR96809466"; 
const ALYALINA_PASSWORD = "1234";

const ALYALINA_URL = "https://alyalina.tr";
const LOGIN_URL = "https://alyalina.tr/uye-girisi"; // رابط تسجيل الدخول للموقع

async function fetchAlyalinaProducts() {
    try {
        // 1. إنشاء حاوية للاحتفاظ بملفات تعريف الجلسة (Cookies)
        const session = axios.create({
            baseURL: ALYALINA_URL,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            withCredentials: true // تفعيل ميزة الاحتفاظ بالجلسة
        });

        // 2. إرسال طلب تسجيل الدخول التلقائي إلى السيرفر كعضو
        const loginData = new URLSearchParams({
            'txtEmail': ALYALINA_EMAIL,
            'txtPassword': ALYALINA_PASSWORD
        });

        await session.post(LOGIN_URL, loginData.toString());
        console.log("تم تسجيل الدخول بنظام العضوية وسحب الجلسة بنجاح...");

        // 3. جلب الصفحة الرئيسية أو صفحة العروض الخاصة بعد تسجيل الدخول بنفس الجلسة
        const { data } = await session.get(ALYALINA_URL);
        const $ = cheerio.load(data);
        const products = [];
        const profitMargin = 0.15; // نسبة ربحك 15%

        // 4. كشط المنتجات والعروض الحصرية والصور الحقيقية
        $('.product-item, .showcase, [class*="product-box"], .item-grid div').each((index, element) => {
            const name = $(element).find('.product-title, .product-name, .showcase-title, a').first().text().trim();
            let rawPrice = $(element).find('.product-price, .showcase-price, .price').first().text().trim();
            let imageUrl = $(element).find('img').first().attr('src') || $(element).find('img').first().attr('data-src');

            if (name && rawPrice) {
                let numericPrice = parseFloat(rawPrice.replace(/[^0-9,.]/g, '').replace(',', '.'));
                
                if (!isNaN(numericPrice) && numericPrice > 0) {
                    const finalCustomerPrice = (numericPrice * (1 + profitMargin)).toFixed(2);
                    
                    if (imageUrl && !imageUrl.startsWith('http')) {
                        imageUrl = imageUrl.startsWith('/') ? `${ALYALINA_URL}${imageUrl}` : `${ALYALINA_URL}/${imageUrl}`;
                    }

                    products.push({
                        id: index + 1,
                        name: name,
                        customerPrice: finalCustomerPrice,
                        image: imageUrl || "https://alyalina.tr/images/logo.png"
                    });
                }
            }
        });

        return products;
    } catch (error) {
        console.error("خطأ أثناء جلب عروض الأعضاء الحصرية:", error.message);
        return [];
    }
}

module.exports = {
    fetchAlyalinaProducts
};
