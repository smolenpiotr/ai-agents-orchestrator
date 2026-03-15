"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Bot, Plus, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentWithStats } from "@/types/agent";

async function fetchAgents(): Promise<AgentWithStats[]> {
  const res = await fetch("/api/agents");
  if (!res.ok) throw new Error("Failed to fetch agents");
  return res.json();
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: agents = [] } = useQuery({
    queryKey: ["agents"],
    queryFn: fetchAgents,
  });

  return (
    <>
      {/* Desktop sidebar — always visible on md+ */}
      <aside className="hidden md:flex w-56 shrink-0 bg-sidebar border-r border-sidebar-border flex-col">
        <SidebarContent agents={agents} pathname={pathname} />
      </aside>

      {/* Mobile drawer — slides in from left */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-72 bg-sidebar border-r border-sidebar-border flex flex-col md:hidden",
          "transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button row */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
          <span className="text-sm font-semibold text-sidebar-foreground">Navigation</span>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <SidebarContent agents={agents} pathname={pathname} onLinkClick={onClose} />
      </aside>
    </>
  );
}

function SidebarContent({
  agents,
  pathname,
  onLinkClick,
}: {
  agents: AgentWithStats[];
  pathname: string;
  onLinkClick?: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
        <span className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
          Agents
        </span>
        <Link
          href="/agents/new"
          onClick={onLinkClick}
          className="text-sidebar-foreground/60 hover:text-sidebar-foreground p-1 rounded hover:bg-sidebar-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <Plus className="h-4 w-4" />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {agents.map((agent) => {
          const isActive =
            pathname === `/agents/${agent.id}` ||
            pathname.startsWith(`/agents/${agent.id}/`);
          return (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-colors group min-h-[44px]",
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
          onClick={onLinkClick}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-md text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors min-h-[44px]"
        >
          <Bot className="h-4 w-4" />
          New Agent
        </Link>
      </div>
    </>
  );
}
