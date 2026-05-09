// ============================================
// MaveFlow - Google API Error Handler
// ============================================
// Handles Google API specific errors like 
// Quota Exceeded, Rate Limit Exceeded, and Invalid Grant.
// Implements exponential backoff for retries.

export class GoogleApiError extends Error {
  public code: string | number;
  public details?: any;

  constructor(message: string, code: string | number, details?: any) {
    super(message);
    this.name = "GoogleApiError";
    this.code = code;
    this.details = details;
  }
}

/**
 * Exponential backoff configuration for retrying failed requests.
 */
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

/**
 * Delays execution for a given number of milliseconds.
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Wraps a Google API call with automatic retries and error parsing.
 * Handles rate limits (429) and server errors (500, 502, 503, 504) via exponential backoff.
 * Throws a specific GoogleApiError for "invalid_grant" to trigger re-auth.
 */
export async function withGoogleRetry<T>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> {
  let attempt = 0;

  while (attempt < retries) {
    try {
      return await operation();
    } catch (error: any) {
      attempt++;

      const isGoogleError = error?.response?.data?.error || error?.errors;
      const statusCode = error?.response?.status || error?.code;
      const errorMessage =
        error?.response?.data?.error_description ||
        error?.response?.data?.error?.message ||
        error?.message ||
        "Unknown Google API Error";

      // 1. Handle Invalid Grant (Refresh token is revoked or expired)
      if (
        errorMessage.includes("invalid_grant") || 
        error?.response?.data?.error === "invalid_grant"
      ) {
        throw new GoogleApiError(
          "Google authentication revoked or expired. Please reconnect your account.",
          "INVALID_GRANT",
          error
        );
      }

      // 2. Handle Quota Exceeded or Rate Limit (429) / Transient Server Errors (5xx)
      const isRetryableError =
        statusCode === 429 ||
        statusCode === 403 || // Sometimes quota exceeded comes as 403
        (statusCode >= 500 && statusCode <= 599) ||
        errorMessage.toLowerCase().includes("quota") ||
        errorMessage.toLowerCase().includes("rate limit");

      if (isRetryableError && attempt < retries) {
        // Calculate backoff delay: 1s, 2s, 4s... plus jitter to avoid thundering herd
        const backoffTime = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        const jitter = Math.random() * 500;
        const totalDelay = backoffTime + jitter;

        console.warn(
          `[Google API] Retryable error (${statusCode}): ${errorMessage}. Retrying in ${Math.round(totalDelay)}ms (Attempt ${attempt}/${retries})...`
        );
        
        await delay(totalDelay);
        continue;
      }

      // 3. Unrecoverable Error or max retries reached
      console.error(`[Google API] Operation failed after ${attempt} attempts:`, errorMessage);
      throw new GoogleApiError(errorMessage, statusCode || "UNKNOWN", error);
    }
  }

  throw new Error("Unreachable");
}
