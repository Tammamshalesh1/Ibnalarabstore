const { Telegraf, Markup } = require('telegraf');
const { fetchLiveCatalog } = require('./scraper');
const express = require('express');

const bot = new Telegraf('8699605110:AAEtc3bfXi7X_2uas8Qz_7YB7QxirjUDdUI');

bot.start((ctx) => {
    ctx.reply('مرحباً بك في متجر أليالينا الرسمي! 🌸\nاختر القسم المطلوب لتصفح المنتجات الحية مباشرة من الحساب بأسعارها الحقيقية المحدثة:', 
        Markup.keyboard([
            ['🛍️ تصفح الكتالوج العام', '🔥 عروض وفرص حصرية']
        ]).resize()
    );
});

bot.hears('🛍️ تصفح الكتالوج العام', async (ctx) => {
    const products = await fetchLiveCatalog('catalog');
    if (!products || products.length === 0) return ctx.reply('❌ تعذر جلب المنتجات. تأكد من صحة بيانات الدخول في Render.');
    for (const product of products.slice(0, 15)) { await sendProductCard(ctx, product); }
});

bot.hears('🔥 عروض وفرص حصرية', async (ctx) => {
    const offers = await fetchLiveCatalog('offers');
    if (!offers || offers.length === 0) return ctx.reply('❌ لا توجد عروض حالية نشطة داخل الحساب الآن.');
    for (const product of offers.slice(0, 15)) { await sendProductCard(ctx, product); }
});

async function sendProductCard(ctx, product) {
    const caption = `📦 *${product.name}*\n\n💰 السعر الحالي للمستهلك: *${product.customerPrice} TL*\n_(شامل التحديث الحقيقي ومربحك 20%)_`;
    try {
        await ctx.replyWithPhoto(product.image, { caption: caption, parse_mode: 'Markdown', ...Markup.inlineKeyboard([Markup.button.callback('🛒 اطلب المنتج الآن', `order_${product.id}`)]) });
    } catch (err) {
        await ctx.reply(caption, { parse_mode: 'Markdown', ...Markup.inlineKeyboard([Markup.button.callback('🛒 اطلب المنتج الآن', `order_${product.id}`)]) });
    }
}

bot.action(/^order_(\d+)$/, async (ctx) => {
    const productId = ctx.match[1];
    ctx.answerCbQuery();
    const myWhatsAppNumber = "905366303897"; 
    const messageText = encodeURIComponent(`مرحباً، أود طلب المنتج رقم (${productId}) المعروض في بوت متجر أليالينا.`);
    const whatsappLink = `https://wa.me{myWhatsAppNumber}?text=${messageText}`;
    await ctx.reply(`👋 لتأكيد طلبك وتحديد عنوان التوصيل، يرجى الضغط هنا للتواصل معنا مباشرة:`, Markup.inlineKeyboard([Markup.button.url('💬 تأكيد الطلب عبر واتساب', whatsappLink)]));
});

bot.launch();
const app = express();
app.get('/', (req, res) => { res.send('السيرفر يعمل بكفاءة وأمان... 🚀'); });
app.listen(process.env.PORT || 10000);
