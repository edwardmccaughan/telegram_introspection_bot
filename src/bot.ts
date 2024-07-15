import TelegramBot from 'node-telegram-bot-api';
import ChatGPTCoach from "./chatgtp_coach";
import { CallbackQuery, Message } from "node-telegram-bot-api";
import DataStore from "./datastore";
import Questions from './questions';
import dotenv from "dotenv"

class Bot {
  public tg_bot: TelegramBot
  private token: string
  private dataStore: DataStore

  constructor(polling: boolean) {
    dotenv.config()

    this.token = process.env.TELEGRAM_TOKEN as string; 
    this.tg_bot = new TelegramBot(this.token, { polling: polling })
    this.dataStore = new DataStore()
  }

  async callback_handler(callback: CallbackQuery) {
    if (!callback.message || !callback.data) return;
    
    const chat_id = callback.message.chat.id.toString()
  
    console.log("callback:", chat_id, callback.data)

    if(callback.data === "different_question"){
      this.ask_random_question(chat_id)
    } else if (callback.data === "ask_later") {
      await this.dataStore.set_last_ask_time(chat_id)
    } else if (callback.data === "other_options") {
      await this.show_other_options(chat_id)
    } else if (callback.data === "advice") {
      await this.send_advice(chat_id)
    }
  }

  async message_handler(msg: Message) {
    console.log("received", msg.chat.id, msg.text)

    await this.dataStore.add_answer_to_last_question(msg.chat.id.toString(), msg.text as string)
  }

  async ask_random_question(chat_id: string) { 
    console.log("asking?")
    const new_question = new Questions().random_question(); 
    await this.ask_question(chat_id, new_question)
  }


  ask_question_buttons() {
    const ask_again_button = {
      text: 'ask me again later',
      callback_data: 'ask_later'
    }
    const different_question_button = {
      text: 'ask me a different question',
      callback_data: 'different_question'
    }
    const other_options_button = {
      text: 'other options',
      callback_data: 'other_options'
    }

    return [ask_again_button, different_question_button ,other_options_button]
  }

  async ask_question(chat_id: string, question: string) {
    this.tg_bot.sendMessage(chat_id, question, {
      reply_markup: {
          inline_keyboard: [ this.ask_question_buttons()]
      }
    });

    await this.dataStore.update_question(chat_id, new Date().toISOString(), question)
  }

  show_other_options(chat_id: string) {
    const advice_button = {
      text: 'give me some advice',
      callback_data: 'advice'
    }

    this.tg_bot.sendMessage(chat_id, "here's some other things you can do:", {
      reply_markup: {
          inline_keyboard: [[advice_button]]
      }
    });
  }

  async send_advice(chat_id: string) {
    this.tg_bot.sendMessage(chat_id, "let me think for a second...")
    const chatGPTCoach = new ChatGPTCoach()
    const message = await chatGPTCoach.advice(chat_id)
    this.tg_bot.sendMessage(chat_id, message, {parse_mode: 'HTML'})
  }
} 

export default Bot;
