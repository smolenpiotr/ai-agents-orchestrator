import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { GAP } from "@/lib/constants";

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["BACKLOG", "IN_PROGRESS", "DONE"]).optional(),
  agentId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const status = data.status ?? "BACKLOG";

    const lastTask = await prisma.task.findFirst({
      where: { agentId: data.agentId, status },
      orderBy: { order: "desc" },
    });

    const order = lastTask ? lastTask.order + GAP : GAP;

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status,
        order,
        agentId: data.agentId,
        source: "manual",
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[POST /api/tasks]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
