"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "@/lib/api";
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
  const { data: filesData } = useSWR('/api/todos/files.php', fetcher);
  const { data: listsData } = useSWR('/api/todos/lists.php', fetcher);
  const { data: tasksData } = useSWR('/api/todos/tasks.php', fetcher);
  const { mutate } = useSWRConfig();
  
  const files = filesData?.files;
  const lists = listsData?.lists;
  const allTasks = tasksData?.tasks || [];

  const handleMove = async (newListId: string) => {
    // Get task and its subtasks
    const task = allTasks.find((t: any) => t.id === taskId);
    if (!task) return;
    
    const subtasks = allTasks.filter((t: any) => t.parentTaskId === taskId);
    
    // Update listId for task and subtasks
    const updates = subtasks.map((st: any) => ({ key: st.id, changes: { listId: newListId } }));
    updates.push({ key: taskId, changes: { listId: newListId } });
    
    await fetchApi('/api/todos/tasks.php', {
      method: 'POST',
      body: JSON.stringify({ bulk: true, updates })
    });
    
    mutate('/api/todos/tasks.php');
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
          {files.map((file: any) => {
            const fileLists = lists.filter((l: any) => l.fileId === file.id);
            if (fileLists.length === 0) return null;
            
            return (
              <div key={file.id} className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm font-medium text-ink-muted mb-1 px-2">
                  <Folder className="w-4 h-4" />
                  {file.name}
                </div>
                {fileLists.map((list: any) => (
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
