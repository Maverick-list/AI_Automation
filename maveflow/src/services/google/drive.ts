// ============================================
// MaveFlow - Google Drive Service
// ============================================

import { google, drive_v3 } from "googleapis";
import { getGoogleAuth } from "@/lib/google-client";
import { withGoogleRetry } from "@/lib/google-error";
import { Readable } from "stream";

export class DriveService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  private async getClient(): Promise<drive_v3.Drive> {
    const auth = await getGoogleAuth(this.userId);
    return google.drive({ version: "v3", auth });
  }

  /**
   * Lists files in Drive based on query.
   */
  async listFiles(query: string = "", pageSize: number = 20) {
    return withGoogleRetry(async () => {
      const drive = await this.getClient();
      const res = await drive.files.list({
        q: query,
        pageSize,
        fields: "nextPageToken, files(id, name, mimeType, webViewLink, iconLink, modifiedTime, size)",
      });
      return res.data;
    });
  }

  /**
   * Uploads a file to Google Drive.
   */
  async uploadFile(buffer: Buffer, mimeType: string, name: string, parentId?: string) {
    return withGoogleRetry(async () => {
      const drive = await this.getClient();
      
      const fileMetadata: drive_v3.Schema$File = {
        name,
        parents: parentId ? [parentId] : undefined,
      };

      const media = {
        mimeType,
        body: Readable.from(buffer),
      };

      const res = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: "id, name, webViewLink",
      });

      return res.data;
    });
  }

  /**
   * Downloads a file from Drive.
   */
  async downloadFile(fileId: string) {
    return withGoogleRetry(async () => {
      const drive = await this.getClient();
      const res = await drive.files.get(
        { fileId, alt: "media" },
        { responseType: "stream" }
      );
      return res.data;
    });
  }

  /**
   * Creates a new folder in Drive.
   */
  async createFolder(name: string, parentId?: string) {
    return withGoogleRetry(async () => {
      const drive = await this.getClient();
      const fileMetadata: drive_v3.Schema$File = {
        name,
        mimeType: "application/vnd.google-apps.folder",
        parents: parentId ? [parentId] : undefined,
      };

      const res = await drive.files.create({
        requestBody: fileMetadata,
        fields: "id, name, webViewLink",
      });
      return res.data;
    });
  }

  /**
   * Shares a file or folder with a specific email address.
   */
  async shareFile(fileId: string, email: string, role: "reader" | "commenter" | "writer" = "reader") {
    return withGoogleRetry(async () => {
      const drive = await this.getClient();
      const res = await drive.permissions.create({
        fileId,
        requestBody: {
          type: "user",
          role,
          emailAddress: email,
        },
      });
      return res.data;
    });
  }

  /**
   * Sets up a watch for changes on a specific file or folder.
   */
  async watchChanges(fileId: string, channelId: string, channelToken: string, address: string) {
    return withGoogleRetry(async () => {
      const drive = await this.getClient();
      const res = await drive.files.watch({
        fileId,
        requestBody: {
          id: channelId,
          type: "web_hook",
          address,
          token: channelToken,
        },
      });
      return res.data;
    });
  }
}
