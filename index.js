require('dotenv').config();
const TelegramApi = require('node-telegram-bot-api');
const { gameOptions, againOptions } = require('./options');

const token = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramApi(token, { polling: true });

const chats = {};

const startGame = async (chatId) => {
  await bot.sendMessage(chatId, `Сейчас я загадаю число от 0 до 9`);
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, 'Ну все отгадывай', gameOptions);
};

const start = () => {
  bot.setMyCommands([
    { command: '/start', description: 'Начальное приветствие' },
    { command: '/info', description: 'Говорит твое имя' },
    { command: '/game', description: 'Сыграем в игру?' },
  ]);

  bot.on('message', async (msg) => {
    console.log(msg);
    const text = msg.text;
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, `Ты написал мне ${text}`);
    if (text === '/start') {
      await bot.sendSticker(
        chatId,
        'https://tlgrm.ru/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/7.webp'
      );
      return bot.sendMessage(chatId, 'Хрен тебе а не старт!');
    }

    if (text.trim() === '/info') {
      return bot.sendMessage(
        chatId,
        `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}`
      );
    }

    if (text.trim() === '/game') {
      return startGame(chatId);
    }

    await bot.sendMessage(chatId, `Я не знаю такой команды`);
  });

  bot.on('callback_query', async (msg) => {
    console.log(msg);
    console.log(chats);
    const data = msg.data;
    const chatId = msg.message.chat.id;
    await bot.sendMessage(chatId, `Ты выбрал ${data}`);

    if (data.trim() == '/again') {
      return startGame(chatId);
    }

    if (data == chats[chatId]) {
      await bot.sendMessage(
        chatId,
        `На этот раз тебе повезло, число верное`,
        againOptions
      );
    } else {
      await bot.sendMessage(
        chatId,
        `Не угадал, правильный ответ был ${chats[chatId]}`,
        againOptions
      );
    }
  });
};

start();
