class Chat {
  static table_name: string = "chat_ids";
  chat_id: string;
  next_ask_time: string;

  constructor(sheet_row: string[]) {
    this.chat_id = sheet_row[0];
    this.next_ask_time = sheet_row[1];
  }

  row_data(): string[] {
    return [this.chat_id,this.next_ask_time]
  }
} 

export default Chat;
