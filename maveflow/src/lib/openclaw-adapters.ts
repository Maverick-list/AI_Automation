// ============================================
// MaveFlow - OpenClaw Action Adapters
// ============================================
// Registry pattern to bridge OpenClaw's AI Intent outputs 
// with actual Google Workspace API executions.

import { GmailService } from "@/services/google/gmail";
import { CalendarService } from "@/services/google/calendar";
import { DriveService } from "@/services/google/drive";
import { TasksService } from "@/services/google/tasks";
import { SheetsService } from "@/services/google/sheets";

export type AdapterFunction = (userId: string, parameters: Record<string, any>) => Promise<any>;

class ActionRegistry {
  private adapters: Map<string, AdapterFunction> = new Map();

  /**
   * Register a new adapter mapping an intent string to an execution function.
   */
  register(intent: string, handler: AdapterFunction) {
    this.adapters.set(intent, handler);
  }

  /**
   * Execute an intent securely.
   */
  async execute(intent: string, userId: string, parameters: Record<string, any>): Promise<any> {
    const handler = this.adapters.get(intent);
    if (!handler) {
      throw new Error(`Unsupported OpenClaw intent: '${intent}'`);
    }

    try {
      console.log(`[Adapter] Executing intent '${intent}' for user ${userId}...`);
      return await handler(userId, parameters);
    } catch (error: any) {
      console.error(`[Adapter] Execution failed for intent '${intent}':`, error);
      throw new Error(`Action Execution Failed: ${error.message}`);
    }
  }

  hasAdapter(intent: string): boolean {
    return this.adapters.has(intent);
  }
}

// ── Instantiate Registry ────────────────────────────────────────

export const openClawAdapters = new ActionRegistry();

// ── Register Default Google Adapters ────────────────────────────

// 1. Gmail: Send Email
openClawAdapters.register("send_email", async (userId, params) => {
  const { to, subject, body, isHtml } = params;
  if (!to || !subject || !body) throw new Error("Missing required parameters: 'to', 'subject', or 'body'");
  
  const gmail = new GmailService(userId);
  const toArray = Array.isArray(to) ? to : [to];
  
  return await gmail.sendEmail(toArray, subject, body, isHtml || false);
});

// 2. Calendar: Create Event
openClawAdapters.register("create_event", async (userId, params) => {
  const { summary, start, end, description, location, attendees } = params;
  if (!summary || !start || !end) throw new Error("Missing required parameters: 'summary', 'start', 'end'");

  const calendar = new CalendarService(userId);
  return await calendar.createEvent({
    summary,
    description,
    location,
    start: { dateTime: start },
    end: { dateTime: end },
    attendees
  });
});

// 3. Drive: Save to Drive
openClawAdapters.register("save_to_drive", async (userId, params) => {
  const { fileName, content, mimeType, parentId } = params;
  if (!fileName || !content) throw new Error("Missing required parameters: 'fileName', 'content'");

  const buffer = Buffer.from(content, "utf-8"); // Assuming text content sent by AI
  const drive = new DriveService(userId);
  return await drive.uploadFile(buffer, mimeType || "text/plain", fileName, parentId);
});

// 4. Tasks: Create Task
openClawAdapters.register("create_task", async (userId, params) => {
  const { title, notes, due } = params;
  if (!title) throw new Error("Missing required parameter: 'title'");

  const tasks = new TasksService(userId);
  return await tasks.createTask(title, notes, due);
});

// 5. Sheets: Update Sheet
openClawAdapters.register("update_sheet", async (userId, params) => {
  const { spreadsheetId, range, values } = params;
  if (!spreadsheetId || !range || !values) throw new Error("Missing required parameters: 'spreadsheetId', 'range', 'values'");

  const sheets = new SheetsService(userId);
  return await sheets.writeRange(spreadsheetId, range, values);
});
