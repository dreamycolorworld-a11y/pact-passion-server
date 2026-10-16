const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json());

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_BOT_TOKEN) {
  console.error("❌ КРИТИЧЕСКАЯ ОШИБКА: Переменная TELEGRAM_BOT_TOKEN не задана на сервере!");
} else {
  console.log("✅ Токен Telegram успешно обнаружен!");
}

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN || "DUMMY_TOKEN", { polling: false });

app.post('/api/support', async (req, res) => {
  try {
    const { message, category, user } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Пустое сообщение' });
    }

    // Формуємо гарне ім'я та дані користувача
    const userName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Гість';
    const userHandle = user?.username || 'немає';
    const userId = user?.id || 'невідомо';

    // Формуємо текст повідомлення для бота
    const text = `📨 *Нове звернення в підтримку*\n\n` +
                 `📂 *Категорія:* ${category || 'Техпіддержка'}\n` +
                 `👤 *Гравець:* ${userName} (${userHandle})\n` +
                 `🆔 *ID користувача:* \`${userId}\`\n\n` +
                 `💬 *Повідомлення:*\n${message}`;

    await bot.sendMessage(TELEGRAM_CHAT_ID, text, { parse_mode: 'Markdown' });

    res.json({ success: true });
  } catch (err) {
    console.error('Помилка відправки в Telegram:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Обязательный блок запуска сервера, чтобы приложение не выключалось!
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});
