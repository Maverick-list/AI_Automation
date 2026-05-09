"use client";

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Activity, Zap, Database, Mail, Calendar, Server, BrainCircuit, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VisitorLanding() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-mesh text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-[#030712]/60 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <span className="text-2xl font-black bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">G</span>
            </div>
            <span className="text-xl font-bold tracking-tighter text-white flex items-center gap-2">
              Workspace <span className="text-slate-500 font-normal">x</span> <span className="text-blue-400">OpenClaw</span>
            </span>
          </motion.div>
          <motion.button 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push('/auth')}
            className="group relative px-6 py-2.5 font-bold text-sm rounded-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-sm border border-blue-500/50 rounded-full transition-colors group-hover:bg-blue-500/40"></div>
            <span className="relative z-10 flex items-center gap-2 text-blue-100 group-hover:text-white transition-colors">
              Access Control Center <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section style={{ opacity, scale }} className="relative pt-40 pb-32 px-6 flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-5xl mx-auto text-center space-y-10 z-10">
          
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-900/20 border border-blue-500/30 backdrop-blur-md">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <span className="text-sm font-bold text-blue-300 tracking-wide uppercase">System Infrastructure is Online</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }} className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[1.1]">
            Unify Your Ecosystem. <br className="hidden md:block"/>
            <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              Automate Everything.
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
            Google Workspace x OpenClaw integrates 7 core API modules (Gmail, Drive, Calendar, Sheets, Tasks) with the cognitive power of Gemini AI and WhatsApp broadcasting—all managed from a single hyper-secure dashboard.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }} className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
            <button onClick={() => router.push('/auth')} className="group relative px-8 py-5 bg-white text-black font-extrabold text-lg rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-emerald-200 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Server size={22} className="relative z-10" /> 
              <span className="relative z-10">Launch Dashboard</span>
            </button>
            <button onClick={scrollToFeatures} className="group px-8 py-5 bg-slate-900/50 text-white font-extrabold text-lg rounded-2xl flex items-center justify-center gap-3 border border-slate-700/50 hover:bg-slate-800/80 backdrop-blur-md hover:scale-105 transition-all">
              Explore Integrations <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Trust Badges */}
      <section className="py-12 border-y border-white/5 bg-slate-950/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 text-slate-400 font-bold tracking-widest uppercase text-sm">
           <span>⚡ Real-Time Sync</span>
           <span>🛡️ Bank-Grade Security</span>
           <span>🧠 Multi-Agent AI</span>
           <span>🌐 Global Infrastructure</span>
        </div>
      </section>

      {/* Core Integrations Matrix */}
      <section id="features-section" className="py-32 relative z-10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20 text-center">
             <h2 className="text-5xl font-black text-white mb-6 tracking-tight">The 7-Pillar Integration Matrix</h2>
             <p className="text-xl text-slate-400 max-w-2xl mx-auto">Seamlessly bridging Google's productivity suite with advanced AI automation.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Mail/>, title: "Gmail & Calendar", desc: "Automate email monitoring and intelligent event scheduling.", color: "from-red-500/20 to-orange-500/20", glow: "hover:shadow-[0_0_40px_rgba(239,68,68,0.2)]" },
              { icon: <Database/>, title: "Sheets & Drive", desc: "Cloud-native database management and file repository sync.", color: "from-emerald-500/20 to-teal-500/20", glow: "hover:shadow-[0_0_40px_rgba(16,185,129,0.2)]" },
              { icon: <BrainCircuit/>, title: "Gemini AI Brain", desc: "Context-aware conversational intelligence powering your system.", color: "from-purple-500/20 to-indigo-500/20", glow: "hover:shadow-[0_0_40px_rgba(168,85,247,0.2)]" },
              { icon: <Activity/>, title: "WhatsApp Core", desc: "Omni-channel marketing broadcaster and automated customer support.", color: "from-blue-500/20 to-cyan-500/20", glow: "hover:shadow-[0_0_40px_rgba(59,130,246,0.2)]" },
              { icon: <FileText/>, title: "Google Tasks", desc: "Dynamic task delegation mapped directly from WhatsApp commands.", color: "from-amber-500/20 to-yellow-500/20", glow: "hover:shadow-[0_0_40px_rgba(245,158,11,0.2)]" },
              { icon: <Server/>, title: "Microservice Arch", desc: "Python Flask backend intertwined with a lightning-fast React frontend.", color: "from-slate-500/20 to-zinc-500/20", glow: "hover:shadow-[0_0_40px_rgba(148,163,184,0.2)]" },
            ].map((feat, i) => (
              <motion.div 
                key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}
                className={`glow-border bg-slate-900/60 p-8 rounded-[2rem] backdrop-blur-xl transition-all duration-500 ${feat.glow} group border border-slate-800`}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feat.color} mb-6 flex items-center justify-center text-white/80 group-hover:scale-110 group-hover:text-white transition-all duration-300 border border-white/5`}>
                  {feat.icon}
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight mb-3 group-hover:text-blue-400 transition-colors">{feat.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-12 bg-slate-950 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-6">
          <p className="text-slate-500 font-medium tracking-wide">© 2026 Google Workspace x OpenClaw. Enterprise Edition.</p>
        </div>
      </footer>
    </div>
  );
}
