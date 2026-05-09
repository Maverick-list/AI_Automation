// ============================================
// MaveFlow - BullMQ Queue Management
// ============================================

import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";

// Use an alternative Redis URI if provided, otherwise default to localhost.
// Note: Upstash REST token won't work for BullMQ, needs a standard Redis TCP URL.
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// ── Queue Definitions ──────────────────────────────────────────

export const automationQueue = new Queue("automationQueue", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 }, // 2s, 4s, 8s
    removeOnComplete: true,
    removeOnFail: false, // Keep failed jobs for inspection
  },
});

export const emailQueue = new Queue("emailQueue", {
  connection: redisConnection,
});

export const webhookQueue = new Queue("webhookQueue", {
  connection: redisConnection,
});

// ── Workers (For Production Mode) ──────────────────────────────

// Normally you would initialize these in a separate worker process 
// (e.g. server.ts or a custom background process) because Next.js 
// hot-reloading can multiply worker instances.

export function startWorkers() {
  const automationWorker = new Worker("automationQueue", async (job: Job) => {
    // Dynamically import to avoid circular dependencies
    const { AutomationEngine } = await import("./automation-engine");
    const { automationId, triggerContext } = job.data;
    
    console.log(`[Worker] Executing automation: ${automationId}`);
    const engine = new AutomationEngine();
    await engine.executeWorkflow(automationId, triggerContext);

  }, { connection: redisConnection, concurrency: 5 });

  const webhookWorker = new Worker("webhookQueue", async (job: Job) => {
    const { url, payload } = job.data;
    console.log(`[Worker] Sending webhook to ${url}`);
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }, { connection: redisConnection, concurrency: 10 });

  automationWorker.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed with error:`, err);
  });
}
