import Link from "next/link";
import { Bot, Settings, LayoutGrid } from "lucide-react";

export function Navbar() {
  return (
    <header className="h-14 border-b border-sidebar-border bg-sidebar flex items-center px-4 gap-4 shrink-0">
      <Link href="/" className="flex items-center gap-2 text-sidebar-foreground font-semibold">
        <Bot className="h-5 w-5 text-primary" />
        <span>AI Agents Orchestrator</span>
      </Link>

      <nav className="flex items-center gap-1 ml-4">
        <Link
          href="/agents"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <LayoutGrid className="h-4 w-4" />
          Agents
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </nav>
    </header>
  );
}
