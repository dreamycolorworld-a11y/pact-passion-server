const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(cors());
app.use(express.json());

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_BOT_TOKEN) {
  console.error("❌ КРИТИЧЕСКАЯ ОШИБКА: Переменная TELEGRAM_BOT_TOKEN не задана на сервере!");
} else {
  console.log("✅ Токен Telegram успешно обнаружен!");
}

// Включаем polling: true, чтобы бот слушал сообщения из Telegram
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN || "DUMMY_TOKEN", { polling: true });

// Хранилище связок: ID сообщения в боте -> Telegram ID игрока
// (В продакшене лучше использовать БД, но для начала сойдет и память сервера)
const activeChats = new Map();

app.post('/api/support', (req, res) => {
    const { message, category, user } = req.body;

    // Безопасно извлекаем данные, которые прислал фронтенд
    const userId = user?.id || 'Невідомо';
    const firstName = user?.firstName || 'Гість';
    const username = user?.username || 'немає';

    // Формируем текст для вашего Telegram-чата
    const notificationText = `📩 **Нове повідомлення підтримки!**\n\n` +
                           `👤 **Користувач:** ${firstName} (${username})\n` +
                           `🆔 **ID:** \`${userId}\`\n` +
                           `📂 **Категорія:** ${category}\n\n` +
                           `💬 **Повідомлення:**\n${message}`;

    // Отправляем вам в Telegram
    bot.sendMessage(YOUR_ADMIN_CHAT_ID, notificationText, { parse_mode: 'Markdown' })
      .then(() => {
          res.json({ success: true });
      })
      .catch(err => {
          console.error("Помилка надсилання в телеграм:", err);
          res.status(500).json({ success: false, error: err.message });
      });
});

// Слушаем входящие сообщения от вас в Telegram-боте
bot.on('message', async (msg) => {
  try {
    // Проверяем, что сообщение пришло от вас (из вашего чата поддержки) и это ответ на какое-то сообщение
    if (msg.chat.id.toString() === TELEGRAM_CHAT_ID.toString() && msg.reply_to_message) {
      const originalMessageId = msg.reply_to_message.message_id;
      const targetUserId = activeChats.get(originalMessageId);

      if (targetUserId) {
        // Отправляем ваш ответ игроку в личные сообщения в Telegram
        await bot.sendMessage(targetUserId, `💬 *Відповідь підтримки:*\n\n${msg.text}`, { parse_mode: 'Markdown' });
        await bot.sendMessage(TELEGRAM_CHAT_ID, '✅ Відповідь успішно надіслано гравцю!');
      } else {
        await bot.sendMessage(TELEGRAM_CHAT_ID, '⚠️ Не вдалося знайти гравця для цього повідомлення (можливо, сесія застаріла).');
      }
    }
  } catch (err) {
    console.error('Помилка при відправці відповіді гравцю:', err);
    await bot.sendMessage(TELEGRAM_CHAT_ID, `❌ Помилка: ${err.message}`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});
