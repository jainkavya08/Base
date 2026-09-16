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

  const handleToggle = async (taskId: string, currentStatus: boolean, isParent?: boolean, subtasks?: Todo[], parentTask?: Todo) => {
    const newStatus = !currentStatus;
    const now = new Date().toISOString();

    if (isParent && subtasks) {
      // Toggle parent and all its subtasks
      const promises = subtasks.map(st => 
        fetchApi('/api/todos/tasks.php', { method: 'PUT', body: JSON.stringify({ action: 'toggle', id: st.id, completed: newStatus }) })
      );
      promises.push(
        fetchApi('/api/todos/tasks.php', { method: 'PUT', body: JSON.stringify({ action: 'toggle', id: taskId, completed: newStatus }) })
      );
      await Promise.all(promises);
    } else if (!isParent && parentTask && subtasks) {
      // Toggle subtask
      await fetchApi('/api/todos/tasks.php', { method: 'PUT', body: JSON.stringify({ action: 'toggle', id: taskId, completed: newStatus }) });
      
      // Check if parent should be completed/uncompleted
      const otherSubtasks = subtasks.filter(t => t.id !== taskId);
      const allOthersCompleted = otherSubtasks.every(t => t.completed);
      
      if (newStatus && allOthersCompleted) {
        await fetchApi('/api/todos/tasks.php', { method: 'PUT', body: JSON.stringify({ action: 'toggle', id: parentTask.id, completed: true }) });
      } else if (!newStatus && parentTask.completed) {
        await fetchApi('/api/todos/tasks.php', { method: 'PUT', body: JSON.stringify({ action: 'toggle', id: parentTask.id, completed: false }) });
      }
    } else {
      // Standard toggle
      await fetchApi('/api/todos/tasks.php', { method: 'PUT', body: JSON.stringify({ action: 'toggle', id: taskId, completed: newStatus }) });
    }
    mutate('/api/todos/tasks.php');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center text-sm text-ink-muted mb-2">
        <Link href="/todos" className="hover:text-ink transition-colors">Todos</Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <Link href={`/todos/view?fileId=${file.id}`} className="hover:text-ink transition-colors">{file.name}</Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <span className="text-ink font-medium">{list.name}</span>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-medium text-ink">{list.name}</h2>
            <p className="text-ink-muted mt-1">{topLevelTasks.length} tasks · {completed} completed</p>
          </div>
        </div>

        <TaskComposer listId={listId} />
        
        {/* View toggles */}
        <div className="flex gap-2 mb-2">
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            className={view === "list" ? "bg-accent-blue text-white" : "border-border text-ink hover:bg-canvas bg-transparent"}
            onClick={() => setView("list")}
          >
            List
          </Button>
          <Button
            variant={view === "board" ? "default" : "outline"}
            size="sm"
            className={view === "board" ? "bg-accent-blue text-white" : "border-border text-ink hover:bg-canvas bg-transparent"}
            onClick={() => setView("board")}
          >
            Board
          </Button>
          <Button
            variant={view === "compact" ? "default" : "outline"}
            size="sm"
            className={view === "compact" ? "bg-accent-blue text-white" : "border-border text-ink hover:bg-canvas bg-transparent"}
            onClick={() => setView("compact")}
          >
            Compact
          </Button>
        </div>
      </div>

      {topLevelTasks.length === 0 ? (
        <div className="bg-surface-card rounded-[32px] p-12 flex flex-col items-center text-center shadow-sm border border-border/50 mt-4">
          <div className="w-16 h-16 bg-canvas rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-ink-muted" />
          </div>
          <h3 className="text-lg font-medium text-ink mb-2">No tasks yet</h3>
          <p className="text-ink-muted mb-6">Add your first task to get started.</p>
        </div>
      ) : (
        <div className="mt-4">
          {view === "list" && (
            <div className="flex flex-col gap-3">
              {topLevelTasks.map((task: any) => (
                <TaskItem key={task.id} task={task} allTasks={tasks} onToggle={handleToggle} />
              ))}
            </div>
          )}

          {view === "board" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-canvas border border-border/50 rounded-2xl p-4">
                <h3 className="font-medium text-ink mb-4 border-b border-border pb-2">To Do</h3>
                <div className="flex flex-col gap-3">
                  {topLevelTasks.filter((t: any) => !t.completed).map((task: any) => (
                    <TaskItem key={task.id} task={task} allTasks={tasks} onToggle={handleToggle} />
                  ))}
                </div>
              </div>
              <div className="bg-canvas border border-border/50 rounded-2xl p-4">
                <h3 className="font-medium text-ink mb-4 border-b border-border pb-2">Completed</h3>
                <div className="flex flex-col gap-3">
                  {topLevelTasks.filter((t: any) => t.completed).map((task: any) => (
                    <TaskItem key={task.id} task={task} allTasks={tasks} onToggle={handleToggle} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === "compact" && (
            <div className="bg-surface-card border border-border/50 rounded-2xl overflow-hidden">
              {topLevelTasks.map((task: any, index: number) => (
                <div 
                  key={task.id} 
                  className={`flex items-center gap-3 px-4 py-3 ${index !== topLevelTasks.length - 1 ? 'border-b border-border/50' : ''}`}
                >
                  <button
                    onClick={() => handleToggle(task.id, task.completed)}
                    className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors shrink-0 ${
                      task.completed 
                        ? 'bg-accent-blue border-accent-blue text-white' 
                        : 'border-border/80 hover:border-accent-blue bg-transparent'
                    }`}
                  >
                    {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                  <span className={`text-sm ${task.completed ? 'text-ink-muted line-through' : 'text-ink'}`}>
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
