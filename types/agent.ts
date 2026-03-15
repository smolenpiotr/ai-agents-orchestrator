import type { Agent as PrismaAgent } from "@prisma/client";

export type Agent = PrismaAgent;

export type AgentWithStats = Agent & {
  _count: { tasks: number };
  taskStats: {
    BACKLOG: number;
    IN_PROGRESS: number;
    DONE: number;
  };
};

export type CreateAgentInput = {
  name: string;
  description?: string;
  openclawAgentId?: string;
  model?: string;
  color?: string;
  isPersistent?: boolean;
  avatarUrl?: string;
};
