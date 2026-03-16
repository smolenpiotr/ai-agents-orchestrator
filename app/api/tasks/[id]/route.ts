import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(["BACKLOG", "IN_PROGRESS", "DONE"]).optional(),
  order: z.number().optional(),
});

const STATUS_LABELS: Record<string, string> = {
  BACKLOG: "Backlog",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    // Get previous task state for status change detection
    const prevTask = data.status
      ? await prisma.task.findUnique({ where: { id } })
      : null;

    const task = await prisma.task.update({
      where: { id },
      data,
    });

    // Auto-create log entry when status changes
    if (data.status && prevTask && prevTask.status !== data.status) {
      try {
        await prisma.agentLog.create({
          data: {
            agentId: task.agentId,
            type: "task_status",
            title: `Task moved to ${STATUS_LABELS[data.status] ?? data.status}`,
            detail: `"${task.title}" → ${STATUS_LABELS[data.status] ?? data.status}`,
          },
        });
      } catch (logErr) {
        // Don't fail the task update if logging fails
        console.error("[task status log]", logErr);
      }
    }

    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[PATCH /api/tasks/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/tasks/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
