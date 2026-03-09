"use client";

import { useQuery } from "@tanstack/react-query";
import { Package, AlertCircle } from "lucide-react";

interface InstalledSkill {
  slug: string;
  name: string;
  description: string;
}

async function fetchInstalled(): Promise<InstalledSkill[]> {
  const res = await fetch("/api/skills/installed");
  if (!res.ok) throw new Error("Failed to fetch installed skills");
  return res.json();
}

export function InstalledSkills() {
  const { data: skills = [], isLoading, error } = useQuery({
    queryKey: ["skills", "installed"],
    queryFn: fetchInstalled,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
        <AlertCircle className="h-4 w-4" />
        Failed to load installed skills
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
        <Package className="h-8 w-8 opacity-40" />
        <p className="text-sm">No skills installed yet</p>
        <p className="text-xs opacity-60">Browse the marketplace to find skills</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {skills.map((skill) => (
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
        </div>
      ))}
    </div>
  );
}
