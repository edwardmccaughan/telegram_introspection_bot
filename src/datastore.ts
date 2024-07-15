import HolySheets from "holysheets"
import GoogleCredentials from "../google_sheets_auth.json"
import { SheetRecord } from "./holysheets_helper";
import { Chat, Answer } from "./datastore_interfaces";
import GoogleSheets from "./google_sheets";
import dotenv from 'dotenv'
import _ from "lodash";

class DataStore {
  private holySheets: HolySheets
  private chatSheet: HolySheets<Chat>
  private answerSheet: HolySheets<Answer>

  constructor() {
    dotenv.config()

    this.holySheets = new HolySheets({
      spreadsheetId: process.env.SPREADSHEET_ID as string,
      clientEmail:  GoogleCredentials.client_email,
      privateKey: GoogleCredentials.private_key
    })
    this.chatSheet = this.holySheets.base<Chat>('Chats')
    this.answerSheet = this.holySheets.base<Answer>('Answers')
  }

  async get_all_chats(): Promise<SheetRecord<Chat>[]>{
    // holysheets doesn't seem to support findAll, so just get all chats that aren't the header row
    return this.chatSheet.findMany({ where: { chat_id: { not: 'chat_id' } }}) 
  }

  async get_chat(chat_id: string) : Promise<SheetRecord<Chat> | undefined> { 
    return this.chatSheet.findFirst({where: { chat_id: chat_id}})
  }

  async add_new_chat(chat_id: string){
    await this.chatSheet.insert({data: [{ chat_id: chat_id,  last_ask_time: '', last_question: ''}]});
  }

  async add_answer_to_last_question(chat_id: string, answer: string) {
    if (chat_id != process.env.TEST_TELEGRAM_CHAT_ID) { return } // for now only do this to my own user
    
    const chat  = await this.get_chat(chat_id) 
    const question = chat?.fields.last_question as string
    this.add_answer(chat_id, question, answer)  
  }

  async add_answer(chat_id: string, question: string, answer: string) {
    const data = {
      chat_id: chat_id,
      question: question,
      answer: answer,
      created_at: new Date().toISOString()
    }
    await this.answerSheet.insert({data: [data]})
  }

  async get_answers(chat_id: string) {
    const answerSheet = this.holySheets.base<Answer>('Answers')
    return answerSheet.findMany({where: { chat_id: chat_id}})
  }

  async set_last_ask_time(chat_id: string){
    console.log("updating last ask time")
    await this.update_question(chat_id, new Date().toISOString(), undefined)
  }

  // Note: holysheets.updateFirst seems to be bugged, so do a manual google sheets call
  async update_question(chat_id: string, last_ask_time?: string, question?: string) {
    const chatRecord = await this.get_chat(chat_id)
    if(!chatRecord) { 
      console.log("!!! chat not found", chat_id) // TODO: error handling
      return
    }

    const values = [
      chat_id,
      last_ask_time || chatRecord.fields.last_ask_time,
      question || chatRecord.fields.last_question
    ] as string[]

    await new GoogleSheets().update_record(chatRecord, values)
  }
} 

export default DataStore;