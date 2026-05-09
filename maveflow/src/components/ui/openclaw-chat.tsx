"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Minimize2, Maximize2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function OpenClawChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Load chat history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("openclaw_chat_history");
    const savedSession = localStorage.getItem("openclaw_chat_session");
    if (saved) setMessages(JSON.parse(saved));
    if (savedSession) setSessionId(savedSession);
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("openclaw_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  const startSession = async () => {
    try {
      const res = await fetch("/api/openclaw/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: { currentPath: pathname }
        })
      });
      const data = await res.json();
      if (data.sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem("openclaw_chat_session", data.sessionId);
        return data.sessionId;
      }
    } catch (e) {
      console.error("Failed to start session:", e);
    }
    return null;
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsStreaming(true);

    let activeSessionId = sessionId;
    if (!activeSessionId) {
      activeSessionId = await startSession();
      if (!activeSessionId) {
        setMessages(prev => [...prev, { role: "assistant", content: "Error: Engine is unreachable." }]);
        setIsStreaming(false);
        return;
      }
    }

    try {
      // Add empty assistant message to append to
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      const response = await fetch(`/api/openclaw/session/${activeSessionId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        // SSE parsing logic
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  const lastMsg = newMsgs[newMsgs.length - 1];
                  lastMsg.content += data.chunk;
                  return newMsgs;
                });
              }
            } catch (e) { /* ignore parse error on incomplete chunks */ }
          }
        }
      }
    } catch (error) {
      setMessages(prev => {
        const newMsgs = [...prev];
        const lastMsg = newMsgs[newMsgs.length - 1];
        lastMsg.content = "I encountered an error connecting to the intelligence engine.";
        return newMsgs;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 bg-indigo-600 rounded-full shadow-2xl shadow-indigo-500/30 flex items-center justify-center hover:bg-indigo-700 transition-all z-50 animate-in zoom-in"
      >
        <Bot className="h-6 w-6 text-white" />
      </button>
    );
  }

  return (
    <div className={cn(
      "fixed right-6 z-50 flex flex-col bg-zinc-950 border border-white/10 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300",
      isMinimized ? "bottom-6 w-72 h-14" : "bottom-6 w-80 sm:w-96 h-[500px]"
    )}>
      {/* Header */}
      <div className="h-14 bg-white/5 border-b border-white/10 px-4 flex items-center justify-between shrink-0 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
            <Bot className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white leading-none">OpenClaw AI</h3>
            <p className="text-[10px] text-zinc-400 mt-1">Context-aware assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            className="p-1.5 text-zinc-400 hover:bg-white/10 rounded-md transition-colors"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            className="p-1.5 text-zinc-400 hover:bg-white/10 hover:text-red-400 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <>
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-transparent to-black/20">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <Bot className="h-12 w-12 text-indigo-400 mb-3" />
                <p className="text-sm text-white">How can I assist you today?</p>
                <p className="text-xs text-zinc-400 mt-2 px-6">
                  Try: "/email john@doe.com about the report" or "/schedule a meeting tomorrow"
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[80%] p-3 rounded-2xl text-sm",
                  msg.role === "user" 
                    ? "bg-indigo-600 text-white rounded-br-sm" 
                    : "bg-white/10 text-zinc-200 border border-white/5 rounded-bl-sm"
                )}>
                  {msg.content || <span className="animate-pulse">...</span>}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white/5 border-t border-white/10 shrink-0">
            <div className="relative flex items-center">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask or command OpenClaw..."
                disabled={isStreaming}
                className="w-full bg-black/40 border border-white/10 rounded-full py-2.5 pl-4 pr-10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="absolute right-1.5 h-7 w-7 bg-indigo-600 rounded-full flex items-center justify-center text-white disabled:opacity-50 hover:bg-indigo-700 transition-colors"
              >
                {isStreaming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 ml-0.5" />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
