import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/db";
import { EventEmitter } from "events";

// Global event emitter for server-side events
export const sseEmitter = new EventEmitter();

// Helper to broadcast events from other parts of the backend
export function broadcastDashboardEvent(userId: string, event: string, data: any) {
  sseEmitter.emit(`dashboard_${userId}`, { event, data });
}

/**
 * GET /api/sse/dashboard
 * SSE endpoint for real-time dashboard updates.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const stream = new ReadableStream({
      start(controller) {
        // Function to send data to the client
        const sendEvent = (event: string, data: any) => {
          controller.enqueue(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        };

        // Send initial connection success
        sendEvent("connected", { timestamp: Date.now() });

        // Listener for this specific user
        const listener = (payload: { event: string; data: any }) => {
          sendEvent(payload.event, payload.data);
        };

        const eventName = `dashboard_${user.id}`;
        sseEmitter.on(eventName, listener);

        // Keep-alive ping every 30 seconds to prevent connection drop
        const interval = setInterval(() => {
          sendEvent("ping", { timestamp: Date.now() });
        }, 30000);

        // Cleanup when client disconnects
        req.signal.addEventListener("abort", () => {
          clearInterval(interval);
          sseEmitter.off(eventName, listener);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to establish SSE" }, { status: 500 });
  }
}
