import { prisma } from "./prisma";

export async function seedMainAgent(): Promise<string> {
  const existing = await prisma.agent.findFirst({ where: { isMain: true } });
  if (existing) return existing.id;

  const agent = await prisma.agent.create({
    data: {
      name: "Main Agent",
      description: "Your primary openclaw.ai agent",
      openclawAgentId: "main",
      model: "openclaw:main",
      color: "#6366f1",
      isMain: true,
    },
  });

  return agent.id;
}
