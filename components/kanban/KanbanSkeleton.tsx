export function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4 p-6">
      {["Backlog", "In Progress", "Done"].map((label) => (
        <div key={label} className="rounded-xl border-2 border-border min-h-[400px]">
          <div className="flex items-center justify-between px-3 py-2.5 bg-muted/50 rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="h-4 w-5 bg-muted rounded-full animate-pulse" />
            </div>
          </div>
          <div className="p-2 space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-3 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
