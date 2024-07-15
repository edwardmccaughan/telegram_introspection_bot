import Bot from "./src/bot"
import { CallbackQuery, Message } from "node-telegram-bot-api";

const bot = new Bot(true)
bot.tg_bot.on('callback_query', (callback: CallbackQuery) => bot.callback_handler(callback));
bot.tg_bot.on('message', (msg: Message) => bot.message_handler(msg));

console.log("index running")
