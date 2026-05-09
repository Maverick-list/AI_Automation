import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser, db } from "@/lib/db";

/**
 * GET /api/automations/[id]/runs
 * Retrieves execution history of an automation.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Verify ownership
    const automation = await db.automation.findUnique({
      where: { id: params.id },
      include: { workspace: true }
    });

    if (!automation || automation.workspace.ownerId !== user.id) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    const runs = await db.automationRun.findMany({
      where: { automationId: params.id },
      orderBy: { startedAt: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await db.automationRun.count({
      where: { automationId: params.id }
    });

    return NextResponse.json({ success: true, runs, total });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
