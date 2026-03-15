import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const CRON_PATHS = [
  path.join(process.env.HOME || "/Users/piotrsmo", ".openclaw", "crontab.json"),
  path.join(process.env.HOME || "/Users/piotrsmo", ".openclaw", "crons.json"),
];

async function findCronFile(): Promise<string | null> {
  for (const p of CRON_PATHS) {
    try {
      await fs.access(p);
      return p;
    } catch {
      // try next
    }
  }
  return null;
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const filePath = await findCronFile();
    if (!filePath) {
      return NextResponse.json({ error: "No cron file found" }, { status: 404 });
    }

    const content = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(content);

    // Try to toggle by id - handle array or object formats
    let updated = false;
    if (Array.isArray(data)) {
      const job = data.find((j: Record<string, unknown>) => j.id === id || j.name === id);
      if (job) {
        job.enabled = !job.enabled;
        job.active = !job.active;
        updated = true;
      }
    } else if (data[id]) {
      data[id].enabled = !data[id].enabled;
      updated = true;
    }

    if (!updated) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/jobs/:id/toggle]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
