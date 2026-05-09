// ============================================
// MaveFlow - Gmail Service
// ============================================

import { google, gmail_v1 } from "googleapis";
import { getGoogleAuth } from "@/lib/google-client";
import { withGoogleRetry } from "@/lib/google-error";

export class GmailService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  private async getClient(): Promise<gmail_v1.Gmail> {
    const auth = await getGoogleAuth(this.userId);
    return google.gmail({ version: "v1", auth });
  }

  /**
   * Lists messages from the inbox.
   */
  async listMessages(query: string = "", maxResults: number = 20) {
    return withGoogleRetry(async () => {
      const gmail = await this.getClient();
      const res = await gmail.users.messages.list({
        userId: "me",
        q: query,
        maxResults,
      });
      return res.data;
    });
  }

  /**
   * Gets a specific message by ID.
   */
  async getMessage(id: string, format: "full" | "raw" | "metadata" = "full") {
    return withGoogleRetry(async () => {
      const gmail = await this.getClient();
      const res = await gmail.users.messages.get({
        userId: "me",
        id,
        format,
      });
      return res.data;
    });
  }

  /**
   * Sends an email (supports HTML and basic text).
   */
  async sendEmail(to: string[], subject: string, body: string, isHtml: boolean = false) {
    return withGoogleRetry(async () => {
      const gmail = await this.getClient();
      
      const headers = [
        `To: ${to.join(", ")}`,
        `Subject: ${subject}`,
        `Content-Type: ${isHtml ? "text/html" : "text/plain"}; charset=utf-8`,
        "MIME-Version: 1.0",
      ].join("\r\n");

      const raw = Buffer.from(`${headers}\r\n\r\n${body}`)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const res = await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw },
      });
      return res.data;
    });
  }

  /**
   * Creates a draft email.
   */
  async createDraft(to: string[], subject: string, body: string, isHtml: boolean = false) {
    return withGoogleRetry(async () => {
      const gmail = await this.getClient();
      
      const headers = [
        `To: ${to.join(", ")}`,
        `Subject: ${subject}`,
        `Content-Type: ${isHtml ? "text/html" : "text/plain"}; charset=utf-8`,
        "MIME-Version: 1.0",
      ].join("\r\n");

      const raw = Buffer.from(`${headers}\r\n\r\n${body}`)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const res = await gmail.users.drafts.create({
        userId: "me",
        requestBody: { message: { raw } },
      });
      return res.data;
    });
  }

  /**
   * Manages labels for a specific message.
   */
  async manageLabels(messageId: string, addLabelIds: string[], removeLabelIds: string[]) {
    return withGoogleRetry(async () => {
      const gmail = await this.getClient();
      const res = await gmail.users.messages.modify({
        userId: "me",
        id: messageId,
        requestBody: { addLabelIds, removeLabelIds },
      });
      return res.data;
    });
  }

  /**
   * Sets up a push notification watch (Webhook) for Gmail.
   */
  async watchGmailPush(topicName: string, labelIds: string[] = ["INBOX"]) {
    return withGoogleRetry(async () => {
      const gmail = await this.getClient();
      const res = await gmail.users.watch({
        userId: "me",
        requestBody: {
          topicName,
          labelIds,
        },
      });
      return res.data;
    });
  }
}
