"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, ChevronRight, User, KeyRound, Zap, Fingerprint } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { signIn } from 'next-auth/react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authProvider, setAuthProvider] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthProvider('email');
    
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl: '/admin/dashboard'
    });

    if (result?.error) {
      toast.error('Kredensial Admin Salah!');
      setIsLoading(false);
      setAuthProvider(null);
    } else if (result?.url) {
      toast.success('Akses Admin Diberikan!', { icon: '🔓' });
      window.location.href = result.url;
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setAuthProvider('google');
    toast('Redirecting to Google Secure Login...', { icon: '🔄' });
    signIn('google', { callbackUrl: '/admin/dashboard' });
  };

  const handlePhoneLogin = () => {
    toast.error('Telepon belum dikonfigurasi. Gunakan Google atau Admin Protocol.');
  };

  return (
    <div className="min-h-screen bg-[#030712] flex font-sans text-slate-200">
      
      {/* Left Panel - Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-mesh relative flex-col justify-between p-12 overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 z-0"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)]">
             <span className="text-3xl font-black bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">G</span>
          </div>
          <span className="text-3xl font-bold tracking-tighter text-white">
            Workspace <span className="text-slate-500 font-normal">x</span> <span className="text-blue-400 font-black">OpenClaw</span>
          </span>
        </div>

        <div className="relative z-10 max-w-lg">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
              <span className="text-sm font-bold text-white tracking-wider uppercase">Enterprise Edition V2</span>
           </motion.div>
           <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl font-black text-white leading-tight mb-6">
             Centralized Control for <br/>
             <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Google API Automation.</span>
           </motion.h1>
           <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-lg text-slate-300 font-medium">
             Manage Gmail, Calendar, Sheets, Drive, Tasks, Gemini AI, and WhatsApp directly from a single, unified interface.
           </motion.p>
        </div>

        <div className="relative z-10 flex gap-4 text-slate-400 text-sm font-medium">
           <span>Secure</span> • <span>Encrypted</span> • <span>Lightning Fast</span>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-cyan-500/5 to-purple-500/5 z-0"></div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md relative z-10"
        >
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 mb-6 shadow-xl lg:hidden">
              <Zap className="text-cyan-400" size={28} fill="currentColor" />
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-400 mt-2 font-medium">
              {isLogin ? 'Enter your credentials to securely log in.' : 'Register to gain administrative access.'}
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative">
                  <User className="absolute left-4 top-4 text-slate-500" size={20} />
                  <input type="text" placeholder="Full Name" required disabled={isLoading} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-500" size={20} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin Email" required disabled={isLoading} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50" />
            </div>

            <div className="relative">
              <KeyRound className="absolute left-4 top-4 text-slate-500" size={20} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Passcode" required disabled={isLoading} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50" />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="group w-full bg-white text-black hover:bg-slate-200 font-extrabold py-4 rounded-2xl transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center gap-3 mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading && authProvider === 'email' ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
              ) : (
                <>{isLogin ? 'Authenticate' : 'Initialize Account'} <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>

            <div className="relative flex items-center py-6">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase font-bold tracking-widest">Or continue with</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button" onClick={handleGoogleLogin} disabled={isLoading}
                className="bg-slate-900/50 hover:bg-slate-800 py-4 rounded-2xl border border-slate-700/50 transition-colors flex justify-center items-center gap-3 font-bold disabled:opacity-50"
              >
                {isLoading && authProvider === 'google' ? (
                   <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Google
                  </>
                )}
              </button>
              <button 
                type="button" onClick={handlePhoneLogin} disabled={isLoading}
                className="bg-slate-900/50 hover:bg-slate-800 py-4 rounded-2xl border border-slate-700/50 transition-colors flex justify-center items-center gap-3 font-bold disabled:opacity-50"
              >
                {isLoading && authProvider === 'phone' ? (
                   <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full" />
                ) : (
                  <><Fingerprint size={20} className="text-slate-400" /> Biometrics</>
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-slate-500 text-sm mt-10 font-medium">
            {isLogin ? "Need access? " : "Already verified? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-white font-bold hover:underline">
              {isLogin ? 'Request account' : 'Log in instead'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
