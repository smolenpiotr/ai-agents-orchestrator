"use client";

import Link from "next/link";
import { Bot, Settings, LayoutGrid, Menu } from "lucide-react";

interface NavbarProps {
  onMenuClick?: () => void;
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

      <nav className="flex items-center gap-1 ml-auto md:ml-4">
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
    </header>
  );
}
