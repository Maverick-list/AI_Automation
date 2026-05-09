import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { automationQueue } from "@/lib/queue";

/**
 * POST /api/webhooks/drive
 * Receives Google Drive push notifications for file changes.
 */
export async function POST(req: NextRequest) {
  try {
    // Google Drive sends specific headers for Push notifications
    const channelId = req.headers.get("X-Goog-Channel-ID");
    const resourceId = req.headers.get("X-Goog-Resource-ID");
    const resourceState = req.headers.get("X-Goog-Resource-State"); // 'sync', 'add', 'update', 'trash'
    
    // Validate request originated from Google (basic check)
    if (!channelId || !resourceId) {
      return NextResponse.json({ error: "Missing Google Drive webhook headers" }, { status: 400 });
    }

    if (resourceState === "sync") {
      // Sync events are just for channel verification
      return new NextResponse("OK", { status: 200 });
    }

    // Find automations configured to watch this channel
    // In a real app, you would map channelId back to a specific workspace/automation in the DB.
    // Assuming automation.trigger.config.channelId exists
    
    // NOTE: Prisma JSON querying is database specific, so we fetch active drive triggers and filter in memory for simplicity here.
    const automations = await db.automation.findMany({
      where: { isActive: true }
    });

    const driveTriggers = automations.filter(a => {
      const t = a.trigger as any;
      return t.type === "drive_file_change" && t.config?.channelId === channelId;
    });

    // Queue matching automations
    for (const automation of driveTriggers) {
      await automationQueue.add(`drive_webhook_${automation.id}`, {
        automationId: automation.id,
        triggerContext: {
          source: "drive_push",
          resourceId,
          resourceState
        }
      });
    }

    return NextResponse.json({ success: true, queued: driveTriggers.length });
  } catch (error: any) {
    console.error("[Webhook Drive] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
