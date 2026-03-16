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

function TreeNode({ agent, agents, depth = 0, isLast = false }: { agent: AgentWithStats; agents: AgentWithStats[]; depth?: number; isLast?: boolean }) {
  const children = agents.filter((a) => a.parentAgentId === agent.id);
  const isRoot = depth === 0;

  return (
    <li className="relative">
      {/* Connector lines for non-root nodes */}
      {!isRoot && (
        <>
          {/* Vertical line from parent */}
          <div className="absolute top-0 bottom-0 w-px bg-border/60" style={{ left: -17 }} />
          {/* Horizontal connector */}
          <div className="absolute w-4 h-px bg-border/60" style={{ left: -17, top: 20 }} />
          {/* Cut vertical line below last child */}
          {isLast && <div className="absolute top-5 bottom-0 w-px bg-background" style={{ left: -17 }} />}
        </>
      )}

      {/* Node card */}
      <div className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all hover:border-primary/30 hover:shadow-sm",
        isRoot
          ? "bg-card border-primary/20 shadow-sm"
          : "bg-card border-border ml-4"
      )}>
        {/* Avatar */}
        <div
          className={cn("rounded-lg flex items-center justify-center shrink-0 overflow-hidden", isRoot ? "h-10 w-10" : "h-8 w-8")}
          style={{ backgroundColor: agent.color + "25" }}
        >
          {agent.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={agent.avatarUrl} alt={agent.name} className={cn("object-cover rounded-lg", isRoot ? "h-10 w-10" : "h-8 w-8")} />
          ) : (
            <Bot className={cn(isRoot ? "h-5 w-5" : "h-4 w-4")} style={{ color: agent.color }} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn("font-semibold truncate", isRoot ? "text-base" : "text-sm")}>{agent.name}</span>
            {agent.isMain && <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />}
            {agent.isPersistent && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded text-[10px] font-medium shrink-0">
                <Zap className="h-2.5 w-2.5" /> Persistent
              </span>
            )}
            {agent.role && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">{agent.role}</span>
            )}
          </div>
          {agent.goal ? (
            <p className="text-xs text-muted-foreground truncate mt-0.5">🎯 {agent.goal}</p>
          ) : agent.description ? (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{agent.description}</p>
          ) : null}
        </div>

        {/* Stats + link */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            {agent.taskStats.IN_PROGRESS > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded font-medium">
                {agent.taskStats.IN_PROGRESS} active
              </span>
            )}
            {agent.taskStats.BACKLOG > 0 && (
              <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded">
                {agent.taskStats.BACKLOG} backlog
              </span>
            )}
          </div>
          <Link
            href={`/agents/${agent.id}`}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary hover:bg-primary/20 rounded transition-colors opacity-0 group-hover:opacity-100"
          >
            <Kanban className="h-3 w-3" /> Board
          </Link>
        </div>
      </div>

      {/* Children */}
      {children.length > 0 && (
        <ul className="relative mt-1 ml-5 pl-4 space-y-1.5">
          {children.map((child, idx) => (
            <TreeNode key={child.id} agent={child} agents={agents} depth={depth + 1} isLast={idx === children.length - 1} />
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
