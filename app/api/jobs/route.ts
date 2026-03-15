import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const row = await prisma.settings.findUnique({ where: { key: "cronJobs" } });
    if (!row) {
      return NextResponse.json({ source: "db", jobs: [] }, { headers: { "Cache-Control": "no-store" } });
    }
    const data = JSON.parse(row.value);
    return NextResponse.json({ source: "db", jobs: data.jobs ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ source: "none", jobs: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}
