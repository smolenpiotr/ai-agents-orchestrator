import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AgentCard } from "@/components/agents/AgentCard";
import { Bot, Plus } from "lucide-react";
import type { AgentWithStats } from "@/types/agent";

export default async function AgentsPage() {
  const agents = await prisma.agent.findMany({
    orderBy: [{ isMain: "desc" }, { createdAt: "asc" }],
    include: {
      _count: { select: { tasks: true } },
      tasks: { select: { status: true } },
    },
  });

  const agentsWithStats: AgentWithStats[] = agents.map((agent) => {
    const taskStats = {
      BACKLOG: agent.tasks.filter((t) => t.status === "BACKLOG").length,
      IN_PROGRESS: agent.tasks.filter((t) => t.status === "IN_PROGRESS").length,
      DONE: agent.tasks.filter((t) => t.status === "DONE").length,
    };
    const { tasks: _, ...rest } = agent;
    return { ...rest, taskStats };
  });

  return (
    <div className="p-3 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-xl font-bold">Agents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {agents.length} agent{agents.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <Link
          href="/agents/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors min-h-[44px]"
        >
          <Plus className="h-4 w-4" />
          <span>New Agent</span>
        </Link>
      </div>

      {agentsWithStats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Bot className="h-12 w-12 opacity-30 mb-4" />
          <p className="font-medium">No agents yet</p>
          <p className="text-sm mt-1 opacity-60">Create your first agent to get started</p>
          <Link
            href="/agents/new"
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Agent
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agentsWithStats.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}
