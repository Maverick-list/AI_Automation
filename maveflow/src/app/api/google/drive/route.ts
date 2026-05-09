import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/db";
import { DriveService } from "@/services/google/drive";

/**
 * GET /api/google/drive/files
 * Query parameters: q (query), pageSize
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    const drive = new DriveService(user.id);
    const data = await drive.listFiles(query, pageSize);

    return NextResponse.json({ success: true, files: data.files, nextPageToken: data.nextPageToken });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, code: error.code }, 
      { status: error.code === "INVALID_GRANT" ? 401 : 500 }
    );
  }
}

/**
 * POST /api/google/drive/upload
 * Content-Type: multipart/form-data
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const parentId = formData.get("parentId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    const drive = new DriveService(user.id);
    const data = await drive.uploadFile(buffer, file.type, file.name, parentId || undefined);

    return NextResponse.json({ success: true, file: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, code: error.code }, 
      { status: error.code === "INVALID_GRANT" ? 401 : 500 }
    );
  }
}
