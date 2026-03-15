import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/agents/[id]/skills — list agent's assigned skills
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const agentSkills = await prisma.agentSkill.findMany({
    where: { agentId: id },
    include: { skill: true },
  });
  return NextResponse.json(agentSkills.map((as) => as.skill));
}

// POST /api/agents/[id]/skills — assign a skill (upsert Skill + AgentSkill)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { slug, name, description } = await req.json();

  if (!slug || !name) {
    return NextResponse.json({ error: "slug and name are required" }, { status: 400 });
  }

  // Upsert the Skill record
  await prisma.skill.upsert({
    where: { slug },
    update: { name, description },
    create: { slug, name, description },
  });

  // Create AgentSkill (ignore if already exists)
  await prisma.agentSkill.upsert({
    where: { agentId_skillSlug: { agentId: id, skillSlug: slug } },
    update: {},
    create: { agentId: id, skillSlug: slug },
  });

  return NextResponse.json({ ok: true });
}

// DELETE /api/agents/[id]/skills?slug=xxx — remove skill assignment
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  await prisma.agentSkill.delete({
    where: { agentId_skillSlug: { agentId: id, skillSlug: slug } },
  }).catch(() => null); // ignore if not found

  return NextResponse.json({ ok: true });
}
