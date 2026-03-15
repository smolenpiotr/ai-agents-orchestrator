import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const agent = await prisma.agent.findUnique({ where: { id } });
    if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (agent.openclawSessionKey) {
      return NextResponse.json({ openclawSessionKey: agent.openclawSessionKey });
    }

    return NextResponse.json({ needsSpawn: true });
  } catch (error) {
    console.error("[POST /api/agents/:id/spawn]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
