import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getJobActionTracking } from "@/lib/job-action-tracking";

const ACTION_EVENTS_KEY = "cronActionEvents";

export async function GET() {
  try {
    const [row, actionEventsRow] = await Promise.all([
      prisma.settings.findUnique({ where: { key: "cronJobs" } }),
      prisma.settings.findUnique({ where: { key: ACTION_EVENTS_KEY } }),
    ]);
    if (!row) {
      return NextResponse.json({ source: "db", jobs: [] }, { headers: { "Cache-Control": "no-store" } });
    }
    const data = JSON.parse(row.value);
    const events = actionEventsRow ? safeParseEvents(actionEventsRow.value) : [];
    const jobs = (data.jobs ?? []).map((job: Record<string, unknown>) => ({
      ...job,
      actionTracking: mergeActionTracking(job, events),
    }));
    return NextResponse.json({ source: "db", jobs }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ source: "none", jobs: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}

function mergeActionTracking(job: Record<string, unknown>, events: Array<Record<string, unknown>>) {
  const base = getJobActionTracking(job);
  const latest = events.find((event) => event.jobId === job.id);
  if (!latest) return base;

  return {
    ...base,
    deliveredAction: (latest.deliveredAction as boolean | undefined) ?? base.deliveredAction,
    actionType: (latest.actionType as string | undefined) ?? base.actionType,
    actionCount: (latest.actionCount as number | undefined) ?? base.actionCount,
    summary: (latest.summary as string | undefined) ?? base.summary,
    lastActionAt: (latest.runAt as string | undefined) ?? base.lastActionAt,
  };
}

function safeParseEvents(value: string): Array<Record<string, unknown>> {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
