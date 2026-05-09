// ============================================
// MaveFlow - OpenClaw API Client
// ============================================

export interface OpenClawConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
}

export interface OpenClawTask {
  name: string;
  payload: Record<string, any>;
}

export interface OpenClawMessage {
  role: "system" | "user" | "assistant";
  content: string;
  intent?: string; // e.g., "send_email", "create_event"
  parameters?: Record<string, any>; // Extracted args for intent
  timestamp: string;
}

export interface OpenClawSessionData {
  sessionId: string;
  context?: Record<string, any>;
  status: "active" | "closed" | "error";
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class OpenClawClient {
  private config: OpenClawConfig;

  constructor(userApiKey?: string) {
    this.config = {
      baseUrl: process.env.OPENCLAW_BASE_URL || "http://localhost:5000",
      apiKey: userApiKey || process.env.OPENCLAW_API_KEY || "",
      timeout: 60000, // 60s
    };
  }

  /**
   * Internal HTTP requester with exponential backoff retry logic.
   */
  public async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries: number = MAX_RETRIES
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    let attempt = 0;

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.config.apiKey}`,
      "X-Client-Id": "MaveFlow/1.0",
      ...options.headers,
    };

    while (attempt < retries) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      try {
        const response = await fetch(url, { ...options, headers, signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        // Return raw response for streaming if specified
        if (options.headers && (options.headers as any)["Accept"] === "text/event-stream") {
          return response as unknown as T; 
        }

        return (await response.json()) as T;
      } catch (error: any) {
        clearTimeout(timeoutId);
        attempt++;

        // Don't retry on client errors (400-499) except 429
        if (error.name === "Error" && error.message.includes("status: 4") && !error.message.includes("429")) {
          throw error;
        }

        if (attempt < retries) {
          const backoffTime = BASE_DELAY_MS * Math.pow(2, attempt - 1) + Math.random() * 500;
          console.warn(`[OpenClaw API] Retrying in ${Math.round(backoffTime)}ms... (Attempt ${attempt}/${retries})`);
          await delay(backoffTime);
          continue;
        }
        
        console.error(`[OpenClaw API] Request failed after ${attempt} attempts.`, error);
        throw new Error("OpenClaw Engine is currently unreachable. Please try again later.");
      }
    }
    throw new Error("Unreachable");
  }

  // Use this for streaming SSE
  public async streamRequest(endpoint: string, options: RequestInit): Promise<Response> {
    return this.request<Response>(endpoint, {
      ...options,
      headers: { ...options.headers, "Accept": "text/event-stream" }
    });
  }
}
