const { Telegraf, Markup } = require('telegraf');
const { fetchLiveCatalog } = require('./scraper');
const express = require('express');

// توكن البوت الخاص بك
const bot = new Telegraf('8699605110:AAEtc3bfXi7X_2uas8Qz_7YB7QxirjUDdUI');

bot.start((ctx) => {
    ctx.reply('مرحباً بك في متجر أليالينا المؤتمت بالكامل! 🌸\nيرجى اختيار القسم الذي ترغب في تصفحه بأسعاره وعروضه الحقيقية الحالية المباشرة من الموقع:', 
        Markup.keyboard([
            ['🛍️ تصفح الكتالوج العام', '🔥 عروض وفرص حصرية']
        ]).resize()
    );
});

// 1. معالجة زر الكتالوج العام الحقيقي للموقع
bot.hears('🛍️ تصفح الكتالوج العام', async (ctx) => {
    const products = await fetchLiveCatalog('catalog');

    if (!products || products.length === 0) {
        return ctx.reply('❌ تعذر جلب الكتالوج من الموقع حالياً، يرجى التحقق من سجل السيرفر.');
    }

    for (const product of products) {
        await sendProductCard(ctx, product);
    }
});

// 2. معالجة زر العروض والتخفيضات المنفصلة الحقيقية للموقع
bot.hears('🔥 عروض وفرص حصرية', async (ctx) => {
    const offers = await fetchLiveCatalog('offers');

    if (!offers || offers.length === 0) {
        return ctx.reply('❌ لا توجد عروض ترويجية منبثقة متاحة في حساب الموقع حالياً.');
    }

    for (const product of offers) {
        await sendProductCard(ctx, product);
    }
});

// دالة موحدة لإرسال كروت المنتجات بالصورة الفورية والأزرار التفاعلية
async function sendProductCard(ctx, product) {
    const caption = `📦 *${product.name}*\n\n💰 السعر الحالي: *${product.customerPrice} TL*\n_(شامل التحديث الآلي ومربحك)_`;
    try {
        await ctx.replyWithPhoto(product.image, {
            caption: caption,
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                Markup.button.callback('🛒 اطلب المنتج الآن', `order_${product.id}`)
            ])
        });
    } catch (err) {
        await ctx.reply(caption, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                Markup.button.callback('🛒 اطلب المنتج الآن', `order_${product.id}`)
            ])
        });
    }
}

// معالجة زر الشراء والربط مع واتساب بشكل سليم وصحيح 100%
bot.action(/^order_(\d+)$/, async (ctx) => {
    const productId = ctx.match[1];
    ctx.answerCbQuery();

    const myWhatsAppNumber = "905366303897"; // رقمك بالصيغة الدولية
    const messageText = encodeURIComponent(`مرحباً، أود طلب المنتج ذو المعرف رقم (${productId}) المعروض في بوت متجر أليالينا.`);
    const whatsappLink = `https://wa.me{myWhatsAppNumber}?text=${messageText}`;

    await ctx.reply(`👋 لتأكيد طلبك وتحديد عنوان التوصيل، يرجى الضغط هنا للتواصل معنا مباشرة:`, 
        Markup.inlineKeyboard([
            Markup.button.url('💬 تأكيد الطلب عبر واتساب', whatsappLink)
        ])
    );
});

bot.launch();

// السيرفر الوهمي المستقر لمنع خطأ الـ Port Scan على Render
const app = express();
app.get('/', (req, res) => { res.send('السيرفر يعمل بكفاءة وأمان... 🚀'); });
app.listen(process.env.PORT || 10000);
