import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const results = await Promise.allSettled([
    // DB check
    prisma.agent.count().then(() => true),
    // Files proxy check
    (async () => {
      const url = process.env.FILES_PROXY_URL;
      const secret = process.env.FILES_PROXY_SECRET;
      if (!url || !secret) return false;
      const res = await fetch(`${url}/files?name=SOUL`, {
        headers: { "x-files-secret": secret },
        signal: AbortSignal.timeout(4000),
      });
      return res.ok;
    })(),
  ]);

  return NextResponse.json({
    db: results[0].status === "fulfilled" && results[0].value === true,
    filesProxy: results[1].status === "fulfilled" && results[1].value === true,
    timestamp: new Date().toISOString(),
  });
}
