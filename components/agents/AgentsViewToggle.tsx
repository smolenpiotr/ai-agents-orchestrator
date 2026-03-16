"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, GitBranch, Bot, Star, Zap, Kanban } from "lucide-react";
import { AgentCard } from "./AgentCard";
import type { AgentWithStats } from "@/types/agent";
import { cn } from "@/lib/utils";

interface AgentsViewToggleProps {
  agents: AgentWithStats[];
}

function TreeNode({ agent, agents, depth = 0 }: { agent: AgentWithStats; agents: AgentWithStats[]; depth?: number }) {
  const children = agents.filter((a) => a.parentAgentId === agent.id);

  return (
    <li className="relative">
      {/* Node */}
      <div className={cn("flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group", depth > 0 && "ml-6")}>
        {/* Tree line */}
        {depth > 0 && (
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border" style={{ left: `${(depth - 1) * 24 + 12}px` }} />
        )}
        {depth > 0 && (
          <div className="absolute border-b border-border" style={{ left: `${(depth - 1) * 24 + 12}px`, width: "16px", top: "50%" }} />
        )}

        {/* Agent avatar */}
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
          style={{ backgroundColor: agent.color + "20" }}
        >
          {agent.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={agent.avatarUrl} alt={agent.name} className="h-8 w-8 object-cover rounded-lg" />
          ) : (
            <Bot className="h-4 w-4" style={{ color: agent.color }} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold truncate">{agent.name}</span>
            {agent.isMain && <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />}
            {agent.isPersistent && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded text-[10px] font-medium shrink-0">
                <Zap className="h-2.5 w-2.5" />
                Persistent
              </span>
            )}
            {agent.role && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{agent.role}</span>
            )}
          </div>
          {agent.goal && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">🎯 {agent.goal}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
          <span className="hidden sm:inline">{agent.taskStats.BACKLOG + agent.taskStats.IN_PROGRESS} active</span>
          <Link
            href={`/agents/${agent.id}`}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary hover:bg-primary/20 rounded transition-colors opacity-0 group-hover:opacity-100"
          >
            <Kanban className="h-3 w-3" />
            Board
          </Link>
        </div>
      </div>

      {/* Children */}
      {children.length > 0 && (
        <ul className="relative ml-6 border-l border-border pl-4 mt-0.5 space-y-0.5">
          {children.map((child) => (
            <TreeNode key={child.id} agent={child} agents={agents} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function AgentsViewToggle({ agents }: AgentsViewToggleProps) {
  const [view, setView] = useState<"grid" | "tree">("grid");

  // Root agents: those with no parent or parent not in list
  const agentIds = new Set(agents.map((a) => a.id));
  const rootAgents = agents.filter((a) => !a.parentAgentId || !agentIds.has(a.parentAgentId));

  return (
    <div>
      {/* View toggle */}
      <div className="flex items-center gap-1 mb-4 bg-muted rounded-lg p-1 w-fit">
        <button
          onClick={() => setView("grid")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors",
            view === "grid"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          Grid
        </button>
        <button
          onClick={() => setView("tree")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors",
            view === "tree"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <GitBranch className="h-4 w-4" />
          Org Chart
        </button>
      </div>

      {/* Grid view */}
      {view === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}

      {/* Tree view */}
      {view === "tree" && (
        <div className="bg-card border border-border rounded-xl p-4">
          <ul className="space-y-1">
            {rootAgents.map((agent) => (
              <TreeNode key={agent.id} agent={agent} agents={agents} depth={0} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
