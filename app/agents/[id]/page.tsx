"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bot, Star, Kanban, Package, Plus, X, Search, RefreshCw, FileText, Clock,
  Zap, AlertCircle, GitBranch,
  ArrowRight, Loader2, Play, ChevronDown, ChevronRight,
} from "lucide-react";
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

async function fetchDirectReports(parentId: string): Promise<Agent[]> {
  const res = await fetch("/api/agents");
  if (!res.ok) throw new Error("Failed to fetch agents");
  const all: Agent[] = await res.json();
  return all.filter((a) => a.parentAgentId === parentId);
}

type Tab = "board" | "skills" | "files" | "jobs";

// ---- Per-Agent Jobs Tab ----
interface AgentJob {
  id: string;
  name: string | null;
  schedule: string;
  model: string | null;
  lastRunStatus: string | null;
  lastRun: string | null;
  nextRun: string | null;
  enabled: boolean;
}

function AgentJobsTab({ agentId }: { agentId: string }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["agentJobs", agentId],
    queryFn: async () => {
      const res = await fetch(`/api/agents/${agentId}/jobs`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json() as Promise<{ jobs: AgentJob[] }>;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const [running, setRunning] = useState<string | null>(null);

  async function handleRun(jobId: string) {
    setRunning(jobId);
    try {
      const res = await fetch(`/api/agents/${agentId}/jobs/${jobId}/run`, { method: "POST" });
      const result = await res.json();
      if (result.ok) toast.success("Job triggered");
      else toast.error("Failed to run job");
    } catch {
      toast.error("Failed to run job");
    } finally {
      setRunning(null);
      refetch();
    }
  }

  if (isLoading) {
    return (
      <div className="p-3 md:p-6 space-y-3">
        {[1, 2].map((i) => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
      </div>
    );
  }

  if (error) {
    return <div className="p-3 md:p-6 text-muted-foreground text-sm">Failed to load jobs.</div>;
  }

  const jobs: AgentJob[] = data?.jobs ?? [];

  return (
    <div className="p-3 md:p-6 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{jobs.length} job{jobs.length !== 1 ? "s" : ""}</p>
        <button onClick={() => refetch()} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
          <Clock className="h-8 w-8 opacity-40" />
          <p className="text-sm font-medium">No jobs found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">Name</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs hidden sm:table-cell">Schedule</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs hidden md:table-cell">Model</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">Last Run</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const status = job.lastRunStatus;
                const statusClass = status === "ok"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : status === "error"
                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  : "bg-muted text-muted-foreground";
                const statusLabel = status ?? "idle";
                const modelShort = job.model ? job.model.split("/").pop()?.replace("anthropic/", "") ?? job.model : "—";
                const lastRunLabel = job.lastRun ? formatRelativeTime(new Date(job.lastRun).getTime()) : "—";

                return (
                  <tr key={job.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-2.5 font-medium text-foreground">
                      {job.name || `Job ${job.id.slice(0, 8)}`}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground hidden sm:table-cell">
                      {job.schedule || "—"}
                    </td>
                    <td className="px-3 py-2.5 hidden md:table-cell">
                      {job.model ? (
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", modelBadgeClass(job.model))}>
                          {modelShort}
                        </span>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{lastRunLabel}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusClass)}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        onClick={() => handleRun(job.id)}
                        disabled={running === job.id}
                        className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                      >
                        {running === job.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                        Run
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---- Per-Agent Files Tab ----
interface AgentFile {
  name: string;
  path: string;
  content: string | null;
  size: number;
  exists: boolean;
  lastModified: string | null;
}

function AgentFilesTab({ agentId }: { agentId: string }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useQuery({
    queryKey: ["agentFiles", agentId],
    queryFn: async () => {
      const res = await fetch(`/api/agents/${agentId}/files`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch files");
      return res.json() as Promise<{ files: AgentFile[] }>;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  function toggle(name: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  if (isLoading) {
    return (
      <div className="p-3 md:p-6 space-y-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}
      </div>
    );
  }

  if (error) {
    return <div className="p-3 md:p-6 text-muted-foreground text-sm">Failed to load files.</div>;
  }

  const files: AgentFile[] = data?.files ?? [];
  const existing = files.filter((f) => f.exists);
  const missing = files.filter((f) => !f.exists);

  return (
    <div className="p-3 md:p-6 space-y-2">
      {existing.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
          <FileText className="h-8 w-8 opacity-40" />
          <p className="text-sm font-medium">No files found</p>
        </div>
      )}
      {existing.map((file) => {
        const open = expanded.has(file.name);
        return (
          <div key={file.name} className="bg-card border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => toggle(file.name)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                {open ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium text-sm">{file.name}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {file.size > 0 && <span>{(file.size / 1024).toFixed(1)} KB</span>}
                {file.lastModified && <span className="hidden sm:inline">{new Date(file.lastModified).toLocaleDateString()}</span>}
              </div>
            </button>
            {open && (
              <div className="border-t border-border">
                <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-words bg-muted/20 max-h-[500px] overflow-auto text-foreground/80">
                  {file.content ?? ""}
                </pre>
              </div>
            )}
          </div>
        );
      })}
      {missing.length > 0 && (
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-1">Missing files:</p>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((f) => (
              <span key={f.name} className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">{f.name}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Files Tab Component ----
function FilesTab() {
  const FILES = ["SOUL", "MEMORY", "HEARTBEAT", "AGENTS", "USER"] as const;

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {FILES.map((name) => (
        <FileEditor key={name} name={name} />
      ))}
    </div>
  );
}

function FileEditor({ name }: { name: string }) {
  const [content, setContent] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const { data: serverContent, isLoading, isError } = useQuery({
    queryKey: ["file", name],
    queryFn: async () => {
      const res = await fetch(`/api/files?name=${name}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) throw new Error("Failed to load file");
      const data = await res.json();
      return data.content as string;
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (serverContent !== undefined && !isDirty) {
      setContent(serverContent);
    }
  }, [serverContent, isDirty]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
    setIsDirty(true);
  }

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
      setIsDirty(false);
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
          {isDirty && <span className="text-xs text-amber-500 font-medium">unsaved</span>}
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && !isDirty && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Saved {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || isLoading || content === null || !isDirty}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? <RefreshCw className="h-3 w-3 animate-spin" /> : null}
            Save
          </button>
        </div>
      </div>
      {isLoading ? (
        <div className="p-4 space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        </div>
      ) : isError ? (
        <div className="p-4 text-sm text-muted-foreground">
          Failed to load {name}.md — files proxy may not be configured.
        </div>
      ) : (
        <textarea
          value={content ?? ""}
          onChange={handleChange}
          className="w-full p-3 md:p-4 bg-background text-sm font-mono resize-y focus:outline-none min-h-[200px]"
          placeholder={`${name}.md content...`}
          rows={12}
        />
      )}
    </div>
  );
}

// ---- Jobs Tab Component ----
interface CronJob {
  id: string;
  name?: string;
  enabled?: boolean;
  agentId?: string;
  sessionTarget?: string;
  schedule?: { kind: string; expr: string; tz?: string } | string;
  state?: { nextRunAtMs?: number; lastRunAtMs?: number; lastRunStatus?: string; consecutiveErrors?: number };
  payload?: { model?: string; timeoutSeconds?: number };
  active?: boolean;
  status?: string;
  next?: string;
  last?: string;
  target?: string;
}

function formatRelativeTime(ms: number): string {
  const diff = ms - Date.now();
  const abs = Math.abs(diff);
  const isPast = diff < 0;
  if (abs < 60000) return isPast ? "just now" : "in <1 min";
  if (abs < 3600000) { const m = Math.round(abs / 60000); return isPast ? `${m}m ago` : `in ${m}m`; }
  if (abs < 86400000) { const h = Math.round(abs / 3600000); return isPast ? `${h}h ago` : `in ${h}h`; }
  const d = Math.round(abs / 86400000);
  return isPast ? `${d}d ago` : `in ${d}d`;
}

/** Parse a cron expression and estimate how many times it runs per month (~30 days). */
function estimateMonthlyRuns(cronExpr: string): number {
  if (!cronExpr) return 0;
  const parts = cronExpr.trim().split(/\s+/);
  if (parts.length < 5) return 0;
  const [minute, hour, dom, month, dow] = parts;

  // Count field occurrences per unit
  function countField(field: string, min: number, max: number): number {
    if (field === "*") return max - min + 1;
    if (field.startsWith("*/")) {
      const step = parseInt(field.slice(2), 10);
      if (!step) return 1;
      return Math.floor((max - min) / step) + 1;
    }
    if (field.includes(",")) return field.split(",").length;
    if (field.includes("-")) {
      const [a, b] = field.split("-").map(Number);
      return b - a + 1;
    }
    return 1; // specific value
  }

  const minutesPerHour = countField(minute, 0, 59);
  const hoursPerDay = countField(hour, 0, 23);

  // Days per month: if dow is restricted, estimate ~4.3 weeks * days/week
  let daysPerMonth: number;
  if (dom !== "*" && dow === "*") {
    daysPerMonth = countField(dom, 1, 31);
  } else if (dom === "*" && dow !== "*") {
    const daysPerWeek = countField(dow, 0, 6);
    daysPerMonth = Math.round(daysPerWeek * 4.33);
  } else {
    daysPerMonth = 30;
  }

  // Month multiplier (usually * = all months)
  const monthsPerYear = countField(month, 1, 12);
  const monthFraction = monthsPerYear / 12;

  return Math.round(minutesPerHour * hoursPerDay * daysPerMonth * monthFraction);
}

/** Return a model's cost per token in USD. */
function modelCostPer1M(model: string): { input: number; output: number } {
  const m = model.toLowerCase();
  if (m.includes("haiku")) return { input: 0.80, output: 4.0 };
  if (m.includes("sonnet")) return { input: 3.0, output: 15.0 };
  return { input: 3.0, output: 15.0 }; // default
}

/** Estimate monthly cost string for a cron job. */
function estimateMonthlyCost(cronExpr: string, model: string): string {
  const runs = estimateMonthlyRuns(cronExpr);
  if (runs === 0) return "~€0/month";
  const pricing = modelCostPer1M(model);
  const AVG_INPUT = 800;
  const AVG_OUTPUT = 300;
  const costUsd = runs * ((AVG_INPUT / 1_000_000) * pricing.input + (AVG_OUTPUT / 1_000_000) * pricing.output);
  const costEur = costUsd * 0.92;
  if (costEur < 0.01) return "~€0.01/month";
  return `~€${costEur.toFixed(2)}/month`;
}

/** Return Tailwind classes for model badge. */
function modelBadgeClass(model: string): string {
  const m = model.toLowerCase();
  if (m.includes("haiku")) return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
  if (m.includes("sonnet")) return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
  return "bg-muted text-muted-foreground";
}

function HeartbeatCard({ jobs }: { jobs: CronJob[] }) {
  // Try to find a heartbeat job from the list
  const heartbeatJob = jobs.find((j) =>
    (j.name ?? "").toLowerCase().includes("heartbeat") ||
    (j.name ?? "").toLowerCase().includes("inbox check")
  );

  const { data: heartbeatContent } = useQuery({
    queryKey: ["file", "HEARTBEAT"],
    queryFn: async () => {
      const res = await fetch("/api/files?name=HEARTBEAT", { cache: "no-store" });
      if (!res.ok) return null;
      const data = await res.json();
      return data.content as string | null;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  // Extract action lines from HEARTBEAT.md (lines starting with - or *)
  const actions = heartbeatContent
    ? heartbeatContent
        .split("\n")
        .filter((l) => l.trim().startsWith("-") || l.trim().startsWith("*"))
        .map((l) => l.trim().replace(/^[-*]\s*/, ""))
        .filter(Boolean)
        .slice(0, 8)
    : [];

  const lastMs = heartbeatJob?.state?.lastRunAtMs;
  const isActive = heartbeatJob ? (heartbeatJob.enabled !== false && heartbeatJob.active !== false) : true;

  return (
    <div className="p-3 md:p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/30 rounded-xl space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Heartbeat</p>
            <p className="text-xs text-muted-foreground">OpenClaw periodic check</p>
          </div>
        </div>
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", isActive ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-muted text-muted-foreground")}>
          {isActive ? "active" : "inactive"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="space-y-0.5">
          <p className="text-muted-foreground">Model</p>
          <span className="inline-block px-2 py-0.5 rounded-full font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
            claude-haiku-3-5
          </span>
        </div>
        <div className="space-y-0.5">
          <p className="text-muted-foreground">Frequency</p>
          <p className="font-medium text-foreground">every 15 minutes</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-muted-foreground">Last run</p>
          <p className="font-medium text-foreground">{lastMs ? formatRelativeTime(lastMs) : "—"}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-muted-foreground">Est. cost</p>
          <p className="font-medium text-foreground">{estimateMonthlyCost("*/15 * * * *", "claude-haiku-3-5")}</p>
        </div>
      </div>

      {actions.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</p>
          <ul className="space-y-1">
            {actions.map((action, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/80">
                <span className="text-primary mt-0.5 shrink-0">▸</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function JobsTab() {
  const { data: jobsData, isLoading, error, refetch } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await fetch("/api/jobs", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json() as Promise<{ source: string; jobs: CronJob[] }>;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="p-3 md:p-6 space-y-3">
        {[1, 2].map((i) => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}
      </div>
    );
  }

  if (error) {
    return <div className="p-3 md:p-6 text-muted-foreground text-sm">Failed to load cron jobs.</div>;
  }

  const allJobs: CronJob[] = jobsData?.jobs ?? [];
  // Separate heartbeat jobs from regular cron jobs
  const regularJobs = allJobs.filter((j) =>
    !(j.name ?? "").toLowerCase().includes("heartbeat") &&
    !(j.name ?? "").toLowerCase().includes("inbox check")
  );

  return (
    <div className="p-3 md:p-6 space-y-3">
      {/* Total monthly cost summary — pinned above heartbeat */}
      {allJobs.length > 0 && (() => {
        const heartbeatCost = parseFloat(estimateMonthlyCost("*/15 * * * *", "claude-haiku-3-5").replace(/[^0-9.]/g, "")) || 0;
        const cronCost = regularJobs.reduce((sum, job) => {
          const expr = typeof job.schedule === "object" ? job.schedule?.expr ?? "" : job.schedule ?? "";
          const model = job.payload?.model ?? "default";
          const val = parseFloat(estimateMonthlyCost(expr, model).replace(/[^0-9.]/g, "")) || 0;
          return sum + val;
        }, 0);
        const total = (heartbeatCost + cronCost).toFixed(2);
        return (
          <div className="flex items-center justify-between px-3 py-2 bg-muted/40 rounded-lg border border-border">
            <span className="text-xs text-muted-foreground">Estimated total monthly cost (all jobs)</span>
            <span className="text-sm font-semibold text-foreground">~€{total}/month</span>
          </div>
        );
      })()}

      {/* Heartbeat section — below total cost */}
      <HeartbeatCard jobs={allJobs} />

      {/* Regular cron jobs header */}
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-muted-foreground">{regularJobs.length} cron job{regularJobs.length !== 1 ? "s" : ""} from OpenClaw</p>
        <button onClick={() => refetch()} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>

      {regularJobs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
          <Clock className="h-8 w-8 opacity-40" />
          <p className="text-sm font-medium">No cron jobs found</p>
        </div>
      ) : (
        regularJobs.map((job) => {
          const isActive = job.enabled !== false && job.active !== false;
          const scheduleExpr = typeof job.schedule === "object" ? job.schedule?.expr : job.schedule;
          const scheduleTz = typeof job.schedule === "object" ? job.schedule?.tz : undefined;
          const model = job.payload?.model ?? "default";
          const modelShort = model === "default" ? "default" : model.split("/").pop()?.replace("anthropic/", "") ?? model;
          const nextMs = job.state?.nextRunAtMs;
          const lastMs = job.state?.lastRunAtMs;
          const lastStatus = job.state?.lastRunStatus ?? job.status;
          const monthlyCost = scheduleExpr ? estimateMonthlyCost(scheduleExpr, model) : null;

          return (
            <div key={job.id} className="p-3 md:p-4 bg-card border border-border rounded-lg space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium leading-tight">{job.name || `Job ${job.id.slice(0, 8)}`}</p>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", isActive ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-muted text-muted-foreground")}>
                  {isActive ? "active" : "inactive"}
                </span>
              </div>
              {scheduleExpr && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span className="font-mono">{scheduleExpr}</span>
                  {scheduleTz && <span className="opacity-60">({scheduleTz})</span>}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {/* Model badge */}
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", modelBadgeClass(model))}
                  title={`Primary: ${model}`}>
                  {modelShort}
                </span>
                {/* Fallback hint */}
                {model !== "default" && (
                  <span className="text-xs text-muted-foreground opacity-60">
                    → {model.includes("nano") ? "haiku fallback" : model.includes("haiku") ? "sonnet fallback" : model.includes("sonnet") ? "opus fallback" : ""}
                  </span>
                )}
                {/* Cost estimate badge */}
                {monthlyCost && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                    {monthlyCost}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {nextMs && <span>Next: <span className="text-foreground font-medium">{formatRelativeTime(nextMs)}</span></span>}
                {lastMs && <span>Last: <span className="text-foreground">{formatRelativeTime(lastMs)}</span>{lastStatus && <span className={cn("ml-1", lastStatus === "ok" ? "text-green-500" : "text-red-500")}>({lastStatus})</span>}</span>}
                {(job.sessionTarget ?? job.target) && <span>Target: <span className="text-foreground">{job.sessionTarget ?? job.target}</span></span>}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ---- Spawn Modal ----
function SpawnModal({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const [result, setResult] = useState<{ needsSpawn?: boolean; openclawSessionKey?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSpawn() {
    setLoading(true);
    try {
      const res = await fetch(`/api/agents/${agent.id}/spawn`, { method: "POST" });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Failed to spawn agent" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background border border-border rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Spawn Agent</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!result ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Spawn a persistent session for <strong>{agent.name}</strong>.
            </p>
            <button
              onClick={handleSpawn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Spawn
            </button>
          </div>
        ) : result.error ? (
          <div className="text-sm text-red-500">{result.error}</div>
        ) : result.needsSpawn ? (
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Ask Prime to spawn this agent. It needs to be initialized before it can run.
            </p>
          </div>
        ) : result.openclawSessionKey ? (
          <div className="space-y-3">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">✓ Agent is active</p>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Session Key</p>
              <code className="block p-2 bg-muted rounded text-xs font-mono break-all">
                {result.openclawSessionKey}
              </code>
            </div>
          </div>
        ) : null}

        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-muted text-muted-foreground rounded-md text-sm hover:bg-muted/80 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ---- Main Page ----
export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>("board");
  const [skillsBrowserOpen, setSkillsBrowserOpen] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");
  const [spawnModalOpen, setSpawnModalOpen] = useState(false);
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

  const { data: directReports = [] } = useQuery({
    queryKey: ["directReports", id],
    queryFn: () => fetchDirectReports(id),
    enabled: !!id,
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
      const res = await fetch(`/api/agents/${id}/skills?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
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
    return s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q) || (s.description || "").toLowerCase().includes(q);
  });

  if (agentLoading) {
    return (
      <div className="p-3 md:p-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!agent) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Agent not found</div>;
  }

  const isMain = agent.isMain;

  return (
    <div className="flex flex-col h-full">
      {/* Agent header */}
      <div className="px-3 md:px-6 pt-4 md:pt-5 pb-0 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          {/* Avatar */}
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden" style={{ backgroundColor: agent.color + "25" }}>
            {agent.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={agent.avatarUrl} alt={agent.name} className="h-10 w-10 object-cover rounded-xl" />
            ) : (
              <Bot className="h-5 w-5" style={{ color: agent.color }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h1 className="text-base md:text-lg font-bold">{agent.name}</h1>
              {agent.isMain && <Star className="h-4 w-4 text-amber-400 fill-amber-400 shrink-0" />}
              {agent.isPersistent && (
                <span className="text-xs px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-full font-medium whitespace-nowrap">
                  Persistent
                </span>
              )}
              {(agent as Agent & { role?: string }).role && (
                <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                  {(agent as Agent & { role?: string }).role}
                </span>
              )}
              {agent.openclawAgentId && (
                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-mono truncate max-w-[120px] md:max-w-none">
                  openclaw:{agent.openclawAgentId}
                </span>
              )}
            </div>
            {agent.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{agent.description}</p>
            )}
            {(agent as Agent & { goal?: string }).goal && (
              <p className="text-xs text-primary/80 mt-1 flex items-center gap-1">
                🎯 <span className="line-clamp-1">{(agent as Agent & { goal?: string }).goal}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {agent.isPersistent && (
              <button
                onClick={() => setSpawnModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-lg text-sm font-medium hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
              >
                <Zap className="h-4 w-4" />
                Spawn
              </button>
            )}
            <button
              onClick={() => { refetchTasks(); toast.success("Refreshed"); }}
              title="Refresh board"
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-3 md:mx-0 px-3 md:px-0">
          {(["board", "skills"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex items-center gap-1.5 px-3 md:px-4 py-2 text-sm rounded-t-lg border border-b-0 transition-colors whitespace-nowrap min-h-[44px]",
                activeTab === tab ? "bg-background border-border text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "board" && <Kanban className="h-4 w-4" />}
              {tab === "skills" && <Package className="h-4 w-4" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "skills" && agentSkills.length > 0 && (
                <span className="ml-1 text-xs bg-primary/15 text-primary px-1.5 rounded-full">{agentSkills.length}</span>
              )}
            </button>
          ))}
          <button
            onClick={() => setActiveTab("jobs")}
            className={cn(
              "flex items-center gap-1.5 px-3 md:px-4 py-2 text-sm rounded-t-lg border border-b-0 transition-colors whitespace-nowrap min-h-[44px]",
              activeTab === "jobs" ? "bg-background border-border text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Clock className="h-4 w-4" />
            Jobs
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={cn(
              "flex items-center gap-1.5 px-3 md:px-4 py-2 text-sm rounded-t-lg border border-b-0 transition-colors whitespace-nowrap min-h-[44px]",
              activeTab === "files" ? "bg-background border-border text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="h-4 w-4" />
            Files
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
              <KanbanBoard agentId={id} initialTasks={{ BACKLOG: [], IN_PROGRESS: [], DONE: [] }} />
            )}

            {/* Direct Reports section */}
            {directReports.length > 0 && (
              <div className="p-3 md:p-6 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-semibold text-sm">Direct Reports</h2>
                  <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">{directReports.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {directReports.map((report) => (
                    <a
                      key={report.id}
                      href={`/agents/${report.id}`}
                      className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors group"
                    >
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden" style={{ backgroundColor: report.color + "20" }}>
                        {report.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={report.avatarUrl} alt={report.name} className="h-8 w-8 object-cover rounded-lg" />
                        ) : (
                          <Bot className="h-4 w-4" style={{ color: report.color }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{report.name}</p>
                        {(report as Agent & { role?: string }).role && (
                          <p className="text-xs text-muted-foreground">{(report as Agent & { role?: string }).role}</p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "skills" && (
          <div className="p-3 md:p-6 space-y-4 md:space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-semibold">Assigned Skills</h2>
                  <p className="text-sm text-muted-foreground">Skills mapped to {agent.name}</p>
                </div>
              </div>
              {agentSkillsLoading ? (
                <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}</div>
              ) : agentSkills.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
                  <Package className="h-8 w-8 opacity-40" />
                  <p className="text-sm">No skills assigned yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {agentSkills.map((skill) => (
                    <div key={skill.slug} className="flex items-center gap-3 px-3 py-2.5 bg-card border border-border rounded-lg">
                      <Package className="h-4 w-4 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{skill.name}</p>
                        {skill.description && <p className="text-xs text-muted-foreground truncate">{skill.description}</p>}
                      </div>
                      <span className="text-xs font-mono text-muted-foreground shrink-0 hidden sm:inline">{skill.slug}</span>
                      <button
                        onClick={() => { if (confirm(`Remove skill "${skill.name}"?`)) removeSkillMutation.mutate(skill.slug); }}
                        disabled={removeSkillMutation.isPending}
                        className="p-1 rounded hover:bg-red-500/10 hover:text-red-500 transition-colors text-muted-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-semibold">Available Skills</h2>
                  <p className="text-sm text-muted-foreground">Installed OpenClaw skills</p>
                </div>
                <button onClick={() => setSkillsBrowserOpen(true)} className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md text-sm hover:bg-muted transition-colors">
                  <Package className="h-4 w-4" />
                  Marketplace
                </button>
              </div>
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
                <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}</div>
              ) : filteredInstalled.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                  <Package className="h-8 w-8 opacity-40" />
                  <p className="text-sm">{skillSearch ? "No skills match your search" : "No skills installed"}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredInstalled.map((skill) => {
                    const assigned = assignedSlugs.has(skill.slug);
                    return (
                      <div key={skill.slug} className={cn("flex items-center gap-3 px-3 py-2.5 border rounded-lg transition-colors", assigned ? "bg-primary/5 border-primary/20" : "bg-card border-border")}>
                        <Package className={cn("h-4 w-4 shrink-0", assigned ? "text-primary" : "text-muted-foreground")} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{skill.name}</p>
                          {skill.description && <p className="text-xs text-muted-foreground truncate">{skill.description}</p>}
                        </div>
                        <span className="text-xs font-mono text-muted-foreground shrink-0 hidden sm:inline">{skill.slug}</span>
                        {assigned ? (
                          <button onClick={() => { if (confirm(`Remove skill "${skill.name}"?`)) removeSkillMutation.mutate(skill.slug); }} disabled={removeSkillMutation.isPending} className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors shrink-0">
                            <X className="h-3 w-3" /> Remove
                          </button>
                        ) : (
                          <button onClick={() => addSkillMutation.mutate(skill)} disabled={addSkillMutation.isPending} className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0">
                            <Plus className="h-3 w-3" /> Add
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
        {activeTab === "files" && !isMain && <AgentFilesTab agentId={id} />}
        {activeTab === "jobs" && isMain && <JobsTab />}
        {activeTab === "jobs" && !isMain && <AgentJobsTab agentId={id} />}
      </div>

      {skillsBrowserOpen && <SkillsBrowser open={skillsBrowserOpen} onClose={() => setSkillsBrowserOpen(false)} />}
      {spawnModalOpen && <SpawnModal agent={agent} onClose={() => setSpawnModalOpen(false)} />}
    </div>
  );
}
