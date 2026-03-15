import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const CRON_PATHS = [
  path.join(process.env.HOME || "/Users/piotrsmo", ".openclaw", "crontab.json"),
  path.join(process.env.HOME || "/Users/piotrsmo", ".openclaw", "crons.json"),
];

async function readCronFile(): Promise<{ source: string; data: unknown } | null> {
  for (const p of CRON_PATHS) {
    try {
      const content = await fs.readFile(p, "utf-8");
      return { source: p, data: JSON.parse(content) };
    } catch {
      // try next
    }
  }
  return null;
}

async function readCronCLI(): Promise<unknown | null> {
  try {
    const { stdout } = await execAsync("openclaw cron list --output json 2>/dev/null", { timeout: 5000 });
    if (stdout.trim()) {
      return JSON.parse(stdout.trim());
    }
  } catch {
    // CLI not available or failed
  }
  return null;
}

export async function GET() {
  try {
    const fileResult = await readCronFile();
    if (fileResult) {
      return NextResponse.json({ source: "file", path: fileResult.source, jobs: fileResult.data });
    }

    const cliResult = await readCronCLI();
    if (cliResult) {
      return NextResponse.json({ source: "cli", jobs: cliResult });
    }

    return NextResponse.json({ source: "none", jobs: [] });
  } catch (error) {
    console.error("[GET /api/jobs]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
