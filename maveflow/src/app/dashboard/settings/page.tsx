"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-sm text-zinc-400 mt-1">Manage your account and workspace preferences.</p>
      </div>

      {/* Profile Section */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-lg text-white">Profile</CardTitle>
          <CardDescription className="text-zinc-400">Your personal information connected via Google.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar className="h-20 w-20 border border-white/10">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="text-2xl bg-indigo-900 text-indigo-300">
              {session?.user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-4 flex-1 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Full Name</label>
                <Input defaultValue={session?.user?.name || ""} disabled className="bg-white/5 border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Email Address</label>
                <Input defaultValue={session?.user?.email || ""} disabled className="bg-white/5 border-white/10 text-white" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workspace Section */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-lg text-white">Workspace</CardTitle>
          <CardDescription className="text-zinc-400">Manage your active workspace and team members.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Workspace Name</label>
            <div className="flex gap-2">
              <Input defaultValue="Personal Workspace" className="bg-transparent border-white/10 text-white max-w-md" />
              <Button variant="outline" className="border-white/10 hover:bg-white/10">Save</Button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-medium text-white">Team Members</h4>
                <p className="text-xs text-zinc-400 mt-1">1 member in this workspace</p>
              </div>
              <Button className="bg-white text-black hover:bg-zinc-200">Invite Member</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/20">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback className="bg-indigo-900 text-indigo-300">M</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-white">{session?.user?.name || "You"}</p>
                  <p className="text-xs text-zinc-500">{session?.user?.email}</p>
                </div>
              </div>
              <span className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-md">Owner</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-lg text-white">API Keys</CardTitle>
          <CardDescription className="text-zinc-400">Generate keys to trigger automations via external webhooks.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-200">Personal Access Token</p>
              <p className="text-xs text-amber-500/70 mt-1">Use this token in the Authorization header to call MaveFlow APIs.</p>
            </div>
            <Button variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
              Generate New Token
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-lg text-white">Notifications</CardTitle>
          <CardDescription className="text-zinc-400">Choose what you want to be notified about.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Failed Automations</p>
              <p className="text-xs text-zinc-500">Get an email when a workflow run fails.</p>
            </div>
            <Switch defaultChecked className="data-[state=checked]:bg-indigo-500" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Weekly Summary</p>
              <p className="text-xs text-zinc-500">Receive a weekly report of automation stats.</p>
            </div>
            <Switch defaultChecked className="data-[state=checked]:bg-indigo-500" />
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
