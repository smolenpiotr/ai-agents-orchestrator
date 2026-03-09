export interface ClawHubSkill {
  slug: string;
  name: string;
  summary: string;
  tags: string[];
  downloads: number;
  stars: number;
  latestVersion?: {
    version: string;
    changelog?: string;
    license?: string;
  };
}

export interface SkillsResponse {
  skills: ClawHubSkill[];
  nextCursor?: string;
}

export async function fetchClawHubSkills(
  query?: string,
  cursor?: string
): Promise<SkillsResponse> {
  const url = new URL("https://clawhub.ai/api/v1/skills");
  if (query) url.searchParams.set("q", query);
  if (cursor) url.searchParams.set("cursor", cursor);

  const resp = await fetch(url.toString(), {
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 60 },
  });

  if (!resp.ok) {
    throw new Error(`clawhub API error ${resp.status}`);
  }

  const data = await resp.json();

  // Normalize response shape
  const skills: ClawHubSkill[] = (data.skills ?? data.data ?? []).map(
    (s: Record<string, unknown>) => ({
      slug: String(s.slug ?? ""),
      name: String(s.name ?? s.slug ?? ""),
      summary: String(s.summary ?? s.description ?? ""),
      tags: Array.isArray(s.tags) ? s.tags.map(String) : [],
      downloads: Number(s.downloads ?? 0),
      stars: Number(s.stars ?? 0),
      latestVersion: s.latestVersion
        ? {
            version: String((s.latestVersion as Record<string, unknown>).version ?? ""),
            changelog: String((s.latestVersion as Record<string, unknown>).changelog ?? ""),
            license: String((s.latestVersion as Record<string, unknown>).license ?? ""),
          }
        : undefined,
    })
  );

  return {
    skills,
    nextCursor: data.nextCursor ?? undefined,
  };
}
