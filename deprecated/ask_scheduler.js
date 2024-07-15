const Bot = require("./telegram_client.js")
const DataStore = require("./datastore.js")

async function ask_questions() {
  console.log("checking question schedule")
  const bot = new Bot(false)
  const dataStore = new DataStore()

  const all_chats = await dataStore.get_all_user_rows()

  console.log("times:")
  console.log(new Date().toISOString())
  console.log(new Date(all_chats[0][1]).toISOString())
  const ready_chats = all_chats.filter( (chat) => { return new Date() > new Date(chat[1]) })

  ready_chats.forEach( (chat) => {
    bot.ask_random_question(chat[0])
    dataStore.set_last_ask_time(chat[0])
  })
}

const interval = 1000 * 60  // every minute
setInterval(ask_questions, interval)

