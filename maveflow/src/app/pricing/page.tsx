"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-indigo-500/30">
      
      {/* Navigation (Simple version for sub-pages) */}
      <nav className="h-20 border-b border-white/10 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50 flex items-center px-6 lg:px-12">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">MaveFlow</span>
        </Link>
        <div className="flex-1" />
        <Link href="/dashboard">
          <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-white/5">Go to Dashboard</Button>
        </Link>
      </nav>

      <section className="pt-24 pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-3xl mx-auto text-center mb-16 relative z-10">
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-white mb-6">Simple, transparent pricing</h1>
          <p className="text-lg text-zinc-400">Start automating for free, upgrade when you need more power.</p>
          
          <div className="flex items-center justify-center gap-4 mt-10">
            <span className={`text-sm ${!isAnnual ? "text-white" : "text-zinc-500"}`}>Monthly</span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} className="data-[state=checked]:bg-indigo-500" />
            <span className={`text-sm flex items-center gap-2 ${isAnnual ? "text-white" : "text-zinc-500"}`}>
              Annually <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          
          {/* FREE PLAN */}
          <div className="rounded-3xl p-8 bg-white/5 border border-white/10 flex flex-col">
            <h3 className="text-xl font-medium text-white mb-2">Starter</h3>
            <p className="text-zinc-400 text-sm mb-6">Perfect for personal automation.</p>
            <div className="mb-8">
              <span className="text-5xl font-bold text-white">$0</span>
              <span className="text-zinc-500">/mo</span>
            </div>
            <Link href="/auth/signin" className="w-full">
              <Button className="w-full bg-white text-black hover:bg-zinc-200 h-12">Get Started</Button>
            </Link>
            <div className="mt-8 space-y-4 flex-1">
              {["100 Runs per month", "3 Active Automations", "Basic Google API Integration", "Community Support"].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span className="text-sm text-zinc-300">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PRO PLAN */}
          <div className="rounded-3xl p-8 bg-zinc-900 border-2 border-indigo-500 relative flex flex-col shadow-[0_0_40px_rgba(79,70,229,0.15)] transform md:-translate-y-4">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Pro</h3>
            <p className="text-indigo-200 text-sm mb-6">For professionals and small teams.</p>
            <div className="mb-8">
              <span className="text-5xl font-bold text-white">${isAnnual ? "15" : "19"}</span>
              <span className="text-zinc-400">/mo</span>
            </div>
            <Link href="/auth/signin" className="w-full">
              <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white h-12 shadow-lg shadow-indigo-500/25">Upgrade to Pro</Button>
            </Link>
            <div className="mt-8 space-y-4 flex-1">
              {[
                "10,000 Runs per month", 
                "Unlimited Automations", 
                "OpenClaw AI Access (GPT-4 class)", 
                "Priority Email Support",
                "Advanced Webhooks",
                "1-minute Sync Interval"
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0" />
                  <span className="text-sm text-zinc-200">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ENTERPRISE PLAN */}
          <div className="rounded-3xl p-8 bg-white/5 border border-white/10 flex flex-col">
            <h3 className="text-xl font-medium text-white mb-2">Enterprise</h3>
            <p className="text-zinc-400 text-sm mb-6">Custom scale and security.</p>
            <div className="mb-8">
              <span className="text-5xl font-bold text-white">Custom</span>
            </div>
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 h-12">Contact Sales</Button>
            <div className="mt-8 space-y-4 flex-1">
              {["Unlimited Runs", "Custom AI Models", "Dedicated Account Manager", "SLA Guarantee", "On-Premise Deployment Option"].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-zinc-400 shrink-0" />
                  <span className="text-sm text-zinc-400">{f}</span>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </section>

    </div>
  );
}
