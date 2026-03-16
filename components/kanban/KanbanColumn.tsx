"use client";

import { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { TaskCard } from "./TaskCard";
import { TaskForm } from "./TaskForm";
import type { Task, TaskStatus } from "@/types/task";

interface ColumnConfig {
  id: TaskStatus;
  label: string;
  color: string;
  headerColor: string;
}

interface KanbanColumnProps {
  column: ColumnConfig;
  tasks: Task[];
  agentId: string;
  onTaskAdded: (task: Task) => void;
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
  onDoneCleared?: () => void;
}

export function KanbanColumn({
  column,
  tasks,
  agentId,
  onTaskAdded,
  onTaskUpdated,
  onTaskDeleted,
  onDoneCleared,
}: KanbanColumnProps) {
  const [adding, setAdding] = useState(false);
  const [clearing, setClearing] = useState(false);

  async function handleClearDone() {
    if (tasks.length === 0) return;
    setClearing(true);
    try {
      const res = await fetch("/api/tasks/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, status: "DONE" }),
      });
      if (!res.ok) throw new Error("Failed to clear tasks");
      const data = await res.json();
      onDoneCleared?.();
      toast.success(`Cleared ${data.deleted} done tasks`);
    } catch {
      toast.error("Failed to clear done tasks");
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className={cn("flex flex-col rounded-xl border-2 min-h-[300px] h-full max-h-[calc(100vh-220px)]", column.color)}>
      {/* Header */}
      <div className={cn("flex items-center justify-between px-3 py-2.5 rounded-t-lg shrink-0", column.headerColor)}>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{column.label}</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10 font-mono">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {column.id === "DONE" && tasks.length > 0 && (
            <button
              onClick={handleClearDone}
              disabled={clearing}
              title="Clear all done tasks"
              className="flex items-center gap-1 px-2 py-0.5 text-xs rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          )}
          <button
            onClick={() => setAdding(true)}
            className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-70 hover:opacity-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tasks */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 px-2 py-2 space-y-2 min-h-[60px] rounded-b-lg transition-colors overflow-y-auto",
              snapshot.isDraggingOver && "bg-primary/5"
            )}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onUpdate={onTaskUpdated}
                onDelete={onTaskDeleted}
              />
            ))}
            {provided.placeholder}

            {adding && (
              <div className="bg-card border border-border rounded-lg p-3">
                <TaskForm
                  agentId={agentId}
                  defaultStatus={column.id}
                  onSuccess={(task) => {
                    onTaskAdded(task);
                    setAdding(false);
                  }}
                  onCancel={() => setAdding(false)}
                />
              </div>
            )}
          </div>
        )}
      </Droppable>

      {/* Footer add button */}
      {!adding && (
        <button
          onClick={() => setAdding(true)}
          className="mx-2 mb-2 flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add task
        </button>
      )}
    </div>
  );
}
