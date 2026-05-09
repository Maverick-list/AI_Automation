// ============================================
// MaveFlow - Google Workspace API Client
// ============================================
// Centralized Google API client factory that
// creates authenticated API instances for each
// Google Workspace service.

import { google, type Auth } from "googleapis";
import { auth, type ExtendedSession } from "@/lib/auth";

// ── OAuth2 Client Factory ───────────────────────────────────────

/**
 * Creates an OAuth2 client with the user's access token.
 * Must be called with a valid session.
 */
export function createOAuth2Client(accessToken: string): Auth.OAuth2Client {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
  );

  oauth2Client.setCredentials({ access_token: accessToken });
  return oauth2Client;
}

/**
 * Gets the OAuth2 client from the current session.
 * Throws if user is not authenticated.
 */
export async function getAuthenticatedClient(): Promise<Auth.OAuth2Client> {
  const session = (await auth()) as ExtendedSession | null;

  if (!session?.accessToken) {
    throw new Error("User is not authenticated. No access token available.");
  }

  if (session.error === "RefreshTokenError") {
    throw new Error("Session expired. Please sign in again.");
  }

  return createOAuth2Client(session.accessToken);
}

// ── Gmail API ───────────────────────────────────────────────────

/**
 * Returns an authenticated Gmail API client.
 */
export async function getGmailClient() {
  const authClient = await getAuthenticatedClient();
  return google.gmail({ version: "v1", auth: authClient });
}

/**
 * Lists recent emails from the user's inbox.
 */
export async function listEmails(
  maxResults: number = 10,
  query?: string
) {
  const gmail = await getGmailClient();
  const response = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    q: query,
  });
  return response.data;
}

/**
 * Gets a specific email by ID.
 */
export async function getEmail(messageId: string) {
  const gmail = await getGmailClient();
  const response = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });
  return response.data;
}

/**
 * Sends an email via Gmail.
 */
export async function sendEmail(options: {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  isHtml?: boolean;
}) {
  const gmail = await getGmailClient();

  const headers = [
    `To: ${options.to.join(", ")}`,
    options.cc?.length ? `Cc: ${options.cc.join(", ")}` : "",
    options.bcc?.length ? `Bcc: ${options.bcc.join(", ")}` : "",
    `Subject: ${options.subject}`,
    `Content-Type: ${options.isHtml ? "text/html" : "text/plain"}; charset=utf-8`,
    "MIME-Version: 1.0",
  ]
    .filter(Boolean)
    .join("\r\n");

  const raw = Buffer.from(`${headers}\r\n\r\n${options.body}`)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });

  return response.data;
}

// ── Google Drive API ────────────────────────────────────────────

/**
 * Returns an authenticated Google Drive API client.
 */
export async function getDriveClient() {
  const authClient = await getAuthenticatedClient();
  return google.drive({ version: "v3", auth: authClient });
}

/**
 * Lists files from Google Drive.
 */
export async function listDriveFiles(
  pageSize: number = 10,
  query?: string
) {
  const drive = await getDriveClient();
  const response = await drive.files.list({
    pageSize,
    q: query,
    fields: "nextPageToken, files(id, name, mimeType, size, modifiedTime, webViewLink, iconLink)",
  });
  return response.data;
}

// ── Google Calendar API ─────────────────────────────────────────

/**
 * Returns an authenticated Google Calendar API client.
 */
export async function getCalendarClient() {
  const authClient = await getAuthenticatedClient();
  return google.calendar({ version: "v3", auth: authClient });
}

/**
 * Lists upcoming calendar events.
 */
export async function listCalendarEvents(
  maxResults: number = 10,
  calendarId: string = "primary"
) {
  const calendar = await getCalendarClient();
  const response = await calendar.events.list({
    calendarId,
    timeMin: new Date().toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: "startTime",
  });
  return response.data;
}

/**
 * Creates a calendar event.
 */
export async function createCalendarEvent(event: {
  summary: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
  timeZone?: string;
  attendees?: string[];
}) {
  const calendar = await getCalendarClient();
  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.start,
        timeZone: event.timeZone || "Asia/Jakarta",
      },
      end: {
        dateTime: event.end,
        timeZone: event.timeZone || "Asia/Jakarta",
      },
      attendees: event.attendees?.map((email) => ({ email })),
    },
  });
  return response.data;
}

// ── Google Tasks API ────────────────────────────────────────────

/**
 * Returns an authenticated Google Tasks API client.
 */
export async function getTasksClient() {
  const authClient = await getAuthenticatedClient();
  return google.tasks({ version: "v1", auth: authClient });
}

/**
 * Lists task lists.
 */
export async function listTaskLists() {
  const tasks = await getTasksClient();
  const response = await tasks.tasklists.list();
  return response.data;
}

/**
 * Lists tasks in a task list.
 */
export async function listTasks(taskListId: string = "@default") {
  const tasks = await getTasksClient();
  const response = await tasks.tasks.list({
    tasklist: taskListId,
    showCompleted: false,
  });
  return response.data;
}

// ── Google Contacts (People API) ────────────────────────────────

/**
 * Returns an authenticated People API client.
 */
export async function getPeopleClient() {
  const authClient = await getAuthenticatedClient();
  return google.people({ version: "v1", auth: authClient });
}

/**
 * Lists contacts from the authenticated user's account.
 */
export async function listContacts(pageSize: number = 10) {
  const people = await getPeopleClient();
  const response = await people.people.connections.list({
    resourceName: "people/me",
    pageSize,
    personFields: "names,emailAddresses,phoneNumbers,photos",
  });
  return response.data;
}

// ── Google Sheets API ───────────────────────────────────────────

/**
 * Returns an authenticated Google Sheets API client.
 */
export async function getSheetsClient() {
  const authClient = await getAuthenticatedClient();
  return google.sheets({ version: "v4", auth: authClient });
}

/**
 * Reads data from a Google Sheets spreadsheet.
 */
export async function readSheet(
  spreadsheetId: string,
  range: string
) {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  return response.data;
}

/**
 * Appends data to a Google Sheets spreadsheet.
 */
export async function appendToSheet(
  spreadsheetId: string,
  range: string,
  values: string[][]
) {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
  return response.data;
}

// ── Google Docs API ─────────────────────────────────────────────

/**
 * Returns an authenticated Google Docs API client.
 */
export async function getDocsClient() {
  const authClient = await getAuthenticatedClient();
  return google.docs({ version: "v1", auth: authClient });
}

/**
 * Creates a new Google Doc.
 */
export async function createDoc(title: string) {
  const docs = await getDocsClient();
  const response = await docs.documents.create({
    requestBody: { title },
  });
  return response.data;
}

// ── Google Slides API ───────────────────────────────────────────

/**
 * Returns an authenticated Google Slides API client.
 */
export async function getSlidesClient() {
  const authClient = await getAuthenticatedClient();
  return google.slides({ version: "v1", auth: authClient });
}

/**
 * Creates a new Google Slides presentation.
 */
export async function createPresentation(title: string) {
  const slides = await getSlidesClient();
  const response = await slides.presentations.create({
    requestBody: { title },
  });
  return response.data;
}
