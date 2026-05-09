"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Workflow, 
  Blocks, 
  History, 
  Settings,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Automations", href: "/dashboard/automations", icon: Workflow },
  { name: "Integrations", href: "/dashboard/integrations", icon: Blocks },
  { name: "History", href: "/dashboard/history", icon: History },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex w-64 flex-col bg-zinc-950 border-r border-white/10 h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">MaveFlow</span>
      </div>

      <div className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-indigo-600/10 text-indigo-400" 
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-indigo-400" : "text-zinc-500")} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="p-4 rounded-xl bg-gradient-to-b from-white/5 to-transparent border border-white/10">
          <p className="text-xs font-medium text-zinc-400 mb-2">Workspace Plan</p>
          <div className="flex items-end justify-between">
            <span className="font-bold text-white">PRO</span>
            <span className="text-[10px] text-indigo-400">Manage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
