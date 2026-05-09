"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Bot, Mail, Server, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  { id: 1, title: "Connect Account" },
  { id: 2, title: "Select Services" },
  { id: 3, title: "First Automation" },
  { id: 4, title: "Complete!" }
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [selectedServices, setSelectedServices] = useState<string[]>(["gmail", "drive"]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("forward_slack");

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
      if (step === 3) {
        // Trigger confetti on entering step 4
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#10b981', '#f59e0b']
        });
      }
    } else {
      router.push("/dashboard");
    }
  };

  const toggleService = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 selection:bg-indigo-500/30">
      
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-12 flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full z-0" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-indigo-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500"
          style={{ width: `${((step - 1) / 3) * 100}%` }}
        />
        {STEPS.map((s) => (
          <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s.id ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-500 border border-white/10'}`}>
              {step > s.id ? <CheckCircle2 className="h-5 w-5" /> : s.id}
            </div>
            <span className={`text-xs absolute -bottom-6 whitespace-nowrap ${step >= s.id ? 'text-indigo-400 font-medium' : 'text-zinc-600'}`}>
              {s.title}
            </span>
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden min-h-[400px]">
        
        <AnimatePresence mode="wait">
          
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center text-center h-full"
            >
              <div className="h-16 w-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Bot className="h-8 w-8 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to MaveFlow</h2>
              <p className="text-zinc-400 mb-8 max-w-md">To get started, we need access to your Google Workspace. MaveFlow requests permissions securely and you can revoke them at any time.</p>
              
              <div className="bg-black/30 border border-white/10 rounded-xl p-4 w-full text-left space-y-3 mb-8">
                <p className="text-sm text-zinc-300 font-medium">We request access to:</p>
                <ul className="text-sm text-zinc-500 space-y-2 ml-4 list-disc">
                  <li>Read and send emails on your behalf</li>
                  <li>Manage your Google Drive files</li>
                  <li>View and edit your Calendar events</li>
                </ul>
              </div>

              <div className="mt-auto pt-4 w-full">
                <Button onClick={handleNext} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-lg">
                  Connect Google Account
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Which services will you automate?</h2>
              <p className="text-zinc-400 mb-8 text-center">Select the apps you want MaveFlow to watch. You can change this later.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                  { id: "gmail", name: "Gmail", icon: Mail, color: "text-red-400" },
                  { id: "drive", name: "Drive", icon: Server, color: "text-blue-400" },
                  { id: "calendar", name: "Calendar", icon: Calendar, color: "text-indigo-400" },
                ].map(svc => (
                  <div 
                    key={svc.id}
                    onClick={() => toggleService(svc.id)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-3 ${selectedServices.includes(svc.id) ? 'bg-indigo-500/10 border-indigo-500 text-white' : 'bg-black/20 border-white/10 text-zinc-400 hover:border-white/20'}`}
                  >
                    <svc.icon className={`h-8 w-8 ${selectedServices.includes(svc.id) ? svc.color : 'text-zinc-600'}`} />
                    <span className="font-medium">{svc.name}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex gap-4">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/5 h-12">Back</Button>
                <Button onClick={handleNext} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-12">Continue</Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Create your first automation</h2>
              <p className="text-zinc-400 mb-8 text-center">Pick a starter template to see MaveFlow in action.</p>
              
              <div className="space-y-3 mb-8">
                {[
                  { id: "forward_slack", title: "Forward VIP Emails", desc: "When VIP client emails, alert me on Slack." },
                  { id: "save_receipts", title: "Save Receipts to Drive", desc: "Automatically save PDF invoices from Gmail to a Drive folder." },
                  { id: "create_event", title: "Calendar from Email", desc: "Use AI to read email invites and automatically block your calendar." },
                ].map(t => (
                  <div 
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between ${selectedTemplate === t.id ? 'bg-indigo-500/10 border-indigo-500' : 'bg-black/20 border-white/10 hover:border-white/20'}`}
                  >
                    <div>
                      <p className={`font-medium ${selectedTemplate === t.id ? 'text-white' : 'text-zinc-300'}`}>{t.title}</p>
                      <p className="text-xs text-zinc-500 mt-1">{t.desc}</p>
                    </div>
                    {selectedTemplate === t.id && <CheckCircle2 className="h-5 w-5 text-indigo-500" />}
                  </div>
                ))}
              </div>

              <div className="mt-auto flex gap-4">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/5 h-12">Back</Button>
                <Button onClick={handleNext} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-12">Setup Template</Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center h-full py-8"
            >
              <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">You're all set!</h2>
              <p className="text-zinc-400 mb-8 max-w-sm">Your workspace is connected and your first automation is ready to be turned on.</p>
              
              <Button onClick={handleNext} className="w-full bg-white text-black hover:bg-zinc-200 h-14 text-lg font-bold">
                Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
