// ============================================
// MaveFlow - Environment Variables Validation
// ============================================
// Validates all required env vars at build time
// using Zod for type-safe environment access.

import { z } from "zod";

const envSchema = z.object({
  // NextAuth
  NEXTAUTH_SECRET: z.string().min(16, "NEXTAUTH_SECRET must be at least 16 characters"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // OpenClaw
  OPENCLAW_API_KEY: z.string().min(1, "OPENCLAW_API_KEY is required"),
  OPENCLAW_BASE_URL: z.string().url("OPENCLAW_BASE_URL must be a valid URL"),

  // Encryption
  ENCRYPTION_KEY: z
    .string()
    .length(64, "ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)")
    .regex(/^[0-9a-fA-F]+$/, "ENCRYPTION_KEY must be a valid hex string"),

  // Upstash Redis
  UPSTASH_REDIS_REST_URL: z.string().url("UPSTASH_REDIS_REST_URL must be a valid URL"),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, "UPSTASH_REDIS_REST_TOKEN is required"),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const errorMessages = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(", ")}`)
      .join("\n");

    console.error("❌ Invalid environment variables:\n" + errorMessages);

    // In development, warn but don't crash (some vars may not be set yet)
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️  Running in development mode with incomplete env vars");
      return process.env as unknown as Env;
    }

    throw new Error("Invalid environment variables");
  }

  return result.data;
}

export const env = validateEnv();
