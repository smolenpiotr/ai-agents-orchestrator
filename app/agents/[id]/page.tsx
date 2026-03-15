"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bot, Star, Kanban, Package, Plus, X, Search, RefreshCw, FileText, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { KanbanSkeleton } from "@/components/kanban/KanbanSkeleton";
import { SkillsBrowser } from "@/components/skills/SkillsBrowser";
import type { Agent } from "@/types/agent";
import type { KanbanData } from "@/types/task";
import { toast } from "sonner";

interface Skill {
  slug: string;
  name: string;
  description?: string | null;
}

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

async function fetchAgentSkills(id: string): Promise<Skill[]> {
  const res = await fetch(`/api/agents/${id}/skills`);
  if (!res.ok) throw new Error("Failed to fetch skills");
  return res.json();
}

async function fetchInstalledSkills(): Promise<Skill[]> {
  const res = await fetch("/api/skills/installed");
  if (!res.ok) throw new Error("Failed to fetch installed skills");
  return res.json();
}

type Tab = "board" | "skills" | "files" | "jobs";

// ---- Files Tab Component ----
function FilesTab() {
  const FILES = ["SOUL", "MEMORY", "HEARTBEAT"] as const;

  return (
    <div className="p-6 space-y-6">
      {FILES.map((name) => (
        <FileEditor key={name} name={name} />
      ))}
    </div>
  );
}

function FileEditor({ name }: { name: string }) {
  const [content, setContent] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const { isLoading } = useQuery({
    queryKey: ["file", name],
    queryFn: async () => {
      const res = await fetch(`/api/files?name=${name}`);
      if (!res.ok) throw new Error("Failed to load file");
      const data = await res.json();
      setContent(data.content);
      return data.content;
    },
  });

  async function handleSave() {
    if (content === null) return;
    setSaving(true);
    try {
      const res = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setLastSaved(data.savedAt);
      toast.success(`${name}.md saved`);
    } catch {
      toast.error(`Failed to save ${name}.md`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">{name}.md</span>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Saved {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || isLoading || content === null}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? <RefreshCw className="h-3 w-3 animate-spin" /> : null}
            Save
          </button>
        </div>
      </div>
      {isLoading ? (
        <div className="p-4">
          <div className="h-32 bg-muted rounded animate-pulse" />
        </div>
      ) : (
        <textarea
          value={content ?? ""}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-4 bg-background text-sm font-mono resize-none focus:outline-none min-h-[200px]"
          placeholder={`${name}.md content...`}
          rows={12}
        />
      )}
    </div>
  );
}

// ---- Jobs Tab Component ----
interface CronJob {
  id?: string;
  name?: string;
  schedule?: string;
  lastRun?: string;
  enabled?: boolean;
  active?: boolean;
  [key: string]: unknown;
}

function JobsTab() {
  const queryClient = useQueryClient();

  const { data: jobsData, isLoading, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await fetch("/api/jobs");
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json();
    },
  });

  async function handleToggle(jobId: string) {
    try {
      const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}/toggle`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to toggle job");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job updated");
    } catch {
      toast.error("Failed to toggle job");
    }
  }

  async function handleDelete(jobId: string) {
    if (!confirm("Delete this cron job?")) return;
    try {
      const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete job");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job deleted");
    } catch {
      toast.error("Failed to delete job");
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-muted-foreground text-sm">Failed to load jobs</div>
    );
  }

  const jobs: CronJob[] = Array.isArray(jobsData?.jobs)
    ? jobsData.jobs
    : typeof jobsData?.jobs === "object" && jobsData?.jobs !== null
    ? Object.entries(jobsData.jobs).map(([k, v]) => ({ id: k, ...(v as object) }))
    : [];

  if (jobsData?.source === "none" || jobs.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
          <Clock className="h-8 w-8 opacity-40" />
          <p className="text-sm font-medium">No cron jobs found</p>
          <p className="text-xs opacity-60">OpenClaw cron jobs will appear here</p>
        </div>
      </div>
    );
  }

  // If the format looks unknown, show raw JSON
  const isKnownFormat = jobs.length > 0 && (jobs[0].id !== undefined || jobs[0].name !== undefined);

  return (
    <div className="p-6 space-y-3">
      {jobsData?.source === "file" && (
        <p className="text-xs text-muted-foreground">
          Source: <code className="bg-muted px-1 rounded">{jobsData.path}</code>
        </p>
      )}

      {!isKnownFormat ? (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Raw cron data — management coming soon</p>
          <pre className="bg-muted/50 border border-border rounded-lg p-4 text-xs overflow-auto max-h-64">
            {JSON.stringify(jobsData.jobs, null, 2)}
          </pre>
        </div>
      ) : (
        jobs.map((job, idx) => {
          const jobId = String(job.id ?? job.name ?? idx);
          const isActive = job.enabled !== false && job.active !== false;

          return (
            <div key={jobId} className="flex items-center gap-4 p-3 bg-card border border-border rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{job.name ?? job.id ?? `Job ${idx + 1}`}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  {job.schedule && (
                    <span className="text-xs font-mono text-muted-foreground">{String(job.schedule)}</span>
                  )}
                  {job.lastRun && (
                    <span className="text-xs text-muted-foreground">
                      Last: {String(job.lastRun)}
                    </span>
                  )}
                </div>
              </div>

              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                isActive
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : "bg-muted text-muted-foreground"
              )}>
                {isActive ? "Active" : "Inactive"}
              </span>

              {/* Toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => handleToggle(jobId)}
                title={isActive ? "Disable" : "Enable"}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                  isActive ? "bg-primary" : "bg-muted-foreground/30"
                )}
              >
                <span className={cn(
                  "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform",
                  isActive ? "translate-x-4" : "translate-x-0"
                )} />
              </button>

              <button
                onClick={() => handleDelete(jobId)}
                className="p-1.5 rounded hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                title="Delete job"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}

// ---- Main Page ----
export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>("board");
  const [skillsBrowserOpen, setSkillsBrowserOpen] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: agent, isLoading: agentLoading } = useQuery({
    queryKey: ["agents", id],
    queryFn: () => fetchAgent(id),
  });

  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks } = useQuery({
    queryKey: ["tasks", id],
    queryFn: () => fetchTasks(id),
    enabled: true,
    refetchInterval: 30000,
  });

  const { data: agentSkills = [], isLoading: agentSkillsLoading } = useQuery({
    queryKey: ["agentSkills", id],
    queryFn: () => fetchAgentSkills(id),
    enabled: true,
    refetchInterval: 30000,
  });

  const { data: installedSkills = [], isLoading: installedLoading } = useQuery({
    queryKey: ["skills", "installed"],
    queryFn: fetchInstalledSkills,
    enabled: true,
    refetchInterval: 30000,
  });

  const addSkillMutation = useMutation({
    mutationFn: async (skill: Skill) => {
      const res = await fetch(`/api/agents/${id}/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skill),
      });
      if (!res.ok) throw new Error("Failed to add skill");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentSkills", id] });
      toast.success("Skill assigned");
    },
    onError: () => toast.error("Failed to assign skill"),
  });

  const removeSkillMutation = useMutation({
    mutationFn: async (slug: string) => {
      const res = await fetch(`/api/agents/${id}/skills?slug=${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove skill");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentSkills", id] });
      toast.success("Skill removed");
    },
    onError: () => toast.error("Failed to remove skill"),
  });

  const assignedSlugs = new Set(agentSkills.map((s) => s.slug));

  const filteredInstalled = installedSkills.filter((s) => {
    const q = skillSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.slug.toLowerCase().includes(q) ||
      (s.description || "").toLowerCase().includes(q)
    );
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

  const isMain = agent.isMain;

  return (
    <div className="flex flex-col h-full">
      {/* Agent header */}
      <div className="px-6 pt-5 pb-0 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          {/* Avatar */}
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
            style={{ backgroundColor: agent.color + "25" }}
          >
            {agent.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={agent.avatarUrl} alt={agent.name} className="h-10 w-10 object-cover rounded-xl" />
            ) : (
              <Bot className="h-5 w-5" style={{ color: agent.color }} />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">{agent.name}</h1>
              {agent.isMain && <Star className="h-4 w-4 text-amber-400 fill-amber-400" />}
              {agent.isPersistent && (
                <span className="text-xs px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-full font-medium">
                  Persistent
                </span>
              )}
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
          {/* Manual refresh button */}
          <button
            onClick={() => {
              refetchTasks();
              toast.success("Refreshed");
            }}
            title="Refresh board"
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
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
            {agentSkills.length > 0 && (
              <span className="ml-1 text-xs bg-primary/15 text-primary px-1.5 rounded-full">
                {agentSkills.length}
              </span>
            )}
          </button>
          {isMain && (
            <button
              onClick={() => setActiveTab("files")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm rounded-t-lg border border-b-0 transition-colors",
                activeTab === "files"
                  ? "bg-background border-border text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="h-4 w-4" />
              Files
            </button>
          )}
          {isMain && (
            <button
              onClick={() => setActiveTab("jobs")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm rounded-t-lg border border-b-0 transition-colors",
                activeTab === "jobs"
                  ? "bg-background border-border text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Clock className="h-4 w-4" />
              Jobs
            </button>
          )}
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
          <div className="p-6 space-y-6">
            {/* Assigned skills */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-semibold">Assigned Skills</h2>
                  <p className="text-sm text-muted-foreground">
                    Skills mapped to {agent.name}
                  </p>
                </div>
              </div>

              {agentSkillsLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : agentSkills.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
                  <Package className="h-8 w-8 opacity-40" />
                  <p className="text-sm">No skills assigned yet</p>
                  <p className="text-xs opacity-60">Add skills from the list below</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {agentSkills.map((skill) => (
                    <div
                      key={skill.slug}
                      className="flex items-center gap-3 px-3 py-2.5 bg-card border border-border rounded-lg"
                    >
                      <Package className="h-4 w-4 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{skill.name}</p>
                        {skill.description && (
                          <p className="text-xs text-muted-foreground truncate">{skill.description}</p>
                        )}
                      </div>
                      <span className="text-xs font-mono text-muted-foreground shrink-0">{skill.slug}</span>
                      <button
                        onClick={() => removeSkillMutation.mutate(skill.slug)}
                        disabled={removeSkillMutation.isPending}
                        className="p-1 rounded hover:bg-red-500/10 hover:text-red-500 transition-colors text-muted-foreground"
                        title="Remove skill"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available skills from OpenClaw */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-semibold">Available Skills</h2>
                  <p className="text-sm text-muted-foreground">
                    Installed OpenClaw skills
                  </p>
                </div>
                <button
                  onClick={() => setSkillsBrowserOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md text-sm hover:bg-muted transition-colors"
                >
                  <Package className="h-4 w-4" />
                  Marketplace
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {installedLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : filteredInstalled.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                  <Package className="h-8 w-8 opacity-40" />
                  <p className="text-sm">
                    {skillSearch ? "No skills match your search" : "No skills installed"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredInstalled.map((skill) => {
                    const assigned = assignedSlugs.has(skill.slug);
                    return (
                      <div
                        key={skill.slug}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 border rounded-lg transition-colors",
                          assigned
                            ? "bg-primary/5 border-primary/20"
                            : "bg-card border-border"
                        )}
                      >
                        <Package
                          className={cn(
                            "h-4 w-4 shrink-0",
                            assigned ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{skill.name}</p>
                          {skill.description && (
                            <p className="text-xs text-muted-foreground truncate">{skill.description}</p>
                          )}
                        </div>
                        <span className="text-xs font-mono text-muted-foreground shrink-0">{skill.slug}</span>
                        {assigned ? (
                          <button
                            onClick={() => removeSkillMutation.mutate(skill.slug)}
                            disabled={removeSkillMutation.isPending}
                            className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors shrink-0"
                          >
                            <X className="h-3 w-3" />
                            Remove
                          </button>
                        ) : (
                          <button
                            onClick={() => addSkillMutation.mutate(skill)}
                            disabled={addSkillMutation.isPending}
                            className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0"
                          >
                            <Plus className="h-3 w-3" />
                            Add
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "files" && isMain && <FilesTab />}
        {activeTab === "jobs" && isMain && <JobsTab />}
      </div>

      <SkillsBrowser open={skillsBrowserOpen} onClose={() => setSkillsBrowserOpen(false)} />
    </div>
  );
}
