import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; jobId: string }> }
) {
  const { jobId } = await params;
  try {
    await execAsync(`openclaw cron run ${jobId}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[POST /api/agents/:id/jobs/:jobId/run]", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
