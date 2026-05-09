import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AutomationCard } from "@/components/ui/automation-card";
import Link from "next/link";

const mockAutomations = [
  {
    id: "1",
    name: "Auto Reply to Invoices",
    description: "When an email with 'invoice' arrives, forward it to finance.",
    triggerType: "gmail" as const,
    isActive: true,
    lastRunTime: "2 mins ago",
    lastRunStatus: "SUCCESS" as const,
  },
  {
    id: "2",
    name: "Sync Google Drive to Sheets",
    description: "Logs every new file uploaded to the Marketing folder into a tracker sheet.",
    triggerType: "drive" as const,
    isActive: true,
    lastRunTime: "1 hour ago",
    lastRunStatus: "SUCCESS" as const,
  },
  {
    id: "3",
    name: "Daily Standup Reminder",
    description: "Sends a daily reminder at 9 AM and asks OpenClaw to summarize yesterday's tasks.",
    triggerType: "schedule" as const,
    isActive: false,
    lastRunTime: "Yesterday",
    lastRunStatus: "FAILED" as const,
  },
];

export default function AutomationsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Automations</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage and monitor your automated workflows.</p>
        </div>
        <Link href="/dashboard/automations/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]">
            <Plus className="mr-2 h-4 w-4" />
            New Workflow
          </Button>
        </Link>
      </div>

      <div className="flex-1 flex flex-col">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="all" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-zinc-400">All</TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-zinc-400">Active</TabsTrigger>
              <TabsTrigger value="inactive" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-zinc-400">Inactive</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Filter automations..." 
                  className="bg-white/5 border border-white/10 rounded-md py-1.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-[200px]"
                />
              </div>
              <Button variant="outline" size="icon" className="border-white/10 bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 h-9 w-9">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockAutomations.map((auto) => (
                <AutomationCard key={auto.id} {...auto} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="active" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockAutomations.filter(a => a.isActive).map((auto) => (
                <AutomationCard key={auto.id} {...auto} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="inactive" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockAutomations.filter(a => !a.isActive).map((auto) => (
                <AutomationCard key={auto.id} {...auto} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
