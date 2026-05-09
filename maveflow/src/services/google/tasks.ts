// ============================================
// MaveFlow - Google Tasks Service
// ============================================

import { google, tasks_v1 } from "googleapis";
import { getGoogleAuth } from "@/lib/google-client";
import { withGoogleRetry } from "@/lib/google-error";

export class TasksService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  private async getClient(): Promise<tasks_v1.Tasks> {
    const auth = await getGoogleAuth(this.userId);
    return google.tasks({ version: "v1", auth });
  }

  /**
   * Lists all task lists for the user.
   */
  async listTaskLists() {
    return withGoogleRetry(async () => {
      const tasks = await this.getClient();
      const res = await tasks.tasklists.list();
      return res.data;
    });
  }

  /**
   * Lists tasks inside a specific list.
   */
  async listTasks(tasklistId: string = "@default", showCompleted: boolean = false) {
    return withGoogleRetry(async () => {
      const tasks = await this.getClient();
      const res = await tasks.tasks.list({
        tasklist: tasklistId,
        showCompleted,
      });
      return res.data;
    });
  }

  /**
   * Creates a new task.
   */
  async createTask(title: string, notes?: string, due?: string, tasklistId: string = "@default") {
    return withGoogleRetry(async () => {
      const tasks = await this.getClient();
      const res = await tasks.tasks.insert({
        tasklist: tasklistId,
        requestBody: {
          title,
          notes,
          due, // RFC 3339 timestamp string
        },
      });
      return res.data;
    });
  }

  /**
   * Updates a task.
   */
  async updateTask(taskId: string, payload: Partial<tasks_v1.Schema$Task>, tasklistId: string = "@default") {
    return withGoogleRetry(async () => {
      const tasks = await this.getClient();
      const res = await tasks.tasks.patch({
        tasklist: tasklistId,
        task: taskId,
        requestBody: payload,
      });
      return res.data;
    });
  }

  /**
   * Deletes a task.
   */
  async deleteTask(taskId: string, tasklistId: string = "@default") {
    return withGoogleRetry(async () => {
      const tasks = await this.getClient();
      await tasks.tasks.delete({
        tasklist: tasklistId,
        task: taskId,
      });
      return true;
    });
  }
}
