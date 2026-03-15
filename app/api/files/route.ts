import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_FILES = ["SOUL", "MEMORY", "HEARTBEAT", "AGENTS", "USER"];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  if (!name || !ALLOWED_FILES.includes(name)) {
    return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
  }
  try {
    const row = await prisma.settings.findUnique({ where: { key: `file_${name}` } });
    return NextResponse.json({ content: row?.value ?? "" }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, content } = await req.json();
    if (!name || !ALLOWED_FILES.includes(name) || typeof content !== "string") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    await prisma.settings.upsert({
      where: { key: `file_${name}` },
      update: { value: content },
      create: { key: `file_${name}`, value: content },
    });
    return NextResponse.json({ success: true, savedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
