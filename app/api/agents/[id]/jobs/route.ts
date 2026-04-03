import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { prisma } from "@/lib/prisma";

const execAsync = promisify(exec);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const agent = await prisma.agent.findUnique({ where: { id } });
    if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { stdout } = await execAsync("openclaw cron list --json");
    const data = JSON.parse(stdout.trim());
    const allJobs: Array<Record<string, unknown>> = data.jobs ?? data ?? [];

    const filtered = allJobs.filter((j) => {
      if (agent.openclawAgentId && j.agentId === agent.openclawAgentId) return true;
      const name = agent.name.toLowerCase();
      const jobAgent = ((j.agentId as string) ?? "").toLowerCase();
      return jobAgent.includes(name) || (name === "prime" || name === "main");
    });

    const jobs = filtered.map((j) => {
      const schedule = j.schedule as { expr?: string; kind?: string; tz?: string } | string | undefined;
      const scheduleExpr = typeof schedule === "object" ? schedule?.expr ?? "" : schedule ?? "";
      const state = j.state as { nextRunAtMs?: number; lastRunAtMs?: number; lastRunStatus?: string } | undefined;
      const payload = j.payload as { model?: string } | undefined;

      return {
        id: j.id as string,
        name: (j.name as string) ?? null,
        schedule: scheduleExpr,
        model: payload?.model ?? null,
        lastRunStatus: state?.lastRunStatus ?? null,
        lastRun: state?.lastRunAtMs ? new Date(state.lastRunAtMs).toISOString() : null,
        nextRun: state?.nextRunAtMs ? new Date(state.nextRunAtMs).toISOString() : null,
        enabled: (j.enabled as boolean) !== false,
      };
    });

    return NextResponse.json({ jobs }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[GET /api/agents/:id/jobs]", error);
    return NextResponse.json({ jobs: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}
