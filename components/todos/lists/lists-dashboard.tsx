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
      <div className="flex items-center text-xs font-mono text-[#8A7F72] mb-1">
        <Link href="/todos" className="hover:text-[#1A1A1A] transition-colors">TODOS</Link>
        <ChevronRight className="w-3.5 h-3.5 mx-1" />
        <span className="text-[#1A1A1A] font-semibold uppercase">{file.name}</span>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-serif text-3xl font-normal text-[#1A1A1A] tracking-tight">Lists in {file.name}</h2>
          <p className="text-xs font-mono text-[#8A7F72] mt-0.5">{lists.length} task list{lists.length === 1 ? '' : 's'}</p>
        </div>
        <AddListDialog fileId={fileId} />
      </div>

      {lists.length === 0 ? (
        <div className="bg-[#FDFAF4] rounded-[6px] p-12 flex flex-col items-center text-center shadow-[4px_4px_0px_0px_#1A1A1A] border border-[#1A1A1A]">
          <div className="w-16 h-16 bg-[#F5F0E8] border border-[#1A1A1A] rounded-full flex items-center justify-center mb-4">
            <ListTodo className="w-8 h-8 text-[#8A7F72]" />
          </div>
          <h3 className="font-serif text-2xl text-[#1A1A1A] mb-1">No Todo Lists yet</h3>
          <p className="text-[#8A7F72] text-sm mb-6">Create your first Todo List to start organizing tasks.</p>
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
