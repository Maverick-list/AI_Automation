// ============================================
// MaveFlow - Zod Validation Schemas
// ============================================
// Centralized Zod schemas for validating all
// form inputs and API request payloads.

import { z } from "zod";

// ── Common Schemas ──────────────────────────────────────────────

export const emailSchema = z
  .string()
  .email("Invalid email address")
  .max(255, "Email must be less than 255 characters")
  .transform((v) => v.trim().toLowerCase());

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters")
  .transform((v) => v.trim());

export const urlSchema = z
  .string()
  .url("Invalid URL format")
  .max(2048, "URL must be less than 2048 characters");

export const idSchema = z
  .string()
  .min(1, "ID is required")
  .max(128, "ID must be less than 128 characters")
  .regex(/^[a-zA-Z0-9_-]+$/, "ID contains invalid characters");

// ── Pagination Schema ───────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// ── Search Schema ───────────────────────────────────────────────

export const searchSchema = z.object({
  query: z
    .string()
    .max(200, "Search query too long")
    .transform((v) => v.trim()),
  filters: z.record(z.string(), z.string()).optional(),
  ...paginationSchema.shape,
});

export type SearchInput = z.infer<typeof searchSchema>;

// ── API Request Schemas ─────────────────────────────────────────

/** Schema for creating an automation workflow */
export const createWorkflowSchema = z.object({
  name: z
    .string()
    .min(1, "Workflow name is required")
    .max(100, "Workflow name must be less than 100 characters")
    .transform((v) => v.trim()),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .transform((v) => v?.trim()),
  trigger: z.object({
    type: z.enum([
      "gmail_new_email",
      "calendar_event",
      "drive_file_change",
      "sheets_update",
      "task_due",
      "manual",
      "schedule",
      "webhook",
    ]),
    config: z.record(z.string(), z.unknown()).optional(),
  }),
  actions: z
    .array(
      z.object({
        type: z.enum([
          "gmail_send",
          "gmail_reply",
          "gmail_label",
          "calendar_create",
          "calendar_update",
          "drive_upload",
          "drive_share",
          "sheets_append",
          "sheets_update",
          "docs_create",
          "slides_create",
          "tasks_create",
          "contacts_create",
          "openclaw_process",
          "webhook_call",
        ]),
        config: z.record(z.string(), z.unknown()),
        order: z.number().int().min(0),
      })
    )
    .min(1, "At least one action is required")
    .max(20, "Maximum 20 actions per workflow"),
  isActive: z.boolean().default(true),
});

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;

/** Schema for updating a workflow */
export const updateWorkflowSchema = createWorkflowSchema.partial().extend({
  id: idSchema,
});

export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>;

/** Schema for Gmail compose */
export const gmailComposeSchema = z.object({
  to: z.array(emailSchema).min(1, "At least one recipient is required").max(50),
  cc: z.array(emailSchema).max(50).optional(),
  bcc: z.array(emailSchema).max(50).optional(),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(500, "Subject must be less than 500 characters")
    .transform((v) => v.trim()),
  body: z
    .string()
    .min(1, "Email body is required")
    .max(50000, "Email body too large"),
  isHtml: z.boolean().default(false),
});

export type GmailComposeInput = z.infer<typeof gmailComposeSchema>;

/** Schema for Calendar event creation */
export const calendarEventSchema = z.object({
  summary: z
    .string()
    .min(1, "Event title is required")
    .max(200, "Title must be less than 200 characters")
    .transform((v) => v.trim()),
  description: z
    .string()
    .max(8000, "Description too long")
    .optional()
    .transform((v) => v?.trim()),
  location: z
    .string()
    .max(500, "Location too long")
    .optional()
    .transform((v) => v?.trim()),
  start: z.string().datetime("Invalid start date/time"),
  end: z.string().datetime("Invalid end date/time"),
  timeZone: z.string().max(50).default("Asia/Jakarta"),
  attendees: z.array(emailSchema).max(100).optional(),
  reminders: z
    .object({
      useDefault: z.boolean(),
      overrides: z
        .array(
          z.object({
            method: z.enum(["email", "popup"]),
            minutes: z.number().int().min(0).max(40320),
          })
        )
        .optional(),
    })
    .optional(),
});

export type CalendarEventInput = z.infer<typeof calendarEventSchema>;

/** Schema for OpenClaw automation request */
export const openClawRequestSchema = z.object({
  action: z.string().min(1, "Action is required").max(100),
  payload: z.record(z.string(), z.unknown()),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  metadata: z
    .object({
      source: z.string().max(100).optional(),
      tags: z.array(z.string().max(50)).max(10).optional(),
    })
    .optional(),
});

export type OpenClawRequestInput = z.infer<typeof openClawRequestSchema>;

// ── Validation Helper ───────────────────────────────────────────

/**
 * Validates input against a Zod schema and returns typed result.
 * Throws formatted error if validation fails.
 */
export async function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<T> {
  const result = await schema.safeParseAsync(data);

  if (!result.success) {
    const errors = result.error.flatten();
    const errorMessage = Object.entries(errors.fieldErrors)
      .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
      .join("; ");

    throw new ValidationError(errorMessage, errors.fieldErrors);
  }

  return result.data;
}

/**
 * Custom validation error with structured field errors.
 */
export class ValidationError extends Error {
  public readonly fieldErrors: Record<string, string[] | undefined>;

  constructor(message: string, fieldErrors: Record<string, string[] | undefined>) {
    super(message);
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;
  }
}
