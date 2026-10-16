const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json());

const TELEGRAM_BOT_TOKEN = '8987490001:AAF7bfhLoDfyzUtGzpVmTX9XnhUI2BX-X3A';
const TELEGRAM_CHAT_ID = '5164681538';

// Инициализация через конструктор по умолчанию
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

app.post('/api/support', async (req, res) => {
  try {
    const { message, category } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Пустое сообщение' });
    }

    const text = `📨 *Нове звернення в підтримку*\n\n📂 Категорія: ${category || 'Техпіддержка'}\n💬 Повідомлення: ${message}`;
    await bot.sendMessage(TELEGRAM_CHAT_ID, text, { parse_mode: 'Markdown' });

    res.json({ success: true });
  } catch (err) {
    console.error('Помилка відправки в Telegram:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});
