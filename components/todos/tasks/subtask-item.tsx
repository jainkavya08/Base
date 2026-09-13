"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import type { Todo } from "@/lib/db";
import { TaskMenu } from "./task-menu";
import { Button } from "@/components/ui/button";

export function SubtaskItem({ 
  subtask, 
  allSubtasks,
  parentTask,
  onToggle 
}: { 
  subtask: Todo;
  allSubtasks: Todo[];
  parentTask: Todo;
  onToggle: (taskId: string, currentStatus: boolean, isParent?: boolean, subtasks?: Todo[], parent?: Todo) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(subtask.title);

  const handleSave = async () => {
    if (editTitle.trim() && editTitle.trim() !== subtask.title) {
      await db.todos.update(subtask.id, { 
        title: editTitle.trim(),
        updatedAt: new Date().toISOString()
      });
    }
    setIsEditing(false);
  };

  const handleDuplicate = async () => {
    const now = new Date().toISOString();
    await db.todos.add({
      ...subtask,
      id: crypto.randomUUID(),
      title: `${subtask.title} (Copy)`,
      completed: false,
      createdAt: now,
      updatedAt: now,
    });
  };

  const handleDelete = async () => {
    await db.todos.delete(subtask.id);
  };

  return (
    <div className="flex items-start gap-3 group">
      <input
        type="checkbox"
        checked={subtask.completed}
        onChange={() => onToggle(subtask.id, subtask.completed, false, allSubtasks, parentTask)}
        className="w-4 h-4 accent-accent-blue rounded cursor-pointer mt-1"
      />
      
      {isEditing ? (
        <div className="flex-1 flex flex-col gap-2 bg-canvas p-2 rounded-lg border border-border/50">
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") {
                setEditTitle(subtask.title);
                setIsEditing(false);
              }
            }}
            className="w-full bg-transparent text-ink placeholder:text-ink-muted focus:outline-none text-sm"
            autoFocus
          />
          <div className="flex gap-2 justify-end mt-1">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setEditTitle(subtask.title);
                setIsEditing(false);
              }}
              className="h-6 text-[10px] px-2"
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={handleSave}
              className="h-6 text-[10px] px-2 bg-accent-blue text-surface-card"
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <>
          <span className={`text-base flex-1 ${subtask.completed ? 'text-ink-muted line-through' : 'text-ink'}`}>
            {subtask.title}
          </span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <TaskMenu 
              isSubtask 
              onEdit={() => setIsEditing(true)} 
              onDuplicate={handleDuplicate} 
              onDelete={handleDelete} 
            />
          </div>
        </>
      )}
    </div>
  );
}
