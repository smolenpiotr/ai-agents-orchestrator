import { KanbanSkeleton } from "@/components/kanban/KanbanSkeleton";

export default function AgentLoading() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-5 w-36 bg-muted rounded animate-pulse" />
            <div className="h-3.5 w-48 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
      <KanbanSkeleton />
    </div>
  );
}
