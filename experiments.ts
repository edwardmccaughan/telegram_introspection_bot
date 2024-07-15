import DataStore from "./src/datastore"

async function main() {
  const dataStore = new DataStore()
  await dataStore.get_all_chats()
}

main()

