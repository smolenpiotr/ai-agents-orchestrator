"use client";

import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Pencil, Trash2, Bot } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TaskForm } from "./TaskForm";
import type { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  index: number;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, index, onUpdate, onDelete }: TaskCardProps) {
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleDelete() {
    setMenuOpen(false);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onDelete(task.id);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  }

  if (editing) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-sm">
        <TaskForm
          agentId={task.agentId}
          task={task}
          onSuccess={(updated) => {
            onUpdate(updated);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "bg-card border border-border rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing select-none",
            "hover:border-primary/30 transition-colors",
            snapshot.isDragging && "shadow-lg rotate-1 opacity-90 border-primary/50"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                {task.source === "openclaw_hook" && (
                  <Bot className="h-3 w-3 text-primary shrink-0" aria-label="Auto-logged by openclaw" />
                )}
                <p className="text-sm font-medium leading-snug">{task.title}</p>
              </div>
              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {task.description}
                </p>
              )}
            </div>

            <div className="relative shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-6 z-20 bg-popover border border-border rounded-md shadow-md py-1 min-w-[130px]">
                    <button
                      onClick={() => { setMenuOpen(false); setEditing(true); }}
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-destructive hover:bg-muted transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
          </p>
        </div>
      )}
    </Draggable>
  );
}
