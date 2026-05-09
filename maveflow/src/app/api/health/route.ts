import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import Redis from "ioredis";

// Standard endpoint for Load Balancers (simple fast check)
export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
