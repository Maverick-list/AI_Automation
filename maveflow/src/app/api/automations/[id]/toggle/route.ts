import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser, db } from "@/lib/db";

/**
 * POST /api/automations/[id]/toggle
 * Toggles the isActive state of an automation.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify ownership
    const automation = await db.automation.findUnique({
      where: { id: params.id },
      include: { workspace: true }
    });

    if (!automation || automation.workspace.ownerId !== user.id) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    const updated = await db.automation.update({
      where: { id: params.id },
      data: { isActive: !automation.isActive }
    });

    return NextResponse.json({ success: true, isActive: updated.isActive });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
