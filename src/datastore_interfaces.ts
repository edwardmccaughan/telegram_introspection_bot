export interface Chat extends Record<string, string> {
  chat_id: string
  last_ask_time: string
  last_question: string
}

export interface Answer extends Record<string, string> {
  chat_id: string
  question: string
  answer: string
  created_at: string
}
