"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { ListTodo, ChevronRight } from "lucide-react";
import Link from "next/link";
import { AddListDialog } from "./add-list-dialog";
import { ListItem } from "./list-item";

export function ListsDashboard({ fileId }: { fileId: string }) {
  const { data: filesData, isLoading: filesLoading } = useSWR('/api/todos/files.php', fetcher);
  const { data: listsData } = useSWR('/api/todos/lists.php', fetcher);
  const { data: tasksData } = useSWR('/api/todos/tasks.php', fetcher);

  if (filesLoading) return <div className="text-center p-8 text-ink-muted">Loading...</div>;

  const file = filesData?.files?.find((f: any) => f.id === fileId);
  const lists = listsData?.lists?.filter((l: any) => l.fileId === fileId) || [];
  const tasks = tasksData?.tasks || [];

  if (!file) return null;

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
          {lists.map((list: any) => {
            const listTasks = tasks?.filter((t: any) => t.listId === list.id) || [];
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
