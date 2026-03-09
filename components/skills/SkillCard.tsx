"use client";

import { useState } from "react";
import { Download, Star, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ClawHubSkill } from "@/lib/clawhub";

interface SkillCardProps {
  skill: ClawHubSkill;
  installed?: boolean;
  onInstalled?: () => void;
}

export function SkillCard({ skill, installed = false, onInstalled }: SkillCardProps) {
  const [installing, setInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(installed);

  async function handleInstall() {
    setInstalling(true);
    try {
      const res = await fetch("/api/skills/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: skill.slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Installation failed");
      setIsInstalled(true);
      toast.success(`${skill.name} installed successfully`);
      onInstalled?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Installation failed");
    } finally {
      setInstalling(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{skill.name}</h3>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{skill.slug}</p>
        </div>
        {isInstalled ? (
          <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
        ) : (
          <button
            onClick={handleInstall}
            disabled={installing}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md transition-colors shrink-0",
              "bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50"
            )}
          >
            {installing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            {installing ? "Installing..." : "Install"}
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2">{skill.summary}</p>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3" />
          {skill.stars}
        </div>
        <div className="flex items-center gap-1">
          <Download className="h-3 w-3" />
          {skill.downloads.toLocaleString()}
        </div>
        {skill.latestVersion && (
          <span className="text-primary/60">v{skill.latestVersion.version}</span>
        )}
      </div>

      {skill.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {skill.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
