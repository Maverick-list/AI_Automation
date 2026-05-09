import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/db";
import { GmailService } from "@/services/google/gmail";
import { gmailComposeSchema } from "@/lib/validations";

/**
 * GET /api/google/gmail/messages
 * Query parameters: q (query), maxResults
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const maxResults = parseInt(searchParams.get("maxResults") || "20", 10);

    const gmail = new GmailService(user.id);
    const data = await gmail.listMessages(query, maxResults);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, code: error.code }, 
      { status: error.code === "INVALID_GRANT" ? 401 : 500 }
    );
  }
}

/**
 * POST /api/google/gmail/send
 * Body: { to: string[], subject: string, body: string, isHtml?: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    // Validate with Zod schema defined previously
    const parsed = gmailComposeSchema.parse(body);

    const gmail = new GmailService(user.id);
    const data = await gmail.sendEmail(parsed.to, parsed.subject, parsed.body, parsed.isHtml);

    return NextResponse.json({ success: true, messageId: data.id });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message, code: error.code }, 
      { status: error.code === "INVALID_GRANT" ? 401 : 500 }
    );
  }
}
