const { Telegraf, Markup } = require('telegraf');
const { fetchAlyalinaProducts } = require('./scraper');
const express = require('express'); // استيراد مكتبة السيرفر الوهمي

// توكن البوت محاط بعلامات الاقتباس وجاهز تماماً
const bot = new Telegraf('8698192117:AAE6YUBg2XluoXe0nHVYlR5AFyGNFNEsv-k');

bot.start((ctx) => {
    ctx.reply('مرحباً بك في متجر منتجات Alyalina المؤتمت! 🌸\nاضغط على الزر أدناه لجلب أحدث المنتجات والأسعار المحدثة تلقائياً مع هامش الربح الخاص بك.', 
        Markup.keyboard([['🛍️ عرض كتالوج المنتجات الحالية']]).resize()
    );
});

bot.hears('🛍️ عرض كتالوج المنتجات الحالية', async (ctx) => {
    await ctx.reply('⏳ جاري الاتصال بموقع Alyalina وسحب أحدث الأسعار واحتساب نسبة الـ 15% تلقائياً...');
    
    const liveProducts = await fetchAlyalinaProducts();

    if (!liveProducts || liveProducts.length === 0) {
        return ctx.reply('❌ عذراً، لم نتمكن من تحديث الأسعار من الموقع حالياً. يرجى المحاولة بعد قليل.');
    }

    // عرض أول 10 منتجات تم سحبها لمنع حظر البوت
    const itemsToShow = liveProducts.slice(0, 10);

    for (const product of itemsToShow) {
        const caption = `📦 *${product.name}*\n\n💰 السعر الحالي للمستهلك: *${product.customerPrice} TL*\n_(شامل التحديث الآلي ومربحك)_`;
        
        try {
            await ctx.replyWithPhoto(product.image, {
                caption: caption,
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    Markup.button.callback('🛒 اطلب المنتج الآن', `order_${product.id}`)
                ])
            });
        } catch (imgError) {
            await ctx.reply(caption, {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    Markup.button.callback('🛒 اطلب المنتج الآن', `order_${product.id}`)
                ])
            });
        }
    }
});

// التعامل مع كبسولات الطلب الفورية وتحويلها لواتساب الأعمال الخاص بك
bot.action(/^order_(\d+)$/, async (ctx) => {
    const productId = ctx.match[1];
    ctx.answerCbQuery();

    const myWhatsAppNumber = "905366303897"; // رقمك بصيغته الدولية الصحيحة
    const messageText = encodeURIComponent(`مرحباً، أود طلب المنتج ذو المعرف الرقمي (${productId}) المعروض في بوت التليجرام الخاص بمتجر أليالينا.`);
    const whatsappLink = `https://wa.me{myWhatsAppNumber}?text=${messageText}`;

    await ctx.reply(`👋 لتأكيد طلبك وتحديد عنوان الشحن، يرجى الضغط على الرابط أدناه للتواصل معنا مباشرة عبر واتساب:`, 
        Markup.inlineKeyboard([
            Markup.button.url('💬 تأكيد الطلب عبر واتساب', whatsappLink)
        ])
    );
});

bot.launch();
console.log('البوت متصل بموقع Alyalina ومستعد للعمل وتلقي الطلبات...');

// -------------------------------------------------------------
// الجزء الخاص بالحل الثاني: إنشاء سيرفر وهمي لمنع انقطاع السيرفر (Port Binding)
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
   res.send('البوت يعمل بكفاءة وأمان في الخلفية... 🚀');
});

app.listen(PORT, () => {
   console.log(`تم تشغيل المنفذ الوهمي لـ Render بنجاح على المخرج: ${PORT}`);
});
