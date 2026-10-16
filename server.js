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

app.post('/api/support', async (req, res) => {
  try {
    const { message, category, user } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Пустое сообщение' });
    }

    const userName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Гість';
    const userHandle = user?.username || 'немає';
    const userId = user?.id || 'невідомо';

    const text = `📨 *Нове звернення в підтримку*\n\n` +
                 `📂 *Категорія:* ${category || 'Техпіддержка'}\n` +
                 `👤 *Гравець:* ${userName} (${userHandle})\n` +
                 `🆔 *ID користувача:* \`${userId}\`\n\n` +
                 `💬 *Повідомлення:*\n${message}`;

    // Отправляем сообщение в чат поддержки (вам)
    const sentMsg = await bot.sendMessage(TELEGRAM_CHAT_ID, text, { parse_mode: 'Markdown' });

    // Сохраняем привязку ID отправленного сообщения к ID игрока
    if (userId && userId !== 'невідомо') {
      activeChats.set(sentMsg.message_id, userId);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Помилка відправки в Telegram:', err);
    res.status(500).json({ success: false, error: err.message });
  }
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
