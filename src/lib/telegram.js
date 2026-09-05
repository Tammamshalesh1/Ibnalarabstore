export async function sendTelegramNotification(message) {
  const BOT_TOKEN = env("8698192117:AAE6YUBg2XluoXe0nHVYlR5AFyGNFNEsv-k");
  const CHAT_ID = env("2075224048"); // معرف الشات الخاص بك أو بجروب الإدارة للموقع

  const url = `https://telegram.org{BOT_TOKEN}/sendMessage`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });
  } catch (error) {
    console.error("فشل إرسال الإشعار إلى بوت التلجرام:", error);
  }
}
