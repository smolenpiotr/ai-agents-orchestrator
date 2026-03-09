import type { Task as PrismaTask, TaskStatus } from "@prisma/client";

export type Task = PrismaTask;
export type { TaskStatus };

export type KanbanData = Record<TaskStatus, Task[]>;

export type CreateTaskInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
  agentId: string;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  order?: number;
};
