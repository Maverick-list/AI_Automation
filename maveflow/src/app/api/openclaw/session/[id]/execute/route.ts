import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/db";
import { OpenClawService } from "@/lib/openclaw-service";
import { openClawAdapters } from "@/lib/openclaw-adapters";

/**
 * POST /api/openclaw/session/[id]/execute
 * Route called when the AI has generated an Intent, and the client/server wants to execute it.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { intent, parameters } = body;

    if (!intent) {
      return NextResponse.json({ error: "Intent is required" }, { status: 400 });
    }

    if (!openClawAdapters.hasAdapter(intent)) {
      return NextResponse.json({ error: `No registered adapter for intent: ${intent}` }, { status: 400 });
    }

    // Execute the bound Google Service action securely via the server
    const result = await openClawAdapters.execute(intent, user.id, parameters || {});

    // Optionally: Report result back to OpenClaw session
    const aiService = new OpenClawService();
    await aiService.executeTask(params.id, {
      name: "system_report_action_result",
      payload: { intent, status: "success", result }
    }).catch(e => console.warn("Failed to report execution result to AI engine:", e.message));

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("[Action Execution] Failed:", error);
    
    // Report failure to AI engine
    try {
      const aiService = new OpenClawService();
      await aiService.executeTask(params.id, {
        name: "system_report_action_result",
        payload: { intent: req.body?.toString(), status: "failed", error: error.message }
      });
    } catch (_) {}

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
