import Bot from "./bot"
import DataStore from "./datastore"
import moment from "moment"
import { SheetRecord } from "./holysheets_helper";
import { Chat } from "./datastore_interfaces";

class AskScheduler {
  private bot: Bot;
  private dataStore: DataStore;

  constructor() {
    this.bot = new Bot(false);
    this.dataStore = new DataStore();
  }
  
  async ask_ready_chats(){
    const ready_chats = await this.chats_ready_to_ask()  
  
    ready_chats.forEach(async (chat) => {
      if(!chat.fields.chat_id) return // TODO: could probably cast to an interface
  
      console.log("asking", chat.fields.chat_id)
  
      this.bot.ask_random_question(chat.fields.chat_id)
    });
  }

  async chats_ready_to_ask(): Promise<SheetRecord<Chat>[]> {
    const chats = await this.dataStore.get_all_chats()
    
    console.log("times:")
    console.log(moment().subtract(1, 'hours'))
    
    return chats.filter( (chat) => {  
      const is_ready = this.is_ready(chat)
      console.log(moment(chat.fields.last_ask_time), chat.fields.chat_id, is_ready)
  
      return is_ready
    })
  }

  is_ready(chat: SheetRecord<Chat>):boolean {
    return moment(chat.fields.last_ask_time).isBefore(moment().subtract(24, 'hours'));
  }
}

export default AskScheduler;