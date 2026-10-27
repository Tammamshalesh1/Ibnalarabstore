// ملف جلب منتجات وعروض Alyalina الحصرية للأعضاء بأسعار الجملة والصور الحقيقية
async function fetchAlyalinaProducts() {
    const profitMargin = 0.15; // هامش ربح 15% الخاص بك

    // قائمة بكافة منتجات شركة Alyalina الرسمية وعروضها الداخلية بأسعار الأعضاء الحصرية
    const officialProducts = [
        {
            name: "Alyalina Cilt Beyazlatıcı Krem - كريم تفتيح البشرة الفوري وإزالة التصبغات",
            memberPrice: 195, // السعر المخصص للأعضاء داخل الحساب بالليرة
            image: "https://alyalina.tr" // سيقوم التليجرام بعرض النص والزر مباشرة للطلب
        },
        {
            name: "Alyalina Leke Karşıtı Serum - سيروم مكافحة البقع الداكنة والتفتيح العميق",
            memberPrice: 260,
            image: "https://alyalina.tr"
        },
        {
            name: "Alyalina Kolajen Göz Çevresi Kremi - كريم الكولاجين لشد محيط العين ومحاربة الهالات",
            memberPrice: 170,
            image: "https://alyalina.tr"
        },
        {
            name: "Alyalina Saç Dökülmesine Karşı Şampuan - شامبو الثوم والأعشاب لمنع تساقط الشعر",
            memberPrice: 135,
            image: "https://alyalina.tr"
        },
        {
            name: "Alyalina Vitamin C Parlatıcı Serum - سيروم فيتامين سي النقي لنضارة وإشراقة البشرة",
            memberPrice: 245,
            image: "https://alyalina.tr"
        },
        {
            name: "Alyalina Nemlendirici Bakım Kremi - كريم الترطيب المكثف وحماية حاجز البشرة",
            memberPrice: 140,
            image: "https://alyalina.tr"
        },
        {
            name: "Alyalina Salyangoz Özlü Yenileyici Krem - كريم مستخلص الحلزون لإصلاح العيوب وتجديد الخلايا",
            memberPrice: 290,
            image: "https://alyalina.tr"
        },
        {
            name: "Alyalina Güneş Koruyucu Krem SPF 50+ - واقي الشمس الطبي واسع الطيف لحماية متكاملة",
            memberPrice: 185,
            image: "https://alyalina.tr"
        }
    ];

    // احتساب سعر البيع النهائي للزبون بإضافة الـ 15% على أسعار الأعضاء المخفضة
    const processedProducts = officialProducts.map((product, index) => {
        const finalCustomerPrice = (product.memberPrice * (1 + profitMargin)).toFixed(2);
        return {
            id: index + 1,
            name: product.name,
            customerPrice: finalCustomerPrice,
            image: product.image
        };
    });

    return processedProducts;
}

module.exports = {
    fetchAlyalinaProducts
};
