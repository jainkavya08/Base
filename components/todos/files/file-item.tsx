"use client";

import { useState } from "react";
import { Folder } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { fetchApi } from "@/lib/api";
import type { TodoFile, TodoList, Todo } from "@/lib/db";
import { CardMenu } from "@/components/todos/card-menu";
import { Button } from "@/components/ui/button";

export function FileItem({ 
  file, 
  fileLists, 
  fileTasks 
}: { 
  file: TodoFile;
  fileLists: TodoList[];
  fileTasks: Todo[];
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(file.name);
  const [isDeleting, setIsDeleting] = useState(false);

  const { mutate } = useSWRConfig();

  const handleSave = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (editName.trim() && editName.trim() !== file.name) {
      await fetchApi('/api/todos/files.php', {
        method: 'PUT',
        body: JSON.stringify({
          id: file.id,
          name: editName.trim()
        })
      });
      mutate('/api/todos/files.php');
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    // Delete tasks, lists, and the file
    // Ideally this cascading happens in the backend or we send requests, but for safety we can just tell the backend to delete the file. The backend schema uses ON DELETE CASCADE for files -> todo_lists -> tasks. So just deleting the file is enough.
    await fetchApi('/api/todos/files.php', {
      method: 'DELETE',
      body: JSON.stringify({ id: file.id })
    });
    
    mutate('/api/todos/files.php');
    mutate('/api/todos/lists.php');
    mutate('/api/todos/tasks.php');
    
    setIsDeleting(false);
  };

  if (isDeleting) {
    return (
      <div className="bg-surface-card rounded-2xl p-6 shadow-sm border border-red-500/50 flex flex-col items-center justify-center text-center gap-3 h-full min-h-[160px]">
        <h4 className="text-sm font-medium text-ink">Delete {file.name}?</h4>
        <p className="text-xs text-ink-muted">
          This will delete {fileLists.length} lists and {fileTasks.length} tasks.
        </p>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setIsDeleting(false); }}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="bg-red-500 text-white">Delete</Button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="bg-surface-card rounded-2xl p-6 shadow-sm border border-accent-blue/50 flex flex-col gap-3 h-full min-h-[160px]">
        <div className="mb-4">
          <Folder className="w-8 h-8 text-accent-blue" />
        </div>
        <input
          value={editName}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setEditName(file.name);
              setIsEditing(false);
            }
          }}
          className="w-full bg-canvas text-ink placeholder:text-ink-muted focus:outline-none p-2 rounded-lg border border-border/50 text-sm"
          autoFocus
        />
        <div className="flex gap-2 justify-end mt-auto">
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setEditName(file.name); setIsEditing(false); }}>Cancel</Button>
          <Button size="sm" onClick={handleSave} className="bg-accent-blue text-surface-card">Save</Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => router.push(`/todos/view?fileId=${file.id}`)}
      className="bg-surface-card rounded-2xl p-6 shadow-sm border border-border/50 hover:border-accent-blue/50 transition-all group hover:shadow-md cursor-pointer relative h-full min-h-[160px] flex flex-col"
    >
      <div className="flex justify-between items-start mb-8">
        <Folder className="w-8 h-8 text-accent-blue group-hover:scale-110 transition-transform" />
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <CardMenu 
            onEdit={(e) => { e?.stopPropagation(); setIsEditing(true); }} 
            onDelete={(e) => {
              e?.stopPropagation();
              if (fileLists.length > 0 || fileTasks.length > 0) {
                setIsDeleting(true);
              } else {
                handleDelete();
              }
            }} 
          />
        </div>
      </div>
      <h3 className="text-lg font-medium text-ink mb-1">{file.name}</h3>
      <div className="flex flex-col gap-1 text-sm text-ink-muted mt-auto">
        <span>{fileLists.length} Lists</span>
        <span>{fileTasks.length} Tasks</span>
      </div>
    </div>
  );
}
