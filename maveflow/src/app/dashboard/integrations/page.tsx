import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar as CalendarIcon, Server, CheckCircle2, ListTodo, FileSpreadsheet, FileText, LayoutTemplate, Key } from "lucide-react";

const googleServices = [
  { id: "gmail", name: "Gmail", icon: Mail, color: "text-red-400", connected: true, scopes: ["Send Emails", "Read Inbox", "Manage Drafts"] },
  { id: "drive", name: "Google Drive", icon: Server, color: "text-blue-400", connected: true, scopes: ["Upload Files", "Read Files", "Webhooks"] },
  { id: "calendar", name: "Google Calendar", icon: CalendarIcon, color: "text-indigo-400", connected: true, scopes: ["Manage Events", "Google Meet"] },
  { id: "tasks", name: "Google Tasks", icon: ListTodo, color: "text-emerald-400", connected: true, scopes: ["Manage Tasks"] },
  { id: "sheets", name: "Google Sheets", icon: FileSpreadsheet, color: "text-emerald-500", connected: false, scopes: ["Read Spreadsheets", "Write Data"] },
  { id: "docs", name: "Google Docs", icon: FileText, color: "text-blue-500", connected: false, scopes: ["Create Documents", "Edit Text"] },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Integrations</h1>
        <p className="text-sm text-zinc-400 mt-1">Connect MaveFlow with your favorite services.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* OpenClaw Card - Featured */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-br from-indigo-900/20 to-zinc-950 border-indigo-500/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
             <LayoutTemplate className="w-32 h-32" />
          </div>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <LayoutTemplate className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">OpenClaw AI Engine</CardTitle>
                <CardDescription className="text-zinc-400 mt-1">The core intelligence driving your automations.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/40 p-4 rounded-lg border border-white/5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm font-medium text-white">API Connection</span>
                </div>
                <p className="text-xs text-zinc-500">Connected to local instance (http://localhost:5000)</p>
              </div>
              <Button variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
                Configure Engine
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Google Workspace Services */}
        {googleServices.map((service) => (
          <Card key={service.id} className="bg-white/5 border-white/10 flex flex-col hover:border-white/20 transition-colors">
            <CardHeader className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center ${service.color}`}>
                    <service.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-white">{service.name}</CardTitle>
                    {service.connected ? (
                      <div className="flex items-center gap-1 mt-1 text-xs text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Connected
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 mt-1">Not connected</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-1.5">
                {service.scopes.map(scope => (
                  <Badge key={scope} variant="outline" className="text-[10px] bg-white/5 border-white/10 text-zinc-300">
                    {scope}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-5">
              {service.connected ? (
                <Button variant="outline" className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/30">
                  Revoke Access
                </Button>
              ) : (
                <Button className="w-full bg-white text-black hover:bg-zinc-200">
                  Connect Account
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        
      </div>
    </div>
  );
}
