const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // если используешь старую Node.js, в Node 18+ fetch встроен по умолчанию

const app = express();
app.use(express.json());
app.use(cors()); // чтобы игра могла делать запросы без блокировок CORS

// Твой токен от BotFather
const TELEGRAM_BOT_TOKEN = '8987490001:AAF7bfhLoDfyzUtGzpVmTX9XnhUI2BX-X3A';
// Твой Telegram Chat ID (узнай через @userinfobot и подставь сюда)
const MY_CHAT_ID = 'Id: 5164681538';

app.post('/api/support', async (req, res) => {
  const { message, category } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: 'Пустое сообщение' });
  }

  const text = `📩 Новое обращение в техподдержку!\n\nКатегория: ${category || 'Общее'}\nТекст: ${message}`;

  try {
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: MY_CHAT_ID,
        text: text
      })
    });

    const data = await response.json();
    if (data.ok) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: data.description });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер техподдержки запущен на порту ${PORT}`);
});
