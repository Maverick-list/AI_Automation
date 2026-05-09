"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot, Zap, Shield, Blocks, Mail, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="h-20 border-b border-white/10 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50 flex items-center px-6 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">MaveFlow</span>
        </div>
        <div className="flex-1" />
        <div className="hidden md:flex items-center gap-8 mr-8">
          <Link href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Features</Link>
          <Link href="/pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Pricing</Link>
          <Link href="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Dashboard</Link>
        </div>
        <Link href="/auth/signin">
          <Button className="bg-white text-black hover:bg-zinc-200">Start Free</Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Zap className="h-4 w-4" /> Powered by OpenClaw Engine
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            Automate Your Google Workspace with AI
          </h1>
          <p className="text-lg lg:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Connect Gmail, Drive, Calendar, and more. Let our intelligence engine draft replies, sync files, and manage your schedule while you sleep.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <Link href="/auth/signin">
              <Button size="lg" className="h-14 px-8 text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                Start Automating Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base border-white/10 hover:bg-white/5">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="max-w-5xl mx-auto mt-20 relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/50 backdrop-blur-xl shadow-2xl p-4 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            <div className="h-6 flex items-center gap-2 mb-4">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
            </div>
            {/* Visual Workflow Mock */}
            <div className="h-[400px] w-full bg-black/40 rounded-xl border border-white/5 flex items-center justify-center p-8">
              <div className="flex items-center gap-6">
                <div className="h-24 w-48 bg-zinc-900 border border-indigo-500/30 rounded-xl flex items-center gap-4 p-4">
                  <Mail className="h-8 w-8 text-red-400" />
                  <div>
                    <p className="text-sm font-bold text-white">New Invoice</p>
                    <p className="text-xs text-zinc-500">Trigger</p>
                  </div>
                </div>
                <div className="h-1 w-16 bg-indigo-500/50 relative">
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-8 border-l-indigo-500/50" />
                </div>
                <div className="h-24 w-48 bg-zinc-900 border border-indigo-500/30 rounded-xl flex items-center gap-4 p-4">
                  <Bot className="h-8 w-8 text-indigo-400" />
                  <div>
                    <p className="text-sm font-bold text-white">Extract Data</p>
                    <p className="text-xs text-zinc-500">OpenClaw AI</p>
                  </div>
                </div>
                <div className="h-1 w-16 bg-indigo-500/50 relative">
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-8 border-l-indigo-500/50" />
                </div>
                <div className="h-24 w-48 bg-zinc-900 border border-indigo-500/30 rounded-xl flex items-center gap-4 p-4">
                  <Blocks className="h-8 w-8 text-emerald-400" />
                  <div>
                    <p className="text-sm font-bold text-white">Save to Sheets</p>
                    <p className="text-xs text-zinc-500">Action</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-black relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Why choose MaveFlow?</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">Everything you need to automate your work life and boost productivity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Visual Builder", desc: "Drag and drop your way to complex automations without writing a single line of code." },
              { icon: Bot, title: "AI Powered", desc: "Let OpenClaw understand context, draft emails, and extract unstructured data." },
              { icon: Shield, title: "Secure by Design", desc: "AES-256-GCM encryption ensures your Google tokens are always safe." },
              { icon: Blocks, title: "Deep Integration", desc: "Native support for Gmail, Calendar, Drive, Tasks, Sheets, and Docs." },
              { icon: Calendar, title: "Intelligent Scheduling", desc: "Automatically create Google Meet links and sync with your team." },
              { icon: Mail, title: "Email Triage", desc: "Auto-categorize, label, and reply to important emails using AI intents." },
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-2xl bg-zinc-950 border border-white/5 hover:border-indigo-500/30 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6">
                  <f.icon className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <Bot className="h-6 w-6 text-white" />
            <span className="font-bold text-white">MaveFlow</span>
          </div>
          <p className="text-zinc-500 text-sm">© 2026 MaveFlow. Built with OpenClaw Engine.</p>
        </div>
      </footer>
    </div>
  );
}
