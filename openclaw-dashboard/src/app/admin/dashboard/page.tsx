"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Mail, Calendar, CheckSquare, Database, FileText, Brain,
  MessageSquare, Play, Square, Settings, Send, RefreshCw, Smartphone, Edit3, Save, LogOut
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [healthStatus, setHealthStatus] = useState<any>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    setIsRefreshing(true);
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/health');
      setHealthStatus(res.data);
    } catch (e) {
      console.error("Failed to fetch health status");
    }
    setIsRefreshing(false);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/auth' });
  };

  // Dummy state for AI Config
  const [systemPrompt, setSystemPrompt] = useState("Kamu adalah Mave AI, asisten penjualan Dimsum dan makanan kampus.");
  const [aiTemperature, setAiTemperature] = useState(0.7);

  const menuItems = [
    { id: 'home', icon: <Activity size={20} />, label: 'System Integrity' },
    { id: 'office', icon: <Mail size={20} />, label: 'Office Suite' },
    { id: 'data', icon: <Database size={20} />, label: 'Data Center' },
    { id: 'ai', icon: <Brain size={20} />, label: 'AI Configuration' },
    { id: 'wa', icon: <MessageSquare size={20} />, label: 'WhatsApp Core' },
  ];

  const getStatusColor = (status: string) => status === 'Connected' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]';

  return (
    <div className="flex h-screen bg-[#080a0f] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-hidden">
      
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -300 }} animate={{ x: 0 }} transition={{ type: "spring", stiffness: 100 }}
        className="w-72 bg-[#11141d]/90 backdrop-blur-xl border-r border-slate-800/50 flex flex-col p-6 shadow-2xl z-20 relative"
      >
        <div className="mb-12 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)]">
             <span className="text-2xl font-black bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">G</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
              Workspace <span className="text-slate-500 font-normal">x</span> <span className="text-blue-400">OpenClaw</span>
            </h1>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold">Admin Panel</p>
          </div>
        </div>
        
        {session?.user && (
          <div className="flex items-center gap-3 mb-8 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
             {session.user.image ? (
               <img src={session.user.image} alt="Profile" className="w-10 h-10 rounded-full border border-slate-600" />
             ) : (
               <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                 {session.user.name?.charAt(0) || 'A'}
               </div>
             )}
             <div>
               <p className="text-sm font-bold text-white">{session.user.name}</p>
               <p className="text-[10px] text-slate-400 truncate w-32">{session.user.email}</p>
             </div>
          </div>
        )}

        <nav className="flex-1 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${
                activeTab === item.id ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {activeTab === item.id && (
                <motion.div layoutId="activeTab" className="absolute inset-0 bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-lg -z-10" />
              )}
              {item.icon}
              <span className="text-sm tracking-wide z-10">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-medium transition-colors border border-rose-500/20">
            <LogOut size={18} /> Secure Logout
          </button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

        <main className="p-10 max-w-7xl mx-auto relative z-10">
          <AnimatePresence mode="wait">
            
            {/* HOME TAB: System Integrity */}
            {activeTab === 'home' && (
              <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50 backdrop-blur-md">
                  <div><h2 className="text-3xl font-bold text-white tracking-tight">System Integrity</h2><p className="text-slate-400 mt-1">Real-time status of 7 Core APIs.</p></div>
                  <button onClick={fetchHealth} disabled={isRefreshing} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all border border-slate-700 disabled:opacity-50 font-medium text-sm">
                    <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-cyan-400' : ''} /> Refresh Check
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {['gmail', 'calendar', 'tasks', 'sheets', 'drive', 'gemini', 'whatsapp'].map((key) => (
                    <motion.div whileHover={{ scale: 1.02 }} key={key} className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/60 flex items-center gap-4 hover:border-slate-700 transition-colors backdrop-blur-sm">
                      <div className="p-3 bg-slate-800 rounded-xl text-slate-300 capitalize font-bold text-lg">{key[0]}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-200 capitalize">{key} API</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(healthStatus[key])}`}></div>
                          <span className="text-xs text-slate-400 font-medium">{healthStatus[key] || 'Checking...'}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* DATA CENTER TAB */}
            {activeTab === 'data' && (
              <motion.div key="data" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <h2 className="text-3xl font-bold text-white tracking-tight">Data Center (Sheets & Drive)</h2>
                <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/50 backdrop-blur-md">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2"><Database className="text-cyan-400"/> Operational Logs (Google Sheets)</h3>
                    <button onClick={() => window.open('https://docs.google.com/spreadsheets/', '_blank')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-semibold border border-slate-700 transition-colors flex items-center gap-2">
                      <Edit3 size={16}/> Access Master Sheet
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                      <thead className="text-xs text-slate-300 uppercase bg-slate-800/50 border-b border-slate-700">
                        <tr><th className="px-4 py-3 rounded-tl-lg">Log ID</th><th className="px-4 py-3">Event Type</th><th className="px-4 py-3">Timestamp</th><th className="px-4 py-3">Source</th><th className="px-4 py-3 rounded-tr-lg">Status</th></tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-800/50 hover:bg-slate-800/30"><td className="px-4 py-3">SYS-091</td><td className="px-4 py-3 font-medium text-white">OAuth Refresh</td><td className="px-4 py-3">10 mins ago</td><td className="px-4 py-3">Gmail Module</td><td className="px-4 py-3"><span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md text-xs">Success</span></td></tr>
                        <tr className="border-b border-slate-800/50 hover:bg-slate-800/30"><td className="px-4 py-3">SYS-092</td><td className="px-4 py-3 font-medium text-white">Broadcast Exec</td><td className="px-4 py-3">1 hour ago</td><td className="px-4 py-3">WhatsApp Core</td><td className="px-4 py-3"><span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-md text-xs">Pending Retry</span></td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/50 backdrop-blur-md">
                   <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><FileText className="text-blue-400"/> System Archives (Google Drive)</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {[1,2,3,4].map(i => (
                        <div key={i} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-slate-800 transition-colors cursor-pointer">
                          <FileText size={32} className="text-slate-500"/>
                          <span className="text-xs font-medium">sys_backup_v{i}.json</span>
                        </div>
                     ))}
                   </div>
                </div>
              </motion.div>
            )}

            {/* AI CONFIG TAB */}
            {activeTab === 'ai' && (
              <motion.div key="ai" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <h2 className="text-3xl font-bold text-white tracking-tight">AI Brain Configuration</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/50 backdrop-blur-md space-y-5">
                    <h3 className="text-xl font-bold flex items-center gap-2"><Brain className="text-purple-400"/> System Persona (Prompt)</h3>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Instructions for Mave AI</label>
                      <textarea 
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        className="w-full h-40 bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Creativity (Temperature: {aiTemperature})</label>
                      <input type="range" min="0" max="1" step="0.1" value={aiTemperature} onChange={(e) => setAiTemperature(parseFloat(e.target.value))} className="w-full accent-purple-500" />
                      <div className="flex justify-between text-xs text-slate-500 mt-1"><span>Strict (0.0)</span><span>Creative (1.0)</span></div>
                    </div>
                    <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                      <Save size={18} /> Update AI Brain
                    </button>
                  </div>
                  
                  <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/50 backdrop-blur-md">
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><Settings className="text-slate-400"/> Model Status</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                        <span className="font-medium">Active Model</span>
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full font-bold">gemini-3.1-flash-lite</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                        <span className="font-medium">Context Window Limit</span>
                        <span className="text-slate-400">1M Tokens</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

             {/* WA TAB */}
             {activeTab === 'wa' && (
              <motion.div key="wa" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <h2 className="text-3xl font-bold text-white tracking-tight">WhatsApp Core</h2>
                <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/50 backdrop-blur-md">
                   <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Send className="text-blue-400"/> Sounding Broadcaster</h3>
                   <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Target Network (WhatsApp Groups / Contacts)</label>
                      <input type="text" placeholder="e.g. Developer Team, Marketing Channel" className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Broadcast Payload</label>
                      <textarea rows={4} placeholder="Hello Team, urgent system update required..." className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"></textarea>
                    </div>
                    <button className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2">
                      <Send size={18} /> Execute Network Broadcast
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

             {/* OFFICE TAB */}
             {activeTab === 'office' && (
              <motion.div key="office" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <h2 className="text-3xl font-bold text-white tracking-tight">Office Suite</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/50 backdrop-blur-md">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Calendar className="text-purple-400"/> System Events</h3>
                    <div className="space-y-3">
                       <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/30 border-l-4 border-l-purple-500">
                        <p className="text-sm font-semibold">Server Maintenance Window</p>
                        <p className="text-xs text-slate-400 mt-1">Tomorrow, 02:00 AM</p>
                      </div>
                      <button className="w-full py-3 mt-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl transition-all">Schedule New Event</button>
                    </div>
                  </div>
                   <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/50 backdrop-blur-md">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Mail className="text-cyan-400"/> Mail Interceptor</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
                        <p className="text-sm font-semibold">API Quota Alert</p>
                        <p className="text-xs text-slate-400 mt-1">From: noreply@google.com</p>
                      </div>
                      <button className="w-full py-3 mt-2 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]">Draft Secure Mail</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
