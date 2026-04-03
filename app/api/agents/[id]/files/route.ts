import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

const FILES_TO_READ = ["SOUL.md", "AGENTS.md", "TOOLS.md", "IDENTITY.md", "USER.md", "memory/MEMORY.md"];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const agent = await prisma.agent.findUnique({ where: { id } });
    if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const name = agent.name.toLowerCase();
    const BASE = "/Users/piotrsmo/.openclaw/workspace";
    const workspace = name === "prime" || name === "main"
      ? BASE
      : path.join(BASE, "agents", name);

    const files = FILES_TO_READ.map((filename) => {
      const filePath = path.join(workspace, filename);
      let content: string | null = null;
      let size = 0;
      let lastModified: string | null = null;
      let exists = false;

      try {
        const stat = fs.statSync(filePath);
        exists = true;
        size = stat.size;
        lastModified = stat.mtime.toISOString();
        content = fs.readFileSync(filePath, "utf-8");
      } catch {
        // file doesn't exist
      }

      return { name: filename, path: filePath, content, size, exists, lastModified };
    });

    return NextResponse.json({ files }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[GET /api/agents/:id/files]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
