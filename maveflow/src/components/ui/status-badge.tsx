import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusType = "SUCCESS" | "FAILED" | "RUNNING" | "PENDING" | "ACTIVE" | "INACTIVE";

export function StatusBadge({ status, className }: { status: StatusType; className?: string }) {
  const styles: Record<StatusType, string> = {
    SUCCESS: "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20",
    FAILED: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20",
    RUNNING: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20",
    PENDING: "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20",
    ACTIVE: "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border-indigo-500/20",
    INACTIVE: "bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20 border-zinc-500/20",
  };

  return (
    <Badge 
      variant="outline" 
      className={cn("font-medium px-2.5 py-0.5 rounded-md", styles[status], className)}
    >
      {status === "RUNNING" && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
      )}
      {status}
    </Badge>
  );
}
