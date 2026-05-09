import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/db";
import { OpenClawService } from "@/lib/openclaw-service";
import { openClawAdapters } from "@/lib/openclaw-adapters";

/**
 * POST /api/openclaw/session/[id]/message
 * Sends a message to OpenClaw and streams the SSE response back to the client.
 * Also intercepts intents on the server-side to execute Google actions if the AI issues a command.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: sessionId } = params;
    const body = await req.json();
    const { message, attachments } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const aiService = new OpenClawService();
    
    // We send the message and get a ReadableStream
    const stream = await aiService.sendMessage(sessionId, message, attachments);

    // To intercept intent blocks while streaming to client, we can use a TransformStream
    // Alternatively, we can let the Client app execute the action by calling another endpoint,
    // but doing it server-side is more secure. For this implementation, we pass the raw stream
    // to the client, and if the client receives an 'intent' event, the client will call our Execute API.
    
    // Create streaming response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error: any) {
    console.error("[OpenClaw Stream API] Error:", error);
    return NextResponse.json(
      { error: "Failed to communicate with AI Engine", message: error.message },
      { status: 500 }
    );
  }
}
