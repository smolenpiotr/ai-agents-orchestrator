import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createAgentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  openclawAgentId: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
});

export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: [{ isMain: "desc" }, { createdAt: "asc" }],
      include: {
        _count: { select: { tasks: true } },
        tasks: {
          select: { status: true },
        },
      },
    });

    const result = agents.map((agent) => {
      const taskStats = {
        BACKLOG: agent.tasks.filter((t) => t.status === "BACKLOG").length,
        IN_PROGRESS: agent.tasks.filter((t) => t.status === "IN_PROGRESS").length,
        DONE: agent.tasks.filter((t) => t.status === "DONE").length,
      };
      const { tasks: _, ...agentWithoutTasks } = agent;
      return { ...agentWithoutTasks, taskStats };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/agents]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = createAgentSchema.parse(body);

    const agent = await prisma.agent.create({
      data: {
        name: data.name,
        description: data.description,
        openclawAgentId: data.openclawAgentId,
        model: data.model ?? "openclaw:main",
        color: data.color ?? "#6366f1",
      },
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[POST /api/agents]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
