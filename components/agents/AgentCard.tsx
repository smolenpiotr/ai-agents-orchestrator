"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bot, MoreHorizontal, Pencil, Trash2, Star, Kanban, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { AgentWithStats } from "@/types/agent";

interface AgentCardProps {
  agent: AgentWithStats;
}

export function AgentCard({ agent }: AgentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const queryClient = useQueryClient();

  async function handleDelete() {
    setMenuOpen(false);
    setDeleting(true);
    try {
      const res = await fetch(`/api/agents/${agent.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete");
      }
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success(`${agent.name} deleted`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete agent");
      setDeleting(false);
    }
  }

  const budgetPercent =
    agent.monthlyBudgetUsd && agent.monthlyBudgetUsd > 0
      ? Math.min(100, (agent.spentThisMonthUsd / agent.monthlyBudgetUsd) * 100)
      : null;

  return (
    <div
      className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 hover:border-primary/30 transition-all"
      style={{ borderLeftColor: agent.color, borderLeftWidth: "3px" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar or icon */}
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
            style={{ backgroundColor: agent.color + "20" }}
          >
            {agent.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={agent.avatarUrl}
                alt={agent.name}
                className="h-9 w-9 object-cover rounded-lg"
              />
            ) : (
              <Bot className="h-5 w-5" style={{ color: agent.color }} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm">{agent.name}</h3>
              {agent.isMain && <Star className="h-3 w-3 text-amber-400 fill-amber-400" />}
              {agent.isPersistent && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded text-[10px] font-medium">
                  <Zap className="h-2.5 w-2.5" />
                  Persistent
                </span>
              )}
            </div>
            {agent.role && (
              <p className="text-xs text-muted-foreground">{agent.role}</p>
            )}
            {agent.openclawAgentId && (
              <p className="text-xs text-muted-foreground font-mono">
                openclaw:{agent.openclawAgentId}
              </p>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-7 z-20 bg-popover border border-border rounded-md shadow-md py-1 min-w-[140px]">
                <Link
                  href={`/agents/${agent.id}/edit`}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Link>
                {!agent.isMain && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-destructive hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Goal */}
      {agent.goal && (
        <p className="text-xs text-primary/80 bg-primary/5 border border-primary/10 rounded-md px-2 py-1.5 line-clamp-2">
          🎯 {agent.goal}
        </p>
      )}

      {/* Description */}
      {agent.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{agent.description}</p>
      )}

      {/* Budget progress bar */}
      {budgetPercent !== null && agent.monthlyBudgetUsd && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Used ${agent.spentThisMonthUsd.toFixed(2)} of ${agent.monthlyBudgetUsd.toFixed(2)}</span>
            <span className={budgetPercent >= 90 ? "text-red-500 font-medium" : ""}>{budgetPercent.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                budgetPercent >= 90
                  ? "bg-red-500"
                  : budgetPercent >= 70
                  ? "bg-amber-500"
                  : "bg-primary"
              }`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Task stats */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-600 dark:text-slate-300">
          <span className="font-semibold">{agent.taskStats.BACKLOG}</span> Backlog
        </span>
        <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded text-xs text-amber-700 dark:text-amber-400">
          <span className="font-semibold">{agent.taskStats.IN_PROGRESS}</span> In Progress
        </span>
        <span className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded text-xs text-green-700 dark:text-green-400">
          <span className="font-semibold">{agent.taskStats.DONE}</span> Done
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(agent.createdAt), { addSuffix: true })}
        </span>
        <Link
          href={`/agents/${agent.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors"
        >
          <Kanban className="h-4 w-4" />
          Open Board
        </Link>
      </div>
    </div>
  );
}
