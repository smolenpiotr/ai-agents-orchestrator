"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AGENT_COLORS } from "@/lib/constants";
import type { Agent } from "@/types/agent";
import type { OpenclawAgent } from "@/types/openclaw";

interface AgentFormProps {
  agent?: Agent;
}

async function fetchOpenclawAgents(): Promise<OpenclawAgent[]> {
  const res = await fetch("/api/openclaw/agents");
  if (!res.ok) return [];
  return res.json();
}

export function AgentForm({ agent }: AgentFormProps) {
  const router = useRouter();
  const [name, setName] = useState(agent?.name ?? "");
  const [description, setDescription] = useState(agent?.description ?? "");
  const [openclawAgentId, setOpenclawAgentId] = useState(agent?.openclawAgentId ?? "");
  const [color, setColor] = useState(agent?.color ?? AGENT_COLORS[0]);
  const [isPersistent, setIsPersistent] = useState(agent?.isPersistent ?? false);
  const [loading, setLoading] = useState(false);

  const { data: openclawAgents = [] } = useQuery({
    queryKey: ["openclaw-agents"],
    queryFn: fetchOpenclawAgents,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      const url = agent ? `/api/agents/${agent.id}` : "/api/agents";
      const method = agent ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          openclawAgentId: openclawAgentId.trim() || undefined,
          color,
          isPersistent,
        }),
      });

      if (!res.ok) throw new Error("Failed to save agent");
      const saved = await res.json();
      toast.success(agent ? "Agent updated" : "Agent created");
      router.push(`/agents/${saved.id}`);
    } catch {
      toast.error("Failed to save agent");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1.5">Name *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Agent"
          required
          className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this agent do?"
          rows={3}
          className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">openclaw Agent ID</label>
        <div className="flex gap-2">
          {openclawAgents.length > 0 ? (
            <select
              value={openclawAgentId}
              onChange={(e) => setOpenclawAgentId(e.target.value)}
              className="flex-1 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">-- Select an agent --</option>
              {openclawAgents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name || a.id}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={openclawAgentId}
              onChange={(e) => setOpenclawAgentId(e.target.value)}
              placeholder="e.g. main"
              className="flex-1 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Links to an existing openclaw.ai session/agent
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Color</label>
        <div className="flex flex-wrap gap-2">
          {AGENT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                borderColor: color === c ? "white" : "transparent",
                boxShadow: color === c ? `0 0 0 2px ${c}` : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Persistent Sub-agent Toggle */}
      <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border">
        <div>
          <p className="text-sm font-medium">Persistent Sub-agent</p>
          <p className="text-xs text-muted-foreground">
            This agent runs as a persistent OpenClaw session
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isPersistent}
          onClick={() => setIsPersistent(!isPersistent)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
            isPersistent ? "bg-primary" : "bg-muted-foreground/30"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform transition-transform ${
              isPersistent ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {agent ? "Save Changes" : "Create Agent"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 bg-muted text-muted-foreground rounded-md text-sm font-medium hover:bg-muted/80 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
