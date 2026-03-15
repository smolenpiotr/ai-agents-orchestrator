"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Bot, Star, Kanban, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { KanbanSkeleton } from "@/components/kanban/KanbanSkeleton";
import { InstalledSkills } from "@/components/skills/InstalledSkills";
import { SkillsBrowser } from "@/components/skills/SkillsBrowser";
import type { Agent } from "@/types/agent";
import type { KanbanData } from "@/types/task";

async function fetchAgent(id: string): Promise<Agent> {
  const res = await fetch(`/api/agents/${id}`);
  if (!res.ok) throw new Error("Agent not found");
  return res.json();
}

async function fetchTasks(id: string): Promise<KanbanData> {
  const res = await fetch(`/api/agents/${id}/tasks`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

type Tab = "board" | "skills";

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>("board");
  const [skillsBrowserOpen, setSkillsBrowserOpen] = useState(false);

  const { data: agent, isLoading: agentLoading } = useQuery({
    queryKey: ["agents", id],
    queryFn: () => fetchAgent(id),
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", id],
    queryFn: () => fetchTasks(id),
    enabled: activeTab === "board",
  });

  if (agentLoading) {
    return (
      <div className="p-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Agent not found
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Agent header */}
      <div className="px-6 pt-5 pb-0 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: agent.color + "25" }}
          >
            <Bot className="h-5 w-5" style={{ color: agent.color }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">{agent.name}</h1>
              {agent.isMain && <Star className="h-4 w-4 text-amber-400 fill-amber-400" />}
              {agent.openclawAgentId && (
                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-mono">
                  openclaw:{agent.openclawAgentId}
                </span>
              )}
            </div>
            {agent.description && (
              <p className="text-sm text-muted-foreground">{agent.description}</p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("board")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-sm rounded-t-lg border border-b-0 transition-colors",
              activeTab === "board"
                ? "bg-background border-border text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Kanban className="h-4 w-4" />
            Board
          </button>
          <button
            onClick={() => setActiveTab("skills")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-sm rounded-t-lg border border-b-0 transition-colors",
              activeTab === "skills"
                ? "bg-background border-border text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Package className="h-4 w-4" />
            Skills
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "board" && (
          <>
            {tasksLoading ? (
              <KanbanSkeleton />
            ) : tasks ? (
              <KanbanBoard agentId={id} initialTasks={tasks} />
            ) : (
              <KanbanBoard
                agentId={id}
                initialTasks={{ BACKLOG: [], IN_PROGRESS: [], DONE: [] }}
              />
            )}
          </>
        )}

        {activeTab === "skills" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold">Installed Skills</h2>
                <p className="text-sm text-muted-foreground">
                  Skills available in ~/.openclaw/skills
                </p>
              </div>
              <button
                onClick={() => setSkillsBrowserOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Package className="h-4 w-4" />
                Browse Marketplace
              </button>
            </div>
            <InstalledSkills />
          </div>
        )}
      </div>

      <SkillsBrowser open={skillsBrowserOpen} onClose={() => setSkillsBrowserOpen(false)} />
    </div>
  );
}
