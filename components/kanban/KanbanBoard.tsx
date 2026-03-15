"use client";

import { useState, useCallback, useEffect } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { COLUMNS, GAP } from "@/lib/constants";
import { KanbanColumn } from "./KanbanColumn";
import type { Task, TaskStatus, KanbanData } from "@/types/task";

interface KanbanBoardProps {
  agentId: string;
  initialTasks: KanbanData;
}

function calculateOrder(tasks: Task[], destinationIndex: number): number {
  if (tasks.length === 0) return GAP;
  if (destinationIndex === 0) return tasks[0].order - GAP;
  if (destinationIndex >= tasks.length) return tasks[tasks.length - 1].order + GAP;

  const before = tasks[destinationIndex - 1].order;
  const after = tasks[destinationIndex].order;
  const mid = Math.floor((before + after) / 2);
  return mid === before ? before + 1 : mid;
}

async function fetchTasks(agentId: string): Promise<KanbanData> {
  const res = await fetch(`/api/agents/${agentId}/tasks`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export function KanbanBoard({ agentId, initialTasks }: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanData>(initialTasks);
  const queryClient = useQueryClient();

  const { data: tasks } = useQuery({
    queryKey: ["tasks", agentId],
    queryFn: () => fetchTasks(agentId),
    refetchInterval: 30000,
    initialData: initialTasks,
  });

  // Sync remote data into local state (only when not dragging)
  useEffect(() => {
    if (tasks) {
      setColumns(tasks);
    }
  }, [tasks]);

  const handleTaskAdded = useCallback((task: Task) => {
    setColumns((prev) => ({
      ...prev,
      [task.status]: [...prev[task.status as TaskStatus], task],
    }));
    queryClient.invalidateQueries({ queryKey: ["tasks", agentId] });
  }, [agentId, queryClient]);

  const handleTaskUpdated = useCallback((task: Task) => {
    setColumns((prev) => {
      const updated: KanbanData = { ...prev };
      for (const status of Object.keys(updated) as TaskStatus[]) {
        updated[status] = updated[status].map((t) => (t.id === task.id ? task : t));
      }
      return updated;
    });
  }, []);

  const handleTaskDeleted = useCallback((taskId: string) => {
    setColumns((prev) => {
      const updated: KanbanData = { ...prev };
      for (const status of Object.keys(updated) as TaskStatus[]) {
        updated[status] = updated[status].filter((t) => t.id !== taskId);
      }
      return updated;
    });
  }, []);

  const handleDoneCleared = useCallback(() => {
    setColumns((prev) => ({ ...prev, DONE: [] }));
    queryClient.invalidateQueries({ queryKey: ["tasks", agentId] });
  }, [agentId, queryClient]);

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { source, destination, draggableId } = result;
      if (!destination) return;
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) return;

      const srcStatus = source.droppableId as TaskStatus;
      const dstStatus = destination.droppableId as TaskStatus;

      const srcTasks = [...columns[srcStatus]];
      const [movedTask] = srcTasks.splice(source.index, 1);

      // Optimistic update
      const prevColumns = columns;
      const dstTasks = srcStatus === dstStatus ? srcTasks : [...columns[dstStatus]];
      dstTasks.splice(destination.index, 0, {
        ...movedTask,
        status: dstStatus,
      });

      const newOrder = calculateOrder(
        dstTasks.filter((t) => t.id !== movedTask.id),
        destination.index
      );

      const updatedTask = { ...movedTask, status: dstStatus, order: newOrder };
      dstTasks[destination.index] = updatedTask;

      if (srcStatus === dstStatus) {
        setColumns((prev) => ({ ...prev, [srcStatus]: dstTasks }));
      } else {
        setColumns((prev) => ({
          ...prev,
          [srcStatus]: srcTasks,
          [dstStatus]: dstTasks,
        }));
      }

      // Persist
      try {
        const res = await fetch(`/api/tasks/${draggableId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: dstStatus, order: newOrder }),
        });
        if (!res.ok) throw new Error("Failed to update task");
      } catch {
        // Rollback
        setColumns(prevColumns);
        toast.error("Failed to move task. Please try again.");
      }
    },
    [columns]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 h-full">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={columns[col.id]}
            agentId={agentId}
            onTaskAdded={handleTaskAdded}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
            onDoneCleared={col.id === "DONE" ? handleDoneCleared : undefined}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
