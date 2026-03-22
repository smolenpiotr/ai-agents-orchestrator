"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Plus, FolderKanban, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: "ACTIVE" | "PAUSED" | "DONE" | "IDEA";
  url?: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG = {
  ACTIVE: { label: "Active", className: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
  PAUSED: { label: "Paused", className: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
  DONE: { label: "Done", className: "bg-muted text-muted-foreground" },
  IDEA: { label: "Idea", className: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" },
};

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export default function ProjectsPage() {
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track and manage your projects</p>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors min-h-[44px]"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">Failed to load projects.</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
          <FolderKanban className="h-10 w-10 opacity-40" />
          <p className="text-sm font-medium">No projects yet</p>
          <p className="text-xs opacity-60">Create your first project to get started</p>
          <Link
            href="/projects/new"
            className="mt-2 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const status = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.ACTIVE;
            return (
              <div
                key={project.id}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors group"
              >
                {/* Color strip */}
                <div className="h-1.5 w-full" style={{ backgroundColor: project.color }} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className="font-semibold text-sm leading-tight line-clamp-1 flex-1">{project.name}</h2>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", status.className)}>
                      {status.label}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
                  )}
                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <span className="text-xs text-muted-foreground">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                          title="Open URL"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
