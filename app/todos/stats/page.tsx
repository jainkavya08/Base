"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { BarChart3, Target, Plus, Minus } from "lucide-react";

export default function TodosStatsPage() {
  const { data: filesData, isLoading: filesLoading } = useSWR('/api/todos/files.php', fetcher);
  const { data: listsData } = useSWR('/api/todos/lists.php', fetcher);
  const { data: tasksData, isLoading: tasksLoading } = useSWR('/api/todos/tasks.php', fetcher);

  const [dailyGoal, setDailyGoal] = useState<number>(5);

  useEffect(() => {
    const savedGoal = localStorage.getItem("todosDailyGoal");
    if (savedGoal) {
      setDailyGoal(parseInt(savedGoal, 10));
    }
  }, []);

  const updateGoal = (newGoal: number) => {
    if (newGoal < 1) return;
    setDailyGoal(newGoal);
    localStorage.setItem("todosDailyGoal", newGoal.toString());
  };

  const allTasks = tasksData?.tasks;
  const lists = listsData?.lists;
  const files = filesData?.files;

  if (filesLoading || tasksLoading || !allTasks || !lists || !files) return null;

  const topLevelTasks = allTasks.filter((t: any) => !t.parentTaskId);
  const subtasks = allTasks.filter((t: any) => t.parentTaskId);

  const totalTasks = topLevelTasks.length;
  // Use completed tasks as a proxy for today's progress for now
  const completedTasks = topLevelTasks.filter((t: any) => t.completed).length;
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter((t: any) => t.completed).length;

  const goalProgress = Math.min(Math.round((completedTasks / dailyGoal) * 100), 100);

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

      <div className="bg-surface-card rounded-2xl p-8 shadow-sm border border-border/50 mt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-ink">Daily Goal</h3>
              <p className="text-sm text-ink-muted">Set a goal for tasks to complete each day</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-canvas rounded-lg p-1 border border-border/50">
              <button 
                onClick={() => updateGoal(dailyGoal - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-dark/10 transition-colors text-ink-muted hover:text-ink cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-medium text-ink">{dailyGoal}</span>
              <button 
                onClick={() => updateGoal(dailyGoal + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-dark/10 transition-colors text-ink-muted hover:text-ink cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-ink-muted">Progress</span>
            <span className="font-medium text-ink">{completedTasks} / {dailyGoal} Tasks</span>
          </div>
          <div className="w-full h-3 bg-canvas rounded-full overflow-hidden border border-border/50">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out" 
              style={{ width: \`\${goalProgress}%\` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
