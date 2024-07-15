import { google } from 'googleapis';
import { sheets_v4 } from 'googleapis/build/src/apis/sheets/v4' 

// https://medium.com/@sakkeerhussainp/google-sheet-as-your-database-for-node-js-backend-a79fc5a6edd9
class GoogleSheetsStore {
  private serviceAccountKeyFile: string;
  private sheetId: string;
  private tabName: string;
  private range: string;
  private googleSheetClient: sheets_v4.Sheets | null;
  private googleAuthClient: any

  constructor() {
    this.serviceAccountKeyFile = "./introspectionbot-6cf1649eabb0.json";
    this.sheetId = ''
    this.tabName = 'chat_ids'
    this.range = 'A:E'
    this.googleSheetClient = null
  }

  async getGoogleSheetClient(): Promise<sheets_v4.Sheets> {
    if(this.googleSheetClient) {
      return this.googleSheetClient
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: this.serviceAccountKeyFile,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();

    this.googleSheetClient = google.sheets({
      version: 'v4',
      // auth: authClient,
    });
  
    return this.googleSheetClient
  }

  async readGoogleSheet(tabName:string) {
    await this.getGoogleSheetClient()

    const res = await this.googleSheetClient!.spreadsheets.values.get({
      spreadsheetId: this.sheetId,
      range: `${tabName}!${this.range}`,
      auth: this.googleAuthClient
    });
    // debugger
    return res.data.values;
  }

  async getRow(tabName:string, id: string): Promise<string[] | undefined> {
    this.getGoogleSheetClient()

    const data = await this.readGoogleSheet(tabName)
    return data?.find((row) => {return row[0] === id})
  }

  async updateRow(tabName:string, id:string, rowData:string[]) {
    this.getGoogleSheetClient()
    if (!this.googleSheetClient) return false // TODO: handle error

    const allRows = await this.readGoogleSheet(tabName)

    if (!allRows) return false // TODO: handle error

    const rowNumber = allRows.findIndex((row) => { return row[0] === id.toString()}) + 1 // sheets are 1 indexed

    if(rowNumber == 0){
      // for now I don't want to kill the server...
      console.log("!!! row not found")
    }
    
    console.log("updating", rowNumber)

    this.googleSheetClient.spreadsheets.values.batchUpdate({
      spreadsheetId: this.sheetId,
      auth: this.googleAuthClient,
      resource: {
        valueInputOption: "RAW",
        data: [
          {
            range: `A${rowNumber}:F${rowNumber}`,
            values: [rowData]
          }
        ]
      }
    })

  }


  // async writeGoogleSheet(tabName:string, data: string[][]) {
  //   await this.getGoogleSheetClient()
  //   if (!this.googleSheetClient) return false // TODO: handle error

  //   await this.googleSheetClient.spreadsheets.values.append({
  //     spreadsheetId: this.sheetId,
  //     auth: this.googleAuthClient,
  //     range: `${tabName}!${this.range}`,
  //     valueInputOption: 'USER_ENTERED',
  //     insertDataOption: 'INSERT_ROWS',
  //     resource: {
  //       "majorDimension": "ROWS",
  //       "values": data
  //     },
  //   })
  // }

} 
export default GoogleSheetsStore;
