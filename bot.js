const { Telegraf, Markup } = require('telegraf');
const { fetchAlyalinaProducts } = require('./scraper');

// ضع هنا التوكن الخاص بالبوت الذي حصلت عليه من BotFather
const BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN'; 
const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
    ctx.reply('مرحباً بك في متجر منتجات Alyalina المؤتمت! 🌸\nاضغط على الزر أدناه لجلب أحدث المنتجات والأسعار المحدثة تلقائياً مع هامش الربح الخاص بك.', 
        Markup.keyboard([['🛍️ عرض كتالوج المنتجات الحالية']]).resize()
    );
});

bot.hears('🛍️ عرض كتالوج المنتجات الحالية', async (ctx) => {
    await ctx.reply('⏳ جاري الاتصال بموقع Alyalina وسحب أحدث الأسعار واحتساب نسبة الـ 15% تلقائياً...');
    
    const liveProducts = await fetchAlyalinaProducts();

    if (liveProducts.length === 0) {
        return ctx.reply('❌ عذراً، لم نتمكن من تحديث الأسعار من الموقع حالياً. يرجى المحاولة بعد قليل.');
    }

    // عرض أول 10 منتجات تم سحبها لمنع حظر البوت بسبب كثرة الرسائل دفعة واحدة
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
            // حل بديل في حال وجود مشكلة برابط الصورة المسحوبة من الموقع
            await ctx.reply(caption, {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    Markup.button.callback('🛒 اطلب المنتج الآن', `order_${product.id}`)
                ])
            });
        }
    }
});

// التعامل مع كبسولات الطلب الفورية
bot.action(/^order_(\d+)$/, (ctx) => {
    const productId = ctx.match[1];
    ctx.answerCbQuery();
    ctx.reply(`📝 تم تسجيل طلبك للمنتج رقم ${productId}. سيتم توجيهك لتأكيد الشحن والتوصيل.`);
});

bot.launch();
console.log('البوت متصل بموقع Alyalina ومستعد للعمل وتلقي الطلبات...');
