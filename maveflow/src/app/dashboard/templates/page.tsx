import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar as CalendarIcon, FileText, ArrowRight, Library } from "lucide-react";
import Link from "next/link";

const TEMPLATES = [
  { id: "t1", title: "Save Email Receipts to Drive", category: "Productivity", icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/10", desc: "Auto-extracts PDF receipts and saves them to a designated Google Drive folder." },
  { id: "t2", title: "Daily Agenda to Slack", category: "Calendar", icon: CalendarIcon, color: "text-indigo-400", bg: "bg-indigo-500/10", desc: "Every morning at 8 AM, fetches your meetings and sends a digest." },
  { id: "t3", title: "AI VIP Email Responder", category: "Email", icon: Mail, color: "text-red-400", bg: "bg-red-500/10", desc: "Uses OpenClaw to draft polite, context-aware replies to key clients." },
  { id: "t4", title: "Lead Form to CRM Sheet", category: "Data", icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10", desc: "When a new lead email comes in, parse the body and append to a Sheet." },
];

export default function TemplatesPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Library className="h-6 w-6 text-indigo-500" /> Template Library
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Start quickly with 20+ pre-built automation workflows.</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {["All", "Email", "Drive", "Calendar", "Productivity", "AI Powered"].map((cat) => (
          <Badge key={cat} variant={cat === "All" ? "default" : "outline"} className={cat === "All" ? "bg-white text-black hover:bg-zinc-200 cursor-pointer" : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 cursor-pointer px-4 py-1.5"}>
            {cat}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {TEMPLATES.map((t) => (
          <Card key={t.id} className="bg-white/5 border-white/10 hover:border-indigo-500/30 transition-all group flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start mb-4">
                <div className={\`h-10 w-10 rounded-xl \${t.bg} flex items-center justify-center\`}>
                  <t.icon className={\`h-5 w-5 \${t.color}\`} />
                </div>
                <Badge variant="outline" className="bg-black/40 border-white/10 text-[10px] text-zinc-400">{t.category}</Badge>
              </div>
              <CardTitle className="text-base text-white group-hover:text-indigo-300 transition-colors">{t.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <p className="text-sm text-zinc-400 mb-6">{t.desc}</p>
              <Link href={\`/dashboard/automations/new?template=\${t.id}\`} className="w-full">
                <Button variant="outline" className="w-full border-white/10 text-white hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all">
                  Use Template
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
