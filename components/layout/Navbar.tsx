"use client";

import Link from "next/link";
import { Bot, Settings, LayoutGrid, Menu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface NavbarProps {
  onMenuClick?: () => void;
}

interface StatusData {
  db: boolean;
  filesProxy: boolean;
}

function StatusDot({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      title={`${label}: ${ok ? "connected" : "offline"}`}
      className={`inline-block w-2 h-2 rounded-full ${ok ? "bg-green-400" : "bg-red-400"}`}
    />
  );
}

function ConnectionStatus() {
  const { data, isLoading } = useQuery<StatusData>({
    queryKey: ["system-status"],
    queryFn: async () => {
      const res = await fetch("/api/status");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 30000,
    retry: false,
  });

  if (isLoading) {
    return (
      <span className="flex items-center gap-1 px-2">
        <span className="inline-block w-2 h-2 rounded-full bg-muted animate-pulse" />
      </span>
    );
  }

  const allOk = data?.db && data?.filesProxy;

  return (
    <span className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-sidebar-foreground/60">
      {allOk ? (
        <span title="All systems operational" className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
          <span className="hidden md:inline">Online</span>
        </span>
      ) : (
        <span className="flex items-center gap-1">
          <StatusDot ok={data?.db ?? false} label="Database" />
          <StatusDot ok={data?.filesProxy ?? false} label="Files" />
          <span className="hidden md:inline text-xs">
            {!data?.db ? "DB offline" : "Files offline"}
          </span>
        </span>
      )}
    </span>
  );
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="h-14 border-b border-sidebar-border bg-sidebar flex items-center px-4 gap-3 shrink-0">
      {/* Hamburger button — mobile only */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Link href="/" className="flex items-center gap-2 text-sidebar-foreground font-semibold">
        <Bot className="h-5 w-5 text-primary shrink-0" />
        <span className="hidden sm:inline">AI Agents Orchestrator</span>
        <span className="sm:hidden">AI Agents</span>
      </Link>

      <div className="ml-auto flex items-center gap-1">
        <ConnectionStatus />

        <nav className="flex items-center gap-1">
          <Link
            href="/agents"
            className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors min-h-[44px]"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Agents</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors min-h-[44px]"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
