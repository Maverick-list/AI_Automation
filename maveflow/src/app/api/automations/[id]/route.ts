import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser, db } from "@/lib/db";
import { updateWorkflowSchema } from "@/lib/validations";

/**
 * GET /api/automations/[id]
 * Retrieves a specific automation.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const automation = await db.automation.findUnique({
      where: { id: params.id },
      include: { workspace: true }
    });

    if (!automation || automation.workspace.ownerId !== user.id) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, automation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/automations/[id]
 * Updates a specific automation.
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = updateWorkflowSchema.parse(body);

    // Verify ownership
    const existing = await db.automation.findUnique({
      where: { id: params.id },
      include: { workspace: true }
    });

    if (!existing || existing.workspace.ownerId !== user.id) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    const updated = await db.automation.update({
      where: { id: params.id },
      data: {
        name: parsed.name,
        description: parsed.description,
        trigger: parsed.trigger as any,
        actions: parsed.actions as any,
        isActive: parsed.isActive,
      }
    });

    return NextResponse.json({ success: true, automation: updated });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/automations/[id]
 * Deletes a specific automation.
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify ownership
    const existing = await db.automation.findUnique({
      where: { id: params.id },
      include: { workspace: true }
    });

    if (!existing || existing.workspace.ownerId !== user.id) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    await db.automation.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true, message: "Automation deleted." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
