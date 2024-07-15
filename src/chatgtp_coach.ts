import OpenAI from 'openai';
import DataStore from "./datastore"
import dotenv from "dotenv"

class ChatGPTCoach {
  private openai: OpenAI
  private dataStore: DataStore

  constructor() {
    dotenv.config()

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY as string 
    });
    this.dataStore = new DataStore()
  }

  async advice(chat_id: string):Promise<string> {
    
    const prompt = await this.prompt(chat_id)

    const chatCompletion = await this.openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4o',
    });
    
    return chatCompletion.choices[0]?.message?.content || "sorry, chatgtp failed"
  }

  async collected_answers(chat_id: string):Promise<string> {
    // TODO: only get the last 100 or so answers, or maybe answers from the last X days?
    const answers = await this.dataStore.get_answers(chat_id)

    return answers.map((answer) => {
      return `question: '${answer.fields.question}', answer: '${answer.fields.answer}'`
    }).join("\n")
  }

  async prompt(chat_id: string):Promise<string> {
    const answers_prompt = await this.collected_answers(chat_id)

    // const prompt_question = "given someone gave these answers to introspection questions, what follow up introspections could they answer? \n" +
    const prompt_question = "given someone gave these answers to introspection questions, what are 5 general coaching questions could I ask them? \n"
    // const prompt_format = "use telegram MarkdownV2 format\n"
    // const js_array_prompt = "format the questions as a javascript array of strings, with no other text before or after, eg: ['question 1?', 'question 2?'] \n"
    const prompt_format = "format the text using only the following html tags: <b>, <i>, <em>, <u>"

    return prompt_question +prompt_format + answers_prompt
  }
}

export default ChatGPTCoach;