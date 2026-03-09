import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { TaskStatus } from "@prisma/client";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const tasks = await prisma.task.findMany({
      where: { agentId: id },
      orderBy: [{ status: "asc" }, { order: "asc" }],
    });

    const grouped: Record<TaskStatus, typeof tasks> = {
      BACKLOG: [],
      IN_PROGRESS: [],
      DONE: [],
    };

    for (const task of tasks) {
      grouped[task.status].push(task);
    }

    return NextResponse.json(grouped);
  } catch (error) {
    console.error("[GET /api/agents/:id/tasks]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
