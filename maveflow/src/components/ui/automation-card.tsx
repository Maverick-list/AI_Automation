"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  MoreVertical, 
  Play, 
  Mail, 
  Calendar as CalendarIcon, 
  FileText, 
  Clock 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface AutomationCardProps {
  id: string;
  name: string;
  description: string;
  triggerType: "gmail" | "calendar" | "drive" | "schedule";
  isActive: boolean;
  lastRunTime: string;
  lastRunStatus: "SUCCESS" | "FAILED" | "PENDING";
}

export function AutomationCard({
  id,
  name,
  description,
  triggerType,
  isActive: initialIsActive,
  lastRunTime,
  lastRunStatus,
}: AutomationCardProps) {
  const [isActive, setIsActive] = useState(initialIsActive);

  const getTriggerIcon = () => {
    switch (triggerType) {
      case "gmail": return <Mail className="h-4 w-4 text-red-400" />;
      case "calendar": return <CalendarIcon className="h-4 w-4 text-blue-400" />;
      case "drive": return <FileText className="h-4 w-4 text-emerald-400" />;
      case "schedule": return <Clock className="h-4 w-4 text-amber-400" />;
      default: return <Clock className="h-4 w-4 text-zinc-400" />;
    }
  };

  return (
    <Card className="bg-white/5 border-white/10 hover:border-indigo-500/30 transition-all duration-300 group">
      <CardHeader className="p-5 pb-3 flex flex-row items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            {getTriggerIcon()}
          </div>
          <div>
            <Link href={`/dashboard/automations/${id}`} className="hover:underline decoration-white/30 underline-offset-4">
              <h3 className="font-semibold text-white text-base leading-none">{name}</h3>
            </Link>
            <p className="text-sm text-zinc-400 mt-2 line-clamp-1">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={isActive ? "ACTIVE" : "INACTIVE"} />
          <Switch 
            checked={isActive} 
            onCheckedChange={setIsActive}
            className="data-[state=checked]:bg-indigo-500" 
          />
          <DropdownMenu>
            <DropdownMenuTrigger className="p-1 text-zinc-400 hover:text-white outline-none">
              <MoreVertical className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-zinc-950 border-white/10 text-white">
              <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">
                <Play className="mr-2 h-4 w-4" /> Run Now
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">Edit Workflow</DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">View Logs</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-3">
        <div className="flex items-center justify-between text-xs border-t border-white/5 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Last run:</span>
            <span className="text-zinc-300">{lastRunTime}</span>
          </div>
          <StatusBadge status={lastRunStatus} className="text-[10px] px-2 py-0" />
        </div>
      </CardContent>
    </Card>
  );
}
