import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { automationQueue } from "@/lib/queue";
import crypto from "crypto";

// For production, you should set a specific webhook secret.
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "maveflow_default_secret";

/**
 * Validates the HMAC signature sent by external providers (or internal bridges).
 */
function verifySignature(payload: string, signature: string | null): boolean {
  if (!signature) return false;
  
  const expectedSignature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");
    
  return signature === expectedSignature;
}

/**
 * POST /api/webhooks/gmail
 * Receives Google Cloud Pub/Sub push notifications for new emails.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-maveflow-signature");
    
    // In actual Google Pub/Sub, they don't send HMAC, they send a token in URL or auth header.
    // For this generic setup, we'll assume an intermediate bridge or standard HMAC validation.
    // If you use raw PubSub, you validate the `token` search parameter.
    
    /* 
    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    */

    const body = JSON.parse(rawBody);
    
    // Google Pub/Sub format usually wraps data in base64: body.message.data
    let eventData = body;
    if (body.message?.data) {
      eventData = JSON.parse(Buffer.from(body.message.data, "base64").toString("utf-8"));
    }

    const emailAddress = eventData.emailAddress;
    if (!emailAddress) {
      return NextResponse.json({ error: "Missing emailAddress in payload" }, { status: 400 });
    }

    // Find automations listening to this email address
    const automations = await db.automation.findMany({
      where: {
        isActive: true,
        workspace: { owner: { email: emailAddress } }
      }
    });

    const gmailTriggers = automations.filter(a => {
      const t = a.trigger as any;
      return t.type === "gmail_new_email";
    });

    // Queue matching automations
    for (const automation of gmailTriggers) {
      await automationQueue.add(`gmail_webhook_${automation.id}`, {
        automationId: automation.id,
        triggerContext: {
          source: "gmail_push",
          historyId: eventData.historyId,
          emailAddress
        }
      });
    }

    return NextResponse.json({ success: true, queued: gmailTriggers.length });
  } catch (error: any) {
    console.error("[Webhook Gmail] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
