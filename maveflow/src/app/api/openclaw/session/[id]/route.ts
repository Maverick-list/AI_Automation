import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/db";
import { OpenClawService } from "@/lib/openclaw-service";

/**
 * GET /api/openclaw/session/[id]/history
 * Fetches message history.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const aiService = new OpenClawService();
    const history = await aiService.getSessionHistory(params.id);

    return NextResponse.json({ success: true, history });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/openclaw/session/[id]
 * Closes the AI session.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const aiService = new OpenClawService();
    await aiService.closeSession(params.id);

    return NextResponse.json({ success: true, message: "Session closed." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
