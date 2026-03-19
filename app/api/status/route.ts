import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function checkService(url: string, secret?: string): Promise<boolean> {
  try {
    const headers: Record<string, string> = {};
    if (secret) headers["x-files-secret"] = secret;
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(4000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  const proxyUrl = process.env.FILES_PROXY_URL;
  const proxySecret = process.env.FILES_PROXY_SECRET;

  const [db, filesProxy, paperclip] = await Promise.all([
    prisma.agent.count().then(() => true).catch(() => false),
    proxyUrl && proxySecret
      ? checkService(`${proxyUrl}/ping`, proxySecret)
      : Promise.resolve(false),
    checkService("http://127.0.0.1:3100/api/health").catch(() => false),
  ]);

  // Jobs sync check
  let syncOk = false;
  try {
    const row = await prisma.settings.findUnique({ where: { key: "cronJobs" } });
    if (row) {
      const data = JSON.parse(row.value);
      const lastSync = data.jobs?.[0]?.state?.lastRunAtMs;
      syncOk = lastSync ? (Date.now() - lastSync) < 2 * 60 * 60 * 1000 : false;
    }
  } catch { syncOk = false; }

  return NextResponse.json({
    db,
    filesProxy,
    paperclip,
    syncDaemon: syncOk,
    timestamp: new Date().toISOString(),
  });
}
