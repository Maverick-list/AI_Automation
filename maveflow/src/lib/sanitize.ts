// ============================================
// MaveFlow - Input Sanitization Utilities
// ============================================
// Sanitizes and validates user input to prevent
// XSS, injection attacks, and malformed data.

/**
 * Strips HTML tags from a string to prevent XSS.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Escapes HTML special characters to prevent XSS injection.
 */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
    "`": "&#96;",
  };
  return input.replace(/[&<>"'/`]/g, (char) => map[char] || char);
}

/**
 * Sanitizes a general text input field.
 * - Trims whitespace
 * - Strips HTML tags
 * - Limits length
 */
export function sanitizeText(input: string, maxLength: number = 1000): string {
  return stripHtml(input.trim()).slice(0, maxLength);
}

/**
 * Sanitizes an email address.
 * - Trims + lowercases
 * - Validates basic format
 */
export function sanitizeEmail(input: string): string | null {
  const cleaned = input.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(cleaned) ? cleaned : null;
}

/**
 * Sanitizes a URL string.
 * - Must start with http:// or https://
 * - Prevents javascript: protocol injection
 */
export function sanitizeUrl(input: string): string | null {
  const cleaned = input.trim();
  try {
    const url = new URL(cleaned);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Deep sanitize an object by recursively sanitizing all string values.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string"
          ? sanitizeText(item)
          : typeof item === "object" && item !== null
            ? sanitizeObject(item as Record<string, unknown>)
            : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized as T;
}
