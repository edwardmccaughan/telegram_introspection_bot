import { sheets_v4 } from 'googleapis'
import { google } from 'googleapis'
import { JWT } from 'google-auth-library'
import GoogleCredentials from "../google_sheets_auth.json"
import { SheetRecord } from "./holysheets_helper";
import { Chat, Answer } from "./datastore_interfaces";
import dotenv from 'dotenv'

class GoogleSheets {
  private sheets: sheets_v4.Sheets
  private spreadsheetId: string

  constructor() {
    dotenv.config()

    const auth = new JWT({
      email: GoogleCredentials.client_email,
      key: GoogleCredentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })

    this.spreadsheetId = process.env.SPREADSHEET_ID as string,

    this.sheets = google.sheets({ version: 'v4', auth })
   }

  async update_record(record: SheetRecord<Chat>|SheetRecord<Answer>, values: string[]) {
    const request = {
      spreadsheetId: this.spreadsheetId,
      resource: {
        data: [
          {
            range: record?.range,
            values: [values],
          }
        ],
        valueInputOption: 'RAW'
      }
    } 
    await this.sheets.spreadsheets.values.batchUpdate(request) 
  }
}

export default GoogleSheets