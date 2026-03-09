import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { GAP } from "@/lib/constants";
import { truncate } from "@/lib/utils";

const actionSchema = z.object({
  agentId: z.string(),
  action: z.string(),
  timestamp: z.string().optional(),
  secret: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { agentId, action, secret } = actionSchema.parse(body);

    // Validate webhook secret if configured
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret && secret !== webhookSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the agent by openclawAgentId
    const agent = await prisma.agent.findFirst({
      where: { openclawAgentId: agentId },
    });

    if (!agent) {
      // Fallback to main agent
      const mainAgent = await prisma.agent.findFirst({ where: { isMain: true } });
      if (!mainAgent) {
        return NextResponse.json({ error: "No agent found" }, { status: 404 });
      }

      await createTask(mainAgent.id, action);
    } else {
      await createTask(agent.id, action);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[POST /api/webhooks/action]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function createTask(agentId: string, action: string) {
  const lastTask = await prisma.task.findFirst({
    where: { agentId, status: "IN_PROGRESS" },
    orderBy: { order: "desc" },
  });
  const order = lastTask ? lastTask.order + GAP : GAP;

  await prisma.task.create({
    data: {
      title: truncate(action, 80),
      description: action.length > 80 ? action : undefined,
      status: "IN_PROGRESS",
      order,
      agentId,
      source: "openclaw_hook",
    },
  });
}
