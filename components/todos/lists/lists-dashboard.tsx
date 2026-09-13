"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { ListTodo, ChevronRight } from "lucide-react";
import Link from "next/link";
import { AddListDialog } from "./add-list-dialog";
import { ListItem } from "./list-item";

export function ListsDashboard({ fileId }: { fileId: string }) {
  const file = useLiveQuery(() => db.todoFiles.get(fileId), [fileId]);
  const lists = useLiveQuery(() => db.todoLists.where("fileId").equals(fileId).toArray(), [fileId]);
  const tasks = useLiveQuery(() => db.todos.toArray()); // In a real app we'd query more specifically, but Dexie can be tricky with IN queries

  if (!file || !lists) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center text-sm text-ink-muted mb-2">
        <Link href="/todos" className="hover:text-ink transition-colors">Todos</Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <span className="text-ink font-medium">{file.name}</span>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-ink">Lists in {file.name}</h2>
        <AddListDialog fileId={fileId} />
      </div>

      {lists.length === 0 ? (
        <div className="bg-surface-card rounded-[32px] p-12 flex flex-col items-center text-center shadow-sm border border-border/50">
          <div className="w-16 h-16 bg-canvas rounded-full flex items-center justify-center mb-4">
            <ListTodo className="w-8 h-8 text-ink-muted" />
          </div>
          <h3 className="text-lg font-medium text-ink mb-2">No Todo Lists yet</h3>
          <p className="text-ink-muted mb-6">Create your first Todo List to start organizing tasks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lists.map((list) => {
            const listTasks = tasks?.filter(t => t.listId === list.id) || [];
            return (
              <ListItem 
                key={list.id} 
                list={list} 
                fileId={fileId} 
                listTasks={listTasks} 
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
