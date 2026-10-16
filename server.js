const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.d:AAF7bfhLoDfyzUtGzpVmTX9XnhUI2BX-X3A;
const bot = new TelegramBot(token, { polling: false });

app.post('/api/support', async (req, res) => {
  try {
    const { message, category } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Пустое сообщение' });
    }

    // Формируем текст для вас в Telegram
    const text = `📨 *Новое обращение в поддержку*\n\n📂 Категория: ${category}\n💬 Текст: ${message}`;

    // Отправляем вам в личные сообщения
    await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });

    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка отправки в Telegram:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
