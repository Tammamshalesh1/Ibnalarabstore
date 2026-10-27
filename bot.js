const { Telegraf, Markup } = require('telegraf');
const { fetchAlyalinaProducts } = require('./scraper');
const express = require('express');

const bot = new Telegraf('8699605110:AAFrHXMy_TmDc97wN4-Yb6_5FfUqyKv-1YM');

bot.start((ctx) => {
    ctx.reply('مرحباً بك في متجر منتجات Alyalina الحصري! 🌸\nاضغط على الزر أدناه لعرض كافة المنتجات والعروض الحالية الحية.', 
        Markup.keyboard([['🛍️ عرض كتالوج المنتجات الحالية']]).resize()
    );
});

bot.hears('🛍️ عرض كتالوج المنتجات الحالية', async (ctx) => {
    const liveProducts = await fetchAlyalinaProducts();

    if (!liveProducts || liveProducts.length === 0) {
        return ctx.reply('❌ عذراً، لم نتمكن من جلب العروض الحالية من حساب الموقع الآن. يرجى المحاولة لاحقاً.');
    }

    for (const product of liveProducts) {
        const caption = `📦 *${product.name}*\n\n💰 السعر للمستهلك: *${product.customerPrice} TL*\n_(محدث تلقائياً مع نسبة ربحك)_`;
        
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

bot.action(/^order_(\d+)$/, async (ctx) => {
    const productId = ctx.match[1];
    ctx.answerCbQuery();

    const myWhatsAppNumber = "905366303897"; 
    const messageText = encodeURIComponent(`مرحباً، أود طلب المنتج ذو المعرف الرقمي (${productId}) من بوت التليجرام.`);
    const whatsappLink = `https://wa.me{myWhatsAppNumber}?text=${messageText}`;

    await ctx.reply(`👋 لتأكيد طلبك وتحديد عنوان الشحن، يرجى التواصل معنا مباشرة عبر واتساب:`, 
        Markup.inlineKeyboard([
            Markup.button.url('💬 تأكيد الطلب عبر واتساب', whatsappLink)
        ])
    );
});

bot.launch();

const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => { res.send('السيرفر يعمل بكفاءة وأمان... 🚀'); });
app.listen(PORT);
