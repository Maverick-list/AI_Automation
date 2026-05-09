import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import Redis from "ioredis";
import { OpenClawClient } from "@/lib/openclaw-client";

// Detailed Endpoint for deep observability (checking latency of dependencies)
export async function GET() {
  const status = {
    overall: "healthy",
    timestamp: new Date().toISOString(),
    services: {} as Record<string, any>,
  };

  try {
    // 1. Database Check
    const dbStart = performance.now();
    await db.$queryRaw`SELECT 1`;
    status.services.database = { status: "up", latencyMs: Math.round(performance.now() - dbStart) };
  } catch (e: any) {
    status.overall = "degraded";
    status.services.database = { status: "down", error: e.message };
    logger.error({ err: e }, "Health Check: Database unreachable");
  }

  try {
    // 2. Redis Check (BullMQ backend)
    const redisStart = performance.now();
    const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", { maxRetriesPerRequest: 1, commandTimeout: 2000 });
    await redis.ping();
    status.services.redis = { status: "up", latencyMs: Math.round(performance.now() - redisStart) };
    redis.disconnect();
  } catch (e: any) {
    status.overall = "degraded";
    status.services.redis = { status: "down", error: e.message };
    logger.error({ err: e }, "Health Check: Redis unreachable");
  }

  try {
    // 3. OpenClaw AI Engine Check
    const aiStart = performance.now();
    const client = new OpenClawClient();
    await client.request("/api/v1/health", { method: "GET" }, 1); // 1 retry max
    status.services.openclaw = { status: "up", latencyMs: Math.round(performance.now() - aiStart) };
  } catch (e: any) {
    status.overall = "degraded";
    status.services.openclaw = { status: "down", error: "AI Engine Unreachable" };
    logger.warn({ err: e }, "Health Check: OpenClaw unreachable");
  }

  return NextResponse.json(status, { status: status.overall === "healthy" ? 200 : 503 });
}
