"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, X, Loader2, ShoppingBag } from "lucide-react";
import { SkillCard } from "./SkillCard";
import type { ClawHubSkill, SkillsResponse } from "@/lib/clawhub";

async function fetchSkills(q: string, cursor?: string): Promise<SkillsResponse> {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (cursor) params.set("cursor", cursor);
  const res = await fetch(`/api/skills/browse?${params}`);
  if (!res.ok) throw new Error("Failed to fetch skills");
  return res.json();
}

interface SkillsBrowserProps {
  open: boolean;
  onClose: () => void;
}

export function SkillsBrowser({ open, onClose }: SkillsBrowserProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [cursor, setCursor] = useState<string | undefined>();
  const [allSkills, setAllSkills] = useState<ClawHubSkill[]>([]);
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query);
      setCursor(undefined);
      setAllSkills([]);
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["skills", "browse", debouncedQuery, cursor],
    queryFn: () => fetchSkills(debouncedQuery, cursor),
    enabled: open,
  });

  useEffect(() => {
    if (data?.skills) {
      setAllSkills((prev) => cursor ? [...prev, ...data.skills] : data.skills);
    }
  }, [data, cursor]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-background border border-border rounded-xl shadow-2xl w-full max-w-3xl mx-4 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Skills Marketplace</h2>
            <span className="text-xs text-muted-foreground">powered by clawhub.ai</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search skills..."
              className="w-full pl-9 pr-4 py-2 bg-muted border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Skills grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && allSkills.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShoppingBag className="h-10 w-10 opacity-30 mb-3" />
              <p className="text-sm">No skills found</p>
              {debouncedQuery && (
                <p className="text-xs opacity-60 mt-1">Try a different search term</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allSkills.map((skill) => (
              <SkillCard
                key={skill.slug}
                skill={skill}
                onInstalled={() => {
                  queryClient.invalidateQueries({ queryKey: ["skills", "installed"] });
                }}
              />
            ))}
          </div>

          {data?.nextCursor && (
            <button
              onClick={() => setCursor(data.nextCursor)}
              disabled={isFetching}
              className="w-full mt-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                "Load more"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
