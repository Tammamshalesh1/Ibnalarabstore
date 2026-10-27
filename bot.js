const { Telegraf, Markup } = require('telegraf');
const { fetchAlyalinaProducts } = require('./scraper');
const express = require('express');

// توكن البوت الخاص بك
const bot = new Telegraf('8699605110:AAFrHXMy_TmDc97wN4-Yb6_5FfUqyKv-1YM');

bot.start((ctx) => {
    ctx.reply('مرحباً بك في متجر منتجات Alyalina المؤتمت! 🌸\nاضغط على الزر أدناه لجلب أحدث المنتجات والأسعار المحدثة تلقائياً مع هامش الربح الخاص بك.', 
        Markup.keyboard([['🛍️ عرض كتالوج المنتجات الحالية']]).resize()
    );
});

bot.hears('🛍️ عرض كتالوج المنتجات الحالية', async (ctx) => {
    // ❌ تم حذف رسالة التحميل والانتظار تماماً بناءً على طلبك لراحة زبائنك
    
    const liveProducts = await fetchAlyalinaProducts();

    if (!liveProducts || liveProducts.length === 0) {
        return ctx.reply('❌ عذراً، لم نتمكن من تحديث الأسعار من الموقع حالياً. يرجى المحاولة بعد قليل.');
    }

    // تم تعديل الكود ليعرض جميع المنتجات التي يتم سحبها من الموقع دون تقييدها بـ 10 أو 3 فقط
    for (const product of liveProducts) {
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
            // حل احتياطي في حال واجه التليجرام مشكلة في قراءة رابط الصورة ليظهر النص والأزرار للعميل دائماً
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

    const myWhatsAppNumber = "905366303897"; // رقمك بصيغته الدولية
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
// خادم Express الوهمي لإرضاء منصة Render ومنع خطأ الـ Port Scan
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
   res.send('البوت يعمل بكفاءة وأمان في الخلفية... 🚀');
});

app.listen(PORT, () => {
   console.log(`تم تشغيل المنفذ الوهمي لـ Render بنجاح على المخرج: ${PORT}`);
});
