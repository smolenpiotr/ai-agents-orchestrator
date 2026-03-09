"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, CheckCircle, XCircle, Loader2, Eye, EyeOff, Copy } from "lucide-react";
import { toast } from "sonner";

async function fetchSettings(): Promise<Record<string, string>> {
  const res = await fetch("/api/settings");
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

async function checkConnection(): Promise<{ connected: boolean }> {
  const res = await fetch("/api/openclaw/ping");
  return res.json();
}

const HOOK_CODE = `// Place this file in ~/.openclaw/skills/orchestrator-logger/SKILL.md
// ---
// name: orchestrator-logger
// description: Logs agent actions to AI Agents Orchestrator
// user-invocable: false
// ---

// Place this file in ~/.openclaw/skills/orchestrator-logger/hook.ts
import type { HookEvent } from "openclaw";

export default async function handler(event: HookEvent) {
  if (event.action !== "message:sent") return;

  try {
    await fetch("http://localhost:3001/api/webhooks/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId: event.sessionKey,
        action: event.message?.content ?? "Agent action",
        timestamp: new Date().toISOString(),
        secret: process.env.ORCHESTRATOR_WEBHOOK_SECRET,
      }),
    });
  } catch {
    // Silent fail - don't interrupt agent
  }
}`;

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [gatewayUrl, setGatewayUrl] = useState("http://127.0.0.1:18789");
  const [authToken, setAuthToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showHook, setShowHook] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const { data: connectionStatus, refetch: recheckConnection, isFetching: checkingConnection } = useQuery({
    queryKey: ["openclaw-ping"],
    queryFn: checkConnection,
    refetchInterval: false,
    enabled: false,
  });

  useEffect(() => {
    if (settings) {
      if (settings.gatewayUrl) setGatewayUrl(settings.gatewayUrl);
      if (settings.authToken) setAuthToken(settings.authToken);
    }
  }, [settings]);

  async function saveSetting(key: string, value: string) {
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all([
        saveSetting("gatewayUrl", gatewayUrl),
        saveSetting("authToken", authToken),
      ]);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      {/* Connection Settings */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-1">openclaw.ai Connection</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Configure how this app connects to your local openclaw.ai instance
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Gateway URL</label>
            <input
              value={gatewayUrl}
              onChange={(e) => setGatewayUrl(e.target.value)}
              placeholder="http://127.0.0.1:18789"
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Auth Token</label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                placeholder="Bearer token (leave blank if not required)"
                className="w-full px-3 py-2 pr-10 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Settings
            </button>

            <button
              type="button"
              onClick={() => recheckConnection()}
              disabled={checkingConnection}
              className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-md text-sm font-medium hover:bg-muted/80 disabled:opacity-50 transition-colors"
            >
              {checkingConnection ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : connectionStatus?.connected ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : connectionStatus !== undefined ? (
                <XCircle className="h-4 w-4 text-destructive" />
              ) : null}
              Test Connection
            </button>

            {connectionStatus !== undefined && (
              <span className={`text-sm ${connectionStatus.connected ? "text-green-500" : "text-destructive"}`}>
                {connectionStatus.connected ? "Connected" : "Disconnected"}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Hook Setup */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-semibold mb-1">openclaw Hook Setup</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Install a hook in openclaw.ai to automatically log agent actions as Kanban tasks
        </p>

        <button
          onClick={() => setShowHook(!showHook)}
          className="px-4 py-2 bg-muted text-muted-foreground rounded-md text-sm hover:bg-muted/80 transition-colors mb-4"
        >
          {showHook ? "Hide" : "Show"} Hook Code
        </button>

        {showHook && (
          <div className="relative">
            <pre className="bg-muted/50 border border-border rounded-lg p-4 text-xs overflow-auto max-h-64 text-muted-foreground">
              {HOOK_CODE}
            </pre>
            <button
              onClick={() => {
                navigator.clipboard.writeText(HOOK_CODE);
                toast.success("Copied to clipboard");
              }}
              className="absolute top-2 right-2 p-1.5 bg-background border border-border rounded hover:bg-muted transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">How it works: </span>
            When openclaw.ai performs an action, it POSTs to{" "}
            <code className="bg-muted px-1 py-0.5 rounded text-xs">
              http://localhost:3001/api/webhooks/action
            </code>
            . The app auto-creates an In Progress task on the matching agent&apos;s Kanban board.
          </p>
        </div>
      </div>
    </div>
  );
}
