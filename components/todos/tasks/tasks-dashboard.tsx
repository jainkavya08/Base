"use client";

import useSWR, { useSWRConfig } from "swr";
import { fetcher, fetchApi } from "@/lib/api";
import { CheckCircle2, ChevronRight, Check } from "lucide-react";
import Link from "next/link";
import { TaskComposer } from "./task-composer";
import { TaskItem } from "./task-item";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Todo } from "@/lib/db";
import { useTaskActions } from "@/hooks/use-task-actions";

export function TasksDashboard({ fileId, listId }: { fileId: string; listId: string }) {
  const { mutate } = useSWRConfig();
  const { data: filesData, isLoading: filesLoading } = useSWR('/api/todos/files.php', fetcher);
  const { data: listsData } = useSWR('/api/todos/lists.php', fetcher);
  const { data: tasksData } = useSWR('/api/todos/tasks.php', fetcher);

  const file = filesData?.files?.find((f: any) => f.id === fileId);
  const list = listsData?.lists?.find((l: any) => l.id === listId);
  const allTasks = tasksData?.tasks || [];
  const tasks = allTasks.filter((t: any) => t.listId === listId);
  
  const [view, setView] = useState<"list" | "board" | "compact">("list");

  // Sync with default view from DB once loaded
  useEffect(() => {
    if (list?.defaultView) {
      setView(list.defaultView);
    }
  }, [list?.defaultView]);

  if (filesLoading || !file || !list) return null;

  const completed = tasks.filter((t: any) => !t.parentTaskId && t.completed).length;
  const topLevelTasks = tasks.filter((t: any) => !t.parentTaskId);

  const { handleToggle, handleStatusChange: baseHandleStatusChange } = useTaskActions();
  
  const handleStatusChange = (taskId: string, newStatus: string) => {
    baseHandleStatusChange(taskId, newStatus, listId);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center text-xs font-mono text-[#8A7F72] mb-1">
        <Link href="/todos" className="hover:text-[#1A1A1A] transition-colors">TODOS</Link>
        <ChevronRight className="w-3.5 h-3.5 mx-1" />
        <Link href={`/todos/view?fileId=${file.id}`} className="hover:text-[#1A1A1A] transition-colors uppercase">{file.name}</Link>
        <ChevronRight className="w-3.5 h-3.5 mx-1" />
        <span className="text-[#1A1A1A] font-semibold uppercase">{list.name}</span>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-serif text-3xl font-normal text-[#1A1A1A] tracking-tight">{list.name}</h2>
            <p className="text-[#8A7F72] font-mono text-xs mt-1">{topLevelTasks.length} tasks · {completed} completed</p>
          </div>
        </div>

        <TaskComposer listId={listId} currentTaskCount={tasks.length} />
        
        {/* View toggles */}
        <div className="flex gap-2 mb-2">
          <Button
            variant={view === "list" ? "cta" : "outline"}
            size="sm"
            className="text-xs font-mono uppercase"
            onClick={() => setView("list")}
          >
            List
          </Button>
          <Button
            variant={view === "board" ? "cta" : "outline"}
            size="sm"
            className="text-xs font-mono uppercase"
            onClick={() => setView("board")}
          >
            Board
          </Button>
          <Button
            variant={view === "compact" ? "cta" : "outline"}
            size="sm"
            className="text-xs font-mono uppercase"
            onClick={() => setView("compact")}
          >
            Compact
          </Button>
        </div>
      </div>

      {topLevelTasks.length === 0 ? (
        <div className="bg-[#FDFAF4] rounded-[6px] p-12 flex flex-col items-center text-center shadow-[4px_4px_0px_0px_#1A1A1A] border border-[#1A1A1A] mt-4">
          <div className="w-16 h-16 bg-[#F5F0E8] border border-[#1A1A1A] rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#8A7F72]" />
          </div>
          <h3 className="font-serif text-2xl text-[#1A1A1A] mb-1">No tasks yet</h3>
          <p className="text-[#8A7F72] text-sm mb-6">Add your first task above to get started.</p>
        </div>
      ) : (
        <div className="mt-4">
          {view === "list" && (
            <div className="flex flex-col gap-3">
              {topLevelTasks.map((task: any) => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  allTasks={tasks} 
                  onToggle={handleToggle} 
                  onStatusChange={handleStatusChange} 
                />
              ))}
            </div>
          )}

          {view === "board" && (
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-6 min-w-max">
                {[
                  { id: 'todo', title: 'To Do', bg: 'bg-[#FDFAF4]', badgeBg: 'bg-[#F5F0E8]' },
                  { id: 'in_progress', title: 'In Progress', bg: 'bg-[#FFE14D]/15', badgeBg: 'bg-[#FFE14D]' },
                  { id: 'on_hold', title: 'On Hold', bg: 'bg-[#FF4D00]/15', badgeBg: 'bg-[#FF4D00]' },
                  { id: 'completed', title: 'Completed', bg: 'bg-[#1A1A1A]/5', badgeBg: 'bg-[#1A1A1A]' }
                ].map(column => (
                  <div 
                    key={column.id}
                    className={`w-[320px] border border-[#1A1A1A] ${column.bg} rounded-[6px] shadow-[4px_4px_0px_0px_#1A1A1A] p-4 flex flex-col shrink-0`}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('ring-2', 'ring-[#FF4D00]'); }}
                    onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('ring-2', 'ring-[#FF4D00]'); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('ring-2', 'ring-[#FF4D00]');
                      const taskId = e.dataTransfer.getData('text/plain');
                      if (taskId) handleStatusChange(taskId, column.id);
                    }}
                  >
                    <h3 className="font-mono text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] mb-4 border-b border-[#1A1A1A]/15 pb-2 flex items-center justify-between">
                      {column.title}
                      <span className={`text-[11px] font-mono border border-[#1A1A1A] px-2 py-0.5 rounded-[3px] shadow-[1px_1px_0px_0px_#1A1A1A] ${
                        column.id === 'completed' ? 'bg-[#1A1A1A] text-white' :
                        column.id === 'on_hold' ? 'bg-[#FF4D00] text-white' :
                        column.id === 'in_progress' ? 'bg-[#FFE14D] text-[#1A1A1A]' : 'bg-[#FDFAF4] text-[#1A1A1A]'
                      }`}>
                        {topLevelTasks.filter((t: any) => (t.status || (t.completed ? 'completed' : 'todo')) === column.id).length}
                      </span>
                    </h3>
                    <div className="flex flex-col gap-3 min-h-[100px]">
                      {topLevelTasks
                        .filter((t: any) => (t.status || (t.completed ? 'completed' : 'todo')) === column.id)
                        .map((task: any) => (
                          <div 
                            key={task.id} 
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', task.id);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            className="cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition-transform"
                          >
                            <TaskItem 
                              task={task} 
                              allTasks={tasks} 
                              onToggle={handleToggle} 
                              onStatusChange={handleStatusChange} 
                            />
                          </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === "compact" && (
            <div className="bg-[#FDFAF4] border border-[#1A1A1A] rounded-[6px] shadow-[4px_4px_0px_0px_#1A1A1A] overflow-hidden">
              {topLevelTasks.map((task: any, index: number) => (
                <div 
                  key={task.id} 
                  className={`flex items-center gap-3 px-4 py-3 ${index !== topLevelTasks.length - 1 ? 'border-b border-[#1A1A1A]/15' : ''}`}
                >
                  <button
                    onClick={() => handleToggle(task.id, task.completed)}
                    className={`w-4 h-4 rounded-[2px] border border-[#1A1A1A] flex items-center justify-center transition-colors shrink-0 ${
                      task.completed 
                        ? 'bg-[#FFE14D] text-[#1A1A1A]' 
                        : 'border-[#1A1A1A] hover:bg-[#FFE14D]/30 bg-white'
                    }`}
                  >
                    {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                  <span className={`text-sm font-sans ${task.completed ? 'text-[#8A7F72] line-through' : 'text-[#1A1A1A]'}`}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
