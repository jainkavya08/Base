"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Folder } from "lucide-react";
import { AddFileDialog } from "./add-file-dialog";
import { FileItem } from "./file-item";

export function FilesDashboard() {
  const files = useLiveQuery(() => db.todoFiles.toArray());
  const lists = useLiveQuery(() => db.todoLists.toArray());
  const tasks = useLiveQuery(() => db.todos.toArray());

  if (!files) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-medium text-ink">Files</h2>
        <AddFileDialog />
      </div>

      {files.length === 0 ? (
        <div className="bg-surface-card rounded-[32px] p-12 flex flex-col items-center text-center shadow-sm border border-border/50">
          <div className="w-16 h-16 bg-canvas rounded-full flex items-center justify-center mb-4">
            <Folder className="w-8 h-8 text-ink-muted" />
          </div>
          <h3 className="text-lg font-medium text-ink mb-2">No files yet</h3>
          <p className="text-ink-muted mb-6">Create a file to start organizing your lists.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file) => {
            const fileLists = lists?.filter(l => l.fileId === file.id) || [];
            const listIds = fileLists.map(l => l.id);
            const fileTasks = tasks?.filter(t => listIds.includes(t.listId)) || [];
            
            return (
              <FileItem 
                key={file.id} 
                file={file} 
                fileLists={fileLists} 
                fileTasks={fileTasks} 
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
