"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { BarChart3 } from "lucide-react";

export default function TodosStatsPage() {
  const { data: filesData, isLoading: filesLoading } = useSWR('/api/todos/files.php', fetcher);
  const { data: listsData } = useSWR('/api/todos/lists.php', fetcher);
  const { data: tasksData, isLoading: tasksLoading } = useSWR('/api/todos/tasks.php', fetcher);

  const allTasks = tasksData?.tasks;
  const lists = listsData?.lists;
  const files = filesData?.files;

  if (filesLoading || tasksLoading || !allTasks || !lists || !files) return null;

  const topLevelTasks = allTasks.filter((t: any) => !t.parentTaskId);
  const subtasks = allTasks.filter((t: any) => t.parentTaskId);

  const totalTasks = topLevelTasks.length;
  const completedTasks = topLevelTasks.filter((t: any) => t.completed).length;
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter((t: any) => t.completed).length;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-medium text-ink mb-4">Stats & Progress</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-card rounded-2xl p-6 shadow-sm border border-border/50">
          <div className="text-sm text-ink-muted mb-2">Total Tasks</div>
          <div className="text-4xl font-medium text-ink">{totalTasks}</div>
        </div>
        <div className="bg-surface-card rounded-2xl p-6 shadow-sm border border-border/50">
          <div className="text-sm text-ink-muted mb-2">Completed Tasks</div>
          <div className="text-4xl font-medium text-ink">{completedTasks}</div>
        </div>
        <div className="bg-surface-card rounded-2xl p-6 shadow-sm border border-border/50">
          <div className="text-sm text-ink-muted mb-2">Completion Rate</div>
          <div className="text-4xl font-medium text-ink">{completionRate}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        <div className="bg-surface-card rounded-2xl p-6 shadow-sm border border-border/50">
          <div className="text-sm text-ink-muted mb-2">Total Subtasks</div>
          <div className="text-3xl font-medium text-ink">{totalSubtasks}</div>
        </div>
        <div className="bg-surface-card rounded-2xl p-6 shadow-sm border border-border/50">
          <div className="text-sm text-ink-muted mb-2">Completed Subtasks</div>
          <div className="text-3xl font-medium text-ink">{completedSubtasks}</div>
        </div>
      </div>

      <div className="bg-surface-card rounded-[32px] p-12 flex flex-col items-center text-center shadow-sm border border-border/50 mt-4">
        <div className="w-16 h-16 bg-canvas rounded-full flex items-center justify-center mb-4">
          <BarChart3 className="w-8 h-8 text-ink-muted" />
        </div>
        <h3 className="text-lg font-medium text-ink mb-2">Detailed Analytics Coming Soon</h3>
        <p className="text-ink-muted">Soon you'll be able to filter performance by specific files and lists.</p>
      </div>
    </div>
  );
}
