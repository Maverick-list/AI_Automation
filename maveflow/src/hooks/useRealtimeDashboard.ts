"use client";

import { useEffect, useState, useRef } from "react";

type DashboardEvent = {
  event: string;
  data: any;
};

export function useRealtimeDashboard() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<DashboardEvent | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    function connect() {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const es = new EventSource("/api/sse/dashboard");
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0; // Reset backoff
      };

      // General message handler
      es.onmessage = (e) => {
        try {
          // If the server didn't specify an event type, it defaults to "message"
          const data = JSON.parse(e.data);
          setLastEvent({ event: "message", data });
        } catch (err) {}
      };

      // Custom event handlers
      es.addEventListener("automation_run_started", (e) => {
        const data = JSON.parse((e as MessageEvent).data);
        setLastEvent({ event: "automation_run_started", data });
      });

      es.addEventListener("automation_run_completed", (e) => {
        const data = JSON.parse((e as MessageEvent).data);
        setLastEvent({ event: "automation_run_completed", data });
      });

      es.addEventListener("automation_run_failed", (e) => {
        const data = JSON.parse((e as MessageEvent).data);
        setLastEvent({ event: "automation_run_failed", data });
      });

      es.addEventListener("notification", (e) => {
        const data = JSON.parse((e as MessageEvent).data);
        setLastEvent({ event: "notification", data });
      });

      es.onerror = () => {
        setIsConnected(false);
        es.close();

        // Exponential backoff reconnect
        const baseDelay = 2000;
        const maxDelay = 30000;
        const delay = Math.min(baseDelay * Math.pow(2, reconnectAttempts.current), maxDelay);
        reconnectAttempts.current += 1;

        console.warn(`[SSE] Connection lost. Reconnecting in ${delay}ms...`);
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return { isConnected, lastEvent };
}
