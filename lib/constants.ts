import type { TaskStatus } from "@prisma/client";

export const COLUMNS: {
  id: TaskStatus;
  label: string;
  color: string;
  headerColor: string;
}[] = [
  {
    id: "BACKLOG",
    label: "Backlog",
    color: "border-slate-300 dark:border-slate-600",
    headerColor: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  },
  {
    id: "IN_PROGRESS",
    label: "In Progress",
    color: "border-amber-400 dark:border-amber-600",
    headerColor: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
  },
  {
    id: "DONE",
    label: "Done",
    color: "border-green-400 dark:border-green-600",
    headerColor: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400",
  },
];

export const AGENT_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#a855f7", // purple
];

export const GAP = 1000; // spacing between task orders
