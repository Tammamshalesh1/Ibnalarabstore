const axios = require('axios');
const cheerio = require('cheerio');

const ALYALINA_URL = "https://alyalina.tr";
const LOGIN_URL = "https://alyalina.tr";

const EMAIL = process.env.ALYALINA_EMAIL;
const PASSWORD = process.env.ALYALINA_PASSWORD;

async function fetchLiveCatalog(targetType) {
    try {
        if (!EMAIL || !PASSWORD) {
            console.error("خطأ: يرجى ضبط ALYALINA_EMAIL و ALYALINA_PASSWORD في إعدادات Render أولاً.");
            return;
        }

        const session = axios.create({
            baseURL: ALYALINA_URL,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
            },
            withCredentials: true
        });

        const initResponse = await session.get(LOGIN_URL);
        const $init = cheerio.load(initResponse.data);

        const hiddenInputs = {};
        $init('form input[type="hidden"]').each((i, el) => {
            hiddenInputs[$init(el).attr('name')] = $init(el).attr('value');
        });

        const loginData = new URLSearchParams({
            ...hiddenInputs,
            'txtEmail': EMAIL,
            'txtPassword': PASSWORD
        });

        await session.post(LOGIN_URL, loginData.toString());

        const targetPage = targetType === 'offers' ? `${ALYALINA_URL}/uyekarsilama` : ALYALINA_URL;
        const { data } = await session.get(targetPage);
        const $ = cheerio.load(data);
        
        const products = []; // ✅ تم تصحيح هذا السطر وإضافة الأقواس المربعة ليعمل بدون أخطاء SyntaxError
        const profitMargin = 0.20; // نسبة مربحك 20%

        $('.product-item, .showcase, [class*="product-box"]').each((index, element) => {
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
                        image: imageUrl
                    });
                }
            }
        });

        return products;
    } catch (error) {
        console.error("خطأ أثناء الاتصال بالدخول الرسمي للموقع:", error.message);
        return [];
    }
}

module.exports = { fetchLiveCatalog };
