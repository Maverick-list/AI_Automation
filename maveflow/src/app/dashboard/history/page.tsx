"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const mockHistory = [
  { id: "run_1", automation: "Auto Reply to Invoices", trigger: "Gmail (New Email)", status: "SUCCESS" as const, duration: "1.2s", timestamp: "Oct 24, 14:32:01", logs: [
    { time: "14:32:01", level: "info", message: "Trigger detected: 1 new email matching 'invoice'." },
    { time: "14:32:01", level: "info", message: "Action 1: Extracted attachment." },
    { time: "14:32:02", level: "success", message: "Action 2: Forwarded to finance@example.com." },
  ]},
  { id: "run_2", automation: "Sync Google Drive to Sheets", trigger: "Drive (File Upload)", status: "FAILED" as const, duration: "3.5s", timestamp: "Oct 24, 12:15:44", logs: [
    { time: "12:15:44", level: "info", message: "File upload detected." },
    { time: "12:15:46", level: "error", message: "Google Sheets API Error: 403 Permission Denied. Check your scopes." },
  ]},
  { id: "run_3", automation: "Daily Standup Reminder", trigger: "Schedule (9:00 AM)", status: "SUCCESS" as const, duration: "4.1s", timestamp: "Oct 24, 09:00:00", logs: [
    { time: "09:00:00", level: "info", message: "Cron triggered." },
    { time: "09:00:04", level: "success", message: "Message sent to Slack via OpenClaw." },
  ]},
];

export default function HistoryPage() {
  const [selectedRun, setSelectedRun] = useState<typeof mockHistory[0] | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Run History</h1>
          <p className="text-sm text-zinc-400 mt-1">Audit logs of all automation executions.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Search runs..." 
              className="bg-black/20 border-white/10 h-9 w-[250px] pl-9 text-white" 
            />
          </div>
          <Button variant="outline" className="h-9 border-white/10 bg-transparent text-zinc-300 hover:text-white">
            <Filter className="mr-2 h-4 w-4" /> Filter Status
          </Button>
        </div>
        <p className="text-xs text-zinc-500">Showing last 50 runs</p>
      </div>

      {/* Table */}
      <div className="border border-white/10 rounded-xl bg-white/5 overflow-hidden flex-1">
        <Table>
          <TableHeader className="bg-black/20 hover:bg-black/20 border-b border-white/10">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-zinc-400 font-medium h-10">Automation</TableHead>
              <TableHead className="text-zinc-400 font-medium h-10">Trigger</TableHead>
              <TableHead className="text-zinc-400 font-medium h-10">Status</TableHead>
              <TableHead className="text-zinc-400 font-medium h-10">Duration</TableHead>
              <TableHead className="text-zinc-400 font-medium h-10 text-right">Timestamp</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockHistory.map((run) => (
              <TableRow 
                key={run.id} 
                className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                onClick={() => setSelectedRun(run)}
              >
                <TableCell className="font-medium text-white">{run.automation}</TableCell>
                <TableCell className="text-zinc-400 text-sm">{run.trigger}</TableCell>
                <TableCell><StatusBadge status={run.status} /></TableCell>
                <TableCell className="text-zinc-400 font-mono text-xs">{run.duration}</TableCell>
                <TableCell className="text-zinc-400 text-right text-xs">{run.timestamp}</TableCell>
                <TableCell>
                  <ChevronRight className="h-4 w-4 text-zinc-600" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Log Modal */}
      <Dialog open={!!selectedRun} onOpenChange={(open) => !open && setSelectedRun(null)}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-2xl">
          <DialogHeader className="border-b border-white/10 pb-4">
            <DialogTitle className="flex items-center justify-between">
              <span>Run Details: {selectedRun?.automation}</span>
              <StatusBadge status={selectedRun?.status || "PENDING"} />
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-black border border-white/10 rounded-lg p-4 font-mono text-xs overflow-auto max-h-[400px] space-y-2">
              {selectedRun?.logs.map((log, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-zinc-500 shrink-0">[{log.time}]</span>
                  <span className={`
                    ${log.level === 'info' ? 'text-blue-400' : ''}
                    ${log.level === 'success' ? 'text-emerald-400' : ''}
                    ${log.level === 'error' ? 'text-red-400' : ''}
                  `}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
