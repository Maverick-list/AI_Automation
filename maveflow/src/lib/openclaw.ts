// ============================================
// MaveFlow - OpenClaw API Client
// ============================================
// HTTP client for communicating with the
// OpenClaw automation engine API.

import { z } from "zod";
import { sanitizeObject } from "@/lib/sanitize";

// ── Types ───────────────────────────────────────────────────────

export interface OpenClawConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
}

export interface OpenClawResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

export interface AutomationTask {
  id: string;
  action: string;
  status: "pending" | "running" | "completed" | "failed";
  payload: Record<string, unknown>;
  result?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

// ── Zod Schemas for OpenClaw Responses ──────────────────────────

const automationTaskSchema = z.object({
  id: z.string(),
  action: z.string(),
  status: z.enum(["pending", "running", "completed", "failed"]),
  payload: z.record(z.string(), z.unknown()),
  result: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ── OpenClaw Client Class ───────────────────────────────────────

class OpenClawClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor(config?: Partial<OpenClawConfig>) {
    this.baseUrl = config?.baseUrl || process.env.OPENCLAW_BASE_URL || "";
    this.apiKey = config?.apiKey || process.env.OPENCLAW_API_KEY || "";
    this.timeout = config?.timeout || 30000; // 30 seconds default

    if (!this.baseUrl) {
      console.warn("⚠️  OPENCLAW_BASE_URL is not configured");
    }
    if (!this.apiKey) {
      console.warn("⚠️  OPENCLAW_API_KEY is not configured");
    }
  }

  /**
   * Makes an authenticated HTTP request to the OpenClaw API.
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<OpenClawResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "X-MaveFlow-Client": "maveflow/1.0",
          "User-Agent": "MaveFlow/1.0",
        },
        body: body ? JSON.stringify(sanitizeObject(body)) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          success: false,
          error: data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
        };
      }

      return {
        success: true,
        data: data as T,
        statusCode: response.status,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        return {
          success: false,
          error: "Request timed out",
          statusCode: 408,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        statusCode: 500,
      };
    }
  }

  // ── Health Check ────────────────────────────────────────────

  /**
   * Checks if the OpenClaw API is reachable and healthy.
   */
  async healthCheck(): Promise<OpenClawResponse<{ status: string }>> {
    return this.request<{ status: string }>("GET", "/health");
  }

  // ── Automation Tasks ────────────────────────────────────────

  /**
   * Creates a new automation task.
   */
  async createTask(
    action: string,
    payload: Record<string, unknown>,
    priority: string = "medium"
  ): Promise<OpenClawResponse<AutomationTask>> {
    return this.request<AutomationTask>("POST", "/api/v1/tasks", {
      action,
      payload,
      priority,
    });
  }

  /**
   * Gets the status of an automation task.
   */
  async getTask(taskId: string): Promise<OpenClawResponse<AutomationTask>> {
    return this.request<AutomationTask>("GET", `/api/v1/tasks/${taskId}`);
  }

  /**
   * Lists all automation tasks with optional filters.
   */
  async listTasks(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<OpenClawResponse<{ tasks: AutomationTask[]; total: number }>> {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.offset) query.set("offset", params.offset.toString());

    const queryString = query.toString();
    const endpoint = `/api/v1/tasks${queryString ? `?${queryString}` : ""}`;

    return this.request<{ tasks: AutomationTask[]; total: number }>("GET", endpoint);
  }

  /**
   * Cancels a running automation task.
   */
  async cancelTask(taskId: string): Promise<OpenClawResponse<AutomationTask>> {
    return this.request<AutomationTask>("POST", `/api/v1/tasks/${taskId}/cancel`);
  }

  // ── Workflows ───────────────────────────────────────────────

  /**
   * Executes a predefined workflow by name.
   */
  async executeWorkflow(
    workflowName: string,
    input: Record<string, unknown>
  ): Promise<OpenClawResponse<{ executionId: string; status: string }>> {
    return this.request<{ executionId: string; status: string }>(
      "POST",
      `/api/v1/workflows/${workflowName}/execute`,
      { input }
    );
  }

  /**
   * Gets the status of a workflow execution.
   */
  async getWorkflowExecution(
    executionId: string
  ): Promise<OpenClawResponse<{ executionId: string; status: string; steps: unknown[] }>> {
    return this.request("GET", `/api/v1/workflows/executions/${executionId}`);
  }

  // ── Webhooks ────────────────────────────────────────────────

  /**
   * Registers a webhook endpoint in OpenClaw.
   */
  async registerWebhook(
    event: string,
    callbackUrl: string,
    secret?: string
  ): Promise<OpenClawResponse<{ webhookId: string }>> {
    return this.request<{ webhookId: string }>("POST", "/api/v1/webhooks", {
      event,
      callbackUrl,
      secret,
    });
  }

  /**
   * Removes a registered webhook.
   */
  async removeWebhook(webhookId: string): Promise<OpenClawResponse<void>> {
    return this.request<void>("DELETE", `/api/v1/webhooks/${webhookId}`);
  }

  // ── AI Processing ───────────────────────────────────────────

  /**
   * Sends a prompt to OpenClaw's AI engine for processing.
   */
  async processWithAI(
    prompt: string,
    context?: Record<string, unknown>
  ): Promise<OpenClawResponse<{ response: string; metadata: Record<string, unknown> }>> {
    return this.request<{ response: string; metadata: Record<string, unknown> }>(
      "POST",
      "/api/v1/ai/process",
      { prompt, context }
    );
  }

  // ── Validation Helper ───────────────────────────────────────

  /**
   * Validates an OpenClaw task response against the schema.
   */
  validateTask(data: unknown): AutomationTask | null {
    const result = automationTaskSchema.safeParse(data);
    return result.success ? result.data : null;
  }
}

// ── Singleton Export ─────────────────────────────────────────────

let clientInstance: OpenClawClient | null = null;

/**
 * Returns the singleton OpenClaw client instance.
 */
export function getOpenClawClient(config?: Partial<OpenClawConfig>): OpenClawClient {
  if (!clientInstance) {
    clientInstance = new OpenClawClient(config);
  }
  return clientInstance;
}

/**
 * Creates a new OpenClaw client (non-singleton, for testing).
 */
export function createOpenClawClient(config: Partial<OpenClawConfig>): OpenClawClient {
  return new OpenClawClient(config);
}

export { OpenClawClient };
