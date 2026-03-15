import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface CronJobEntry {
  id: string;
  name: string;
  schedule: string;
  next: string;
  last: string;
  status: string;
  target: string;
  agentId: string;
  model: string;
  active: boolean;
}

/**
 * Parse the tabular output from `openclaw cron list`.
 * Columns: ID | Name | Schedule | Next | Last | Status | Target | Agent ID | Model
 */
function parseCronListOutput(stdout: string): CronJobEntry[] {
  const lines = stdout.split("\n").filter((l) => l.trim());

  // Find the header line
  const headerIdx = lines.findIndex((l) =>
    l.includes("ID") && l.includes("Name") && l.includes("Schedule")
  );
  if (headerIdx === -1) return [];

  const dataLines = lines.slice(headerIdx + 1).filter((l) => {
    const t = l.trim();
    // Skip separator/box lines and doctor warnings
    return t.length > 0 && !t.startsWith("│") && !t.startsWith("◇") && !t.startsWith("├") && !t.startsWith("─");
  });

  const jobs: CronJobEntry[] = [];

  for (const line of dataLines) {
    // Split by 2+ spaces (the CLI uses spaced columns)
    const parts = line.trim().split(/\s{2,}/);
    if (parts.length < 6) continue;

    const [id, name, schedule, next, last, status, target, agentId, model] = parts;

    // Must look like a UUID
    if (!id || !/^[0-9a-f-]{36}$/.test(id.trim())) continue;

    jobs.push({
      id: id.trim(),
      name: name?.trim() ?? "",
      schedule: schedule?.trim() ?? "",
      next: next?.trim() ?? "",
      last: last?.trim() ?? "",
      status: status?.trim() ?? "",
      target: target?.trim() ?? "",
      agentId: agentId?.trim() ?? "",
      model: model?.trim() ?? "",
      active: status?.trim().toLowerCase() === "ok" || status?.trim().toLowerCase() === "active",
    });
  }

  return jobs;
}

export async function GET() {
  try {
    // Try CLI — strip ANSI escape codes from output
    const { stdout } = await execAsync(
      "openclaw cron list 2>/dev/null | sed 's/\\x1b\\[[0-9;]*m//g'",
      { timeout: 8000 }
    );

    const jobs = parseCronListOutput(stdout);

    return NextResponse.json(
      { source: "cli", jobs },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[GET /api/jobs] CLI error:", error);
    return NextResponse.json(
      { source: "none", jobs: [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
