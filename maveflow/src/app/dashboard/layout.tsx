import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { OpenClawChat } from "@/components/ui/openclaw-chat";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen bg-zinc-950 text-white font-sans selection:bg-indigo-500/30">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
        <OpenClawChat />
      </div>
    </SessionProvider>
  );
}
