"use client";

import { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
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
}

export function KanbanColumn({
  column,
  tasks,
  agentId,
  onTaskAdded,
  onTaskUpdated,
  onTaskDeleted,
}: KanbanColumnProps) {
  const [adding, setAdding] = useState(false);

  return (
    <div className={cn("flex flex-col rounded-xl border-2 min-h-[400px]", column.color)}>
      {/* Header */}
      <div className={cn("flex items-center justify-between px-3 py-2.5 rounded-t-lg", column.headerColor)}>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{column.label}</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10 font-mono">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Tasks */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 px-2 py-2 space-y-2 min-h-[60px] rounded-b-lg transition-colors",
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
