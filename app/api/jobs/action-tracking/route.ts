import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const SETTINGS_KEY = "cronActionEvents";
const MAX_EVENTS = 200;

const actionEventSchema = z.object({
  jobId: z.string().min(1),
  jobName: z.string().min(1).optional(),
  runAt: z.string().datetime().optional(),
  status: z.enum(["ok", "error", "skipped"]).default("ok"),
  deliveredAction: z.boolean().default(false),
  actionType: z.string().min(1).optional(),
  actionCount: z.number().int().min(0).default(0),
  summary: z.string().max(280).optional(),
});

export async function GET() {
  try {
    const row = await prisma.settings.findUnique({ where: { key: SETTINGS_KEY } });
    const events = row ? safeParseEvents(row.value) : [];
    return NextResponse.json({ events }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[GET /api/jobs/action-tracking]", error);
    return NextResponse.json({ events: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = actionEventSchema.parse(body);
    const normalized = {
      ...event,
      runAt: event.runAt ?? new Date().toISOString(),
    };

    const row = await prisma.settings.findUnique({ where: { key: SETTINGS_KEY } });
    const events = row ? safeParseEvents(row.value) : [];
    const nextEvents = [normalized, ...events].slice(0, MAX_EVENTS);

    await prisma.settings.upsert({
      where: { key: SETTINGS_KEY },
      update: { value: JSON.stringify(nextEvents) },
      create: { key: SETTINGS_KEY, value: JSON.stringify(nextEvents) },
    });

    return NextResponse.json({ ok: true, event: normalized });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error("[POST /api/jobs/action-tracking]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function safeParseEvents(value: string): Array<Record<string, unknown>> {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
