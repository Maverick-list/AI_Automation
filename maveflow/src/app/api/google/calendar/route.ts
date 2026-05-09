import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/db";
import { CalendarService } from "@/services/google/calendar";
import { calendarEventSchema } from "@/lib/validations";

/**
 * GET /api/google/calendar/events
 * Query parameters: calendarId, timeMin, timeMax, maxResults
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const calendarId = searchParams.get("calendarId") || "primary";
    const timeMin = searchParams.get("timeMin") || undefined;
    const timeMax = searchParams.get("timeMax") || undefined;
    const maxResults = parseInt(searchParams.get("maxResults") || "20", 10);

    const calendar = new CalendarService(user.id);
    const data = await calendar.listEvents(calendarId, timeMin, timeMax, maxResults);

    return NextResponse.json({ success: true, items: data.items });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, code: error.code }, 
      { status: error.code === "INVALID_GRANT" ? 401 : 500 }
    );
  }
}

/**
 * POST /api/google/calendar/create
 * Body: Zod validated event schema
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    // Validate with Zod schema
    const parsed = calendarEventSchema.parse(body);

    const calendar = new CalendarService(user.id);
    
    // Reformat payload for Google API
    const googlePayload = {
      summary: parsed.summary,
      description: parsed.description,
      location: parsed.location,
      start: { dateTime: parsed.start, timeZone: parsed.timeZone },
      end: { dateTime: parsed.end, timeZone: parsed.timeZone },
      attendees: parsed.attendees,
    };

    const data = await calendar.createEvent(googlePayload);

    return NextResponse.json({ success: true, eventId: data.id, link: data.htmlLink });
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
