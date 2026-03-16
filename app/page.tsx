import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Bot, Plus, Activity, CheckCircle2, Loader2, Zap, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

async function getStats() {
  const [totalAgents, activeTasks, doneTodayCount] = await Promise.all([
    prisma.agent.count(),
    prisma.task.count({ where: { status: "IN_PROGRESS" } }),
    prisma.task.count({
      where: {
        status: "DONE",
        updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ]);
  return { totalAgents, activeTasks, doneToday: doneTodayCount };
}

async function getRecentActivity() {
  try {
    const logs = await prisma.agentLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { agent: { select: { name: true, color: true, id: true } } },
    });
    return logs;
  } catch {
    return [];
  }
}

async function checkDbHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

function LogTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "task_status": return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
    case "spawn": return <Zap className="h-3.5 w-3.5 text-violet-500" />;
    default: return <Activity className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

export default async function DashboardPage() {
  const [stats, recentActivity, dbHealthy] = await Promise.all([
    getStats(),
    getRecentActivity(),
    checkDbHealth(),
  ]);

  return (
    <div className="p-3 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your AI agents at a glance</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalAgents}</p>
              <p className="text-sm text-muted-foreground">Total Agents</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.activeTasks}</p>
              <p className="text-sm text-muted-foreground">Active Tasks</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.doneToday}</p>
              <p className="text-sm text-muted-foreground">Done Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions + System status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quick actions */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold mb-3">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            <Link
              href="/agents/new"
              className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Agent
            </Link>
            <Link
              href="/agents"
              className="flex items-center gap-3 px-4 py-3 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              <Bot className="h-4 w-4" />
              View All Agents
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Link>
          </div>
        </div>

        {/* System status */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold mb-3">System Status</h2>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Database</span>
              <div className="flex items-center gap-1.5">
                <div className={`h-2 w-2 rounded-full ${dbHealthy ? "bg-green-500" : "bg-red-500"}`} />
                <span className={`text-sm font-medium ${dbHealthy ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {dbHealthy ? "Healthy" : "Error"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Agents</span>
              <span className="text-sm font-medium">{stats.totalAgents} configured</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active work</span>
              <span className="text-sm font-medium">{stats.activeTasks} tasks in progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold mb-4">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <Activity className="h-8 w-8 opacity-40" />
            <p className="text-sm">No activity yet</p>
            <p className="text-xs opacity-60">Activity will appear here as tasks are updated</p>
          </div>
        ) : (
          <div className="space-y-1">
            {recentActivity.map((log) => (
              <Link
                key={log.id}
                href={`/agents/${log.agent.id}`}
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <LogTypeIcon type={log.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium" style={{ color: log.agent.color }}>
                      {log.agent.name}
                    </span>
                    <span className="text-sm">{log.title}</span>
                  </div>
                  {log.detail && (
                    <p className="text-xs text-muted-foreground truncate">{log.detail}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                  {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
