import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser, db } from "@/lib/db";
import { automationQueue } from "@/lib/queue";

/**
 * POST /api/automations/[id]/trigger
 * Manually triggers an automation workflow by pushing it to BullMQ.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const triggerContext = body.context || { source: "manual_api" };

    // Verify ownership
    const automation = await db.automation.findUnique({
      where: { id: params.id },
      include: { workspace: true }
    });

    if (!automation || automation.workspace.ownerId !== user.id) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    if (!automation.isActive) {
      return NextResponse.json({ error: "Cannot trigger inactive automation." }, { status: 400 });
    }

    // Queue the job using BullMQ
    const job = await automationQueue.add(`manual_trigger_${params.id}`, {
      automationId: params.id,
      triggerContext,
    });

    return NextResponse.json({ success: true, message: "Automation queued.", jobId: job.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
