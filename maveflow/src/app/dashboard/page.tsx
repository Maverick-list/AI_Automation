import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Zap, CheckCircle2, Clock, Mail, Server } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardHome() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Overview</h1>
          <p className="text-sm text-zinc-400 mt-1">Here's what's happening in your workspace today.</p>
        </div>
        <Link href="/dashboard/automations/[id]?action=new" as="/dashboard/automations/new">
          <Button className="bg-white text-black hover:bg-zinc-200">
            <Zap className="mr-2 h-4 w-4" />
            Create Automation
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Automations</CardTitle>
            <Activity className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">12</div>
            <p className="text-xs text-zinc-500 mt-1">8 active currently</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Runs Today</CardTitle>
            <Zap className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1,043</div>
            <p className="text-xs text-emerald-400 mt-1">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">99.8%</div>
            <p className="text-xs text-zinc-500 mt-1">2 failed runs</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">8,234</div>
            <p className="text-xs text-zinc-500 mt-1">Across all workflows</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Activity Feed */}
        <Card className="lg:col-span-2 bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-white">Auto Reply to Invoices</p>
                    <p className="text-xs text-zinc-400">Processed email from john@doe.com and sent to finance.</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status="SUCCESS" />
                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 2m ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="link" className="w-full mt-4 text-indigo-400 hover:text-indigo-300">
              View all history →
            </Button>
          </CardContent>
        </Card>

        {/* Connected Services */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-white">Service Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-red-500/10 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Gmail</p>
                  <p className="text-xs text-emerald-400">Connected</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-blue-500/10 flex items-center justify-center">
                  <Server className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Google Drive</p>
                  <p className="text-xs text-emerald-400">Connected</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-indigo-500/10 flex items-center justify-center">
                  <Server className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">OpenClaw Engine</p>
                  <p className="text-xs text-emerald-400">Operational</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
