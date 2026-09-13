"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { Folder } from "lucide-react";

export function MoveTaskDialog({
  isOpen,
  onClose,
  taskId,
  currentListId,
}: {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  currentListId: string;
}) {
  const files = useLiveQuery(() => db.todoFiles.toArray());
  const lists = useLiveQuery(() => db.todoLists.toArray());

  const handleMove = async (newListId: string) => {
    const now = new Date().toISOString();
    
    // Get task and its subtasks
    const task = await db.todos.get(taskId);
    if (!task) return;
    
    const subtasks = await db.todos.where("parentTaskId").equals(taskId).toArray();
    
    // Update listId for task and subtasks
    const updates = subtasks.map(st => ({ key: st.id, changes: { listId: newListId, updatedAt: now } }));
    updates.push({ key: taskId, changes: { listId: newListId, updatedAt: now } });
    
    await db.todos.bulkUpdate(updates);
    onClose();
  };

  if (!files || !lists) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-surface-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-ink">Move Task</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4 max-h-[60vh] overflow-y-auto">
          {files.map(file => {
            const fileLists = lists.filter(l => l.fileId === file.id);
            if (fileLists.length === 0) return null;
            
            return (
              <div key={file.id} className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm font-medium text-ink-muted mb-1 px-2">
                  <Folder className="w-4 h-4" />
                  {file.name}
                </div>
                {fileLists.map(list => (
                  <button
                    key={list.id}
                    onClick={() => handleMove(list.id)}
                    disabled={list.id === currentListId}
                    className={`text-left px-4 py-2 rounded-lg transition-colors text-sm ${
                      list.id === currentListId 
                        ? 'bg-canvas text-ink-muted cursor-not-allowed opacity-50' 
                        : 'text-ink hover:bg-canvas hover:text-accent-blue'
                    }`}
                  >
                    {list.name}
                    {list.id === currentListId && " (Current)"}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
