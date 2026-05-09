// ============================================
// MaveFlow - OpenClaw Service Logic
// ============================================

import { OpenClawClient, OpenClawMessage, OpenClawSessionData, OpenClawTask } from "./openclaw-client";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

export class OpenClawService {
  private client: OpenClawClient;

  constructor(userApiKey?: string) {
    this.client = new OpenClawClient(userApiKey);
  }

  /**
   * Starts a new AI session, logs it to DB, and returns the Session ID.
   */
  async startSession(userId: string, context?: Record<string, any>): Promise<string> {
    const sessionId = randomUUID();

    // Verify engine is alive before DB commit
    try {
      await this.client.request("/api/v1/health", { method: "GET" }, 1);
    } catch (e) {
      throw new Error("OpenClaw Engine is currently down. Fallback to manual mode.");
    }

    // Register session in OpenClaw Remote Engine
    await this.client.request("/api/v1/session/start", {
      method: "POST",
      body: JSON.stringify({ sessionId, userId, context }),
    });

    // Save session reference to our Prisma Database
    await db.openClawSession.create({
      data: {
        userId,
        sessionId,
        metadata: context || {},
      },
    });

    return sessionId;
  }

  /**
   * Sends a message to the AI Engine and returns a readable stream (SSE).
   */
  async sendMessage(sessionId: string, message: string, attachments?: any[]): Promise<ReadableStream> {
    const response = await this.client.streamRequest(`/api/v1/session/${sessionId}/message`, {
      method: "POST",
      body: JSON.stringify({ message, attachments }),
    });

    if (!response.body) {
      throw new Error("No stream body returned from OpenClaw");
    }

    return response.body;
  }

  /**
   * Executes a specific rigid task asynchronously.
   */
  async executeTask(sessionId: string, task: OpenClawTask): Promise<any> {
    return this.client.request(`/api/v1/session/${sessionId}/execute`, {
      method: "POST",
      body: JSON.stringify({ task }),
    });
  }

  /**
   * Retrieves the full chat/execution history of a session.
   */
  async getSessionHistory(sessionId: string): Promise<OpenClawMessage[]> {
    const data = await this.client.request<{ history: OpenClawMessage[] }>(
      `/api/v1/session/${sessionId}/history`,
      { method: "GET" }
    );
    return data.history;
  }

  /**
   * Closes an active AI session and cleans up resources.
   */
  async closeSession(sessionId: string): Promise<boolean> {
    await this.client.request(`/api/v1/session/${sessionId}/close`, {
      method: "POST",
    });

    // Update metadata in our database
    await db.openClawSession.update({
      where: { sessionId },
      data: {
        metadata: { status: "closed", closedAt: new Date().toISOString() },
      },
    });

    return true;
  }
}
