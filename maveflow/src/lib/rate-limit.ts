// ============================================
// MaveFlow - Rate Limiter
// ============================================
// Rate limiting using Upstash Redis with
// sliding window algorithm for API protection.

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// ── Redis Client ────────────────────────────────────────────────

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("⚠️  Upstash Redis not configured. Rate limiting disabled.");
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

// ── Rate Limiter Instances ──────────────────────────────────────

/** Standard API rate limit: 60 requests per 60 seconds */
export function createApiRateLimiter() {
  const redisInstance = getRedis();
  if (!redisInstance) return null;

  return new Ratelimit({
    redis: redisInstance,
    limiter: Ratelimit.slidingWindow(60, "60 s"),
    analytics: true,
    prefix: "maveflow:api",
  });
}

/** Auth rate limit: 10 requests per 60 seconds (stricter for auth) */
export function createAuthRateLimiter() {
  const redisInstance = getRedis();
  if (!redisInstance) return null;

  return new Ratelimit({
    redis: redisInstance,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    analytics: true,
    prefix: "maveflow:auth",
  });
}

/** Strict rate limit: 5 requests per 60 seconds (for sensitive ops) */
export function createStrictRateLimiter() {
  const redisInstance = getRedis();
  if (!redisInstance) return null;

  return new Ratelimit({
    redis: redisInstance,
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    analytics: true,
    prefix: "maveflow:strict",
  });
}

// ── Rate Limit Helper ───────────────────────────────────────────

/**
 * Applies rate limiting to an API request.
 * Returns null if rate limiting passes, or a 429 response if exceeded.
 *
 * @param request - The incoming request
 * @param limiterType - Which rate limiter to use
 * @returns null if ok, NextResponse if rate limited
 */
export async function applyRateLimit(
  request: NextRequest,
  limiterType: "api" | "auth" | "strict" = "api"
): Promise<NextResponse | null> {
  let limiter: Ratelimit | null;

  switch (limiterType) {
    case "auth":
      limiter = createAuthRateLimiter();
      break;
    case "strict":
      limiter = createStrictRateLimiter();
      break;
    default:
      limiter = createApiRateLimiter();
  }

  // If Redis is not configured, allow the request through
  if (!limiter) {
    return null;
  }

  // Use IP address as identifier, fallback to "anonymous"
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous";

  const { success, limit, remaining, reset } = await limiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      {
        error: "Too Many Requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  return null;
}
