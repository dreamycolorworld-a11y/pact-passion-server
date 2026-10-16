const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json());

// Ваши данные, интегрированные в код сервера:
const TELEGRAM_BOT_TOKEN = '8987490001:AAF7bfhLoDfyzUtGzpVmTX9XnhUI2BX-X3A';
const TELEGRAM_CHAT_ID = '5164681538';

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// Обработчик запросов из игры (чат техподдержки)
app.post('/api/support', async (req, res) => {
  try {
    const { message, category } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Пустое сообщение' });
    }

    // Формируем красивое уведомление для вас в Telegram
    const text = `📨 *Нове звернення в підтримку*\n\n📂 Категорія: ${category || 'Техпіддержка'}\n💬 Повідомлення: ${message}`;

    // Отправляем в ваш личный чат Telegram
    await bot.sendMessage(TELEGRAM_CHAT_ID, text, { parse_mode: 'Markdown' });

    res.json({ success: true });
  } catch (err) {
    console.error('Помилка відправки в Telegram:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер технічної підтримки запущено на порту ${PORT}`);
});
