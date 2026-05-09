// ============================================
// MaveFlow - Google Sheets Service
// ============================================

import { google, sheets_v4 } from "googleapis";
import { getGoogleAuth } from "@/lib/google-client";
import { withGoogleRetry } from "@/lib/google-error";

export class SheetsService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  private async getClient(): Promise<sheets_v4.Sheets> {
    const auth = await getGoogleAuth(this.userId);
    return google.sheets({ version: "v4", auth });
  }

  /**
   * Creates a new spreadsheet.
   */
  async createSpreadsheet(title: string) {
    return withGoogleRetry(async () => {
      const sheets = await this.getClient();
      const res = await sheets.spreadsheets.create({
        requestBody: {
          properties: { title },
        },
      });
      return res.data;
    });
  }

  /**
   * Reads data from a specific range.
   */
  async readRange(spreadsheetId: string, range: string) {
    return withGoogleRetry(async () => {
      const sheets = await this.getClient();
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      return res.data.values;
    });
  }

  /**
   * Writes data to a specific range (overwrites).
   */
  async writeRange(spreadsheetId: string, range: string, values: any[][]) {
    return withGoogleRetry(async () => {
      const sheets = await this.getClient();
      const res = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        requestBody: { values },
      });
      return res.data;
    });
  }

  /**
   * Appends rows to a spreadsheet table.
   */
  async appendRows(spreadsheetId: string, range: string, values: any[][]) {
    return withGoogleRetry(async () => {
      const sheets = await this.getClient();
      const res = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values },
      });
      return res.data;
    });
  }

  /**
   * Formats a range of cells (e.g., bolding header rows).
   */
  async formatCells(spreadsheetId: string, sheetId: number, startRow: number, endRow: number, startCol: number, endCol: number, isBold: boolean = true) {
    return withGoogleRetry(async () => {
      const sheets = await this.getClient();
      const res = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: startRow,
                  endRowIndex: endRow,
                  startColumnIndex: startCol,
                  endColumnIndex: endCol,
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: { bold: isBold },
                  },
                },
                fields: "userEnteredFormat.textFormat.bold",
              },
            },
          ],
        },
      });
      return res.data;
    });
  }
}
