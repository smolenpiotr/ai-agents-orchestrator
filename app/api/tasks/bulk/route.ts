import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bulkHideSchema = z.object({
  agentId: z.string().min(1),
  status: z.enum(["BACKLOG", "IN_PROGRESS", "DONE"]),
});

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const data = bulkHideSchema.parse(body);

    // Soft-hide instead of hard delete — preserves history
    const result = await prisma.task.updateMany({
      where: {
        agentId: data.agentId,
        status: data.status,
        hidden: false,
      },
      data: { hidden: true },
    });

    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[DELETE /api/tasks/bulk]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
