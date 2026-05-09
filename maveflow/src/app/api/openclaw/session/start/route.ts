import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/db";
import { OpenClawService } from "@/lib/openclaw-service";

/**
 * POST /api/openclaw/session/start
 * Starts a new AI session.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const context = body.context || {};

    const aiService = new OpenClawService();
    const sessionId = await aiService.startSession(user.id, context);

    return NextResponse.json({ success: true, sessionId });
  } catch (error: any) {
    console.error("[OpenClaw API] Failed to start session:", error);
    
    // Fallback/Error boundary if OpenClaw is down
    if (error.message?.includes("down") || error.message?.includes("unreachable")) {
      return NextResponse.json(
        { error: "AI Engine Unavailable", message: error.message, isFallback: true }, 
        { status: 503 }
      );
    }
    
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
