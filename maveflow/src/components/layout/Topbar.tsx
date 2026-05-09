"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { useSession } from "next-auth/react";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { useEffect, useState } from "react";

export function Topbar() {
  const { data: session } = useSession();
  const { lastEvent, isConnected } = useRealtimeDashboard();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (lastEvent?.event === "notification" || lastEvent?.event === "automation_run_failed") {
      setUnreadCount(prev => prev + 1);
    }
  }, [lastEvent]);

  return (
    <header className="h-16 border-b border-white/10 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-40 px-4 flex items-center justify-between">
      
      {/* Mobile Menu */}
      <div className="md:hidden flex items-center">
        <Sheet>
          <SheetTrigger asChild>
            <button className="p-2 text-zinc-400 hover:text-white">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-zinc-950 border-r border-white/10 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Global Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md ml-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search automations, logs..." 
            className="w-full bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 md:hidden" /> {/* Spacer for mobile */}

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button 
          className="relative p-2 text-zinc-400 hover:text-white transition-colors"
          onClick={() => setUnreadCount(0)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-zinc-950 animate-pulse" />
          )}
          {isConnected && unreadCount === 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-zinc-950" />
          )}
        </button>

        <div className="h-6 w-px bg-white/10" />

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-zinc-500">Personal Workspace</p>
          </div>
          <Avatar className="h-8 w-8 border border-white/10">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="bg-indigo-900 text-indigo-300">
              {session?.user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
