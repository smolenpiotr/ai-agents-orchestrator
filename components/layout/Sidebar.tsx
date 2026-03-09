"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Bot, Plus, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentWithStats } from "@/types/agent";

async function fetchAgents(): Promise<AgentWithStats[]> {
  const res = await fetch("/api/agents");
  if (!res.ok) throw new Error("Failed to fetch agents");
  return res.json();
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: agents = [] } = useQuery({
    queryKey: ["agents"],
    queryFn: fetchAgents,
  });

  return (
    <aside className="w-56 shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
        <span className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
          Agents
        </span>
        <Link
          href="/agents/new"
          className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
        >
          <Plus className="h-4 w-4" />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {agents.map((agent) => {
          const isActive = pathname === `/agents/${agent.id}` || pathname.startsWith(`/agents/${agent.id}/`);
          return (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className={cn(
                "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors group",
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: agent.color }}
              />
              <span className="truncate flex-1">{agent.name}</span>
              {agent.isMain && (
                <Star className="h-3 w-3 text-sidebar-foreground/40 shrink-0" />
              )}
              <span className="text-xs text-sidebar-foreground/40 shrink-0">
                {agent._count.tasks}
              </span>
            </Link>
          );
        })}

        {agents.length === 0 && (
          <div className="px-2 py-4 text-center text-xs text-sidebar-foreground/40">
            No agents yet
          </div>
        )}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <Link
          href="/agents/new"
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <Bot className="h-4 w-4" />
          New Agent
        </Link>
      </div>
    </aside>
  );
}
