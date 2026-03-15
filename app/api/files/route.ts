import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const WORKSPACE = "/Users/piotrsmo/.openclaw/workspace";

const ALLOWED_FILES: Record<string, string> = {
  SOUL: path.join(WORKSPACE, "SOUL.md"),
  MEMORY: path.join(WORKSPACE, "MEMORY.md"),
  HEARTBEAT: path.join(WORKSPACE, "HEARTBEAT.md"),
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name || !ALLOWED_FILES[name]) {
    return NextResponse.json({ error: "Invalid file name. Use SOUL, MEMORY, or HEARTBEAT." }, { status: 400 });
  }

  try {
    const filePath = ALLOWED_FILES[name];
    let content = "";
    try {
      content = await fs.readFile(filePath, "utf-8");
    } catch {
      // File doesn't exist yet, return empty
      content = "";
    }
    return NextResponse.json({ content });
  } catch (error) {
    console.error("[GET /api/files]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, content } = body;

    if (!name || !ALLOWED_FILES[name]) {
      return NextResponse.json({ error: "Invalid file name. Use SOUL, MEMORY, or HEARTBEAT." }, { status: 400 });
    }

    if (typeof content !== "string") {
      return NextResponse.json({ error: "Content must be a string" }, { status: 400 });
    }

    const filePath = ALLOWED_FILES[name];
    await fs.writeFile(filePath, content, "utf-8");
    return NextResponse.json({ success: true, savedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[POST /api/files]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
