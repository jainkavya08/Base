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
      <div className="flex items-center gap-2 mb-2">
        <span className="badge-sendlinks">METRICS</span>
        <h2 className="font-mono text-xs uppercase tracking-wider font-semibold text-[#1A1A1A]">Performance & Velocity</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FDFAF4] rounded-[6px] p-6 shadow-[4px_4px_0px_0px_#1A1A1A] border border-[#1A1A1A]">
          <div className="text-xs font-mono text-[#8A7F72] uppercase tracking-wider mb-2">Total Tasks</div>
          <div className="font-mono text-4xl font-bold text-[#1A1A1A]">{totalTasks}</div>
        </div>
        <div className="bg-[#FDFAF4] rounded-[6px] p-6 shadow-[4px_4px_0px_0px_#1A1A1A] border border-[#1A1A1A]">
          <div className="text-xs font-mono text-[#8A7F72] uppercase tracking-wider mb-2">Completed Tasks</div>
          <div className="font-mono text-4xl font-bold text-[#1A1A1A]">{completedTasks}</div>
        </div>
        <div className="bg-[#FDFAF4] rounded-[6px] p-6 shadow-[4px_4px_0px_0px_#1A1A1A] border border-[#1A1A1A]">
          <div className="text-xs font-mono text-[#8A7F72] uppercase tracking-wider mb-2">Completion Rate</div>
          <div className="font-mono text-4xl font-bold text-[#1A1A1A]">{completionRate}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#FDFAF4] rounded-[6px] p-6 shadow-[4px_4px_0px_0px_#1A1A1A] border border-[#1A1A1A]">
          <div className="text-xs font-mono text-[#8A7F72] uppercase tracking-wider mb-2">Total Subtasks</div>
          <div className="font-mono text-3xl font-bold text-[#1A1A1A]">{totalSubtasks}</div>
        </div>
        <div className="bg-[#FDFAF4] rounded-[6px] p-6 shadow-[4px_4px_0px_0px_#1A1A1A] border border-[#1A1A1A]">
          <div className="text-xs font-mono text-[#8A7F72] uppercase tracking-wider mb-2">Completed Subtasks</div>
          <div className="font-mono text-3xl font-bold text-[#1A1A1A]">{completedSubtasks}</div>
        </div>
      </div>

      <div className="bg-[#FDFAF4] rounded-[6px] p-6 sm:p-8 shadow-[4px_4px_0px_0px_#1A1A1A] border border-[#1A1A1A]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FFE14D] border border-[#1A1A1A] rounded-[4px] shadow-[2px_2px_0px_0px_#1A1A1A] flex items-center justify-center">
              <Target className="w-6 h-6 text-[#1A1A1A]" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-normal text-[#1A1A1A]">Daily Goal</h3>
              <p className="text-sm font-sans text-[#8A7F72]">Set a target number of tasks to complete each day</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-[#F5F0E8] rounded-[4px] p-1.5 border border-[#1A1A1A]">
              <button 
                onClick={() => updateGoal(dailyGoal - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-[3px] bg-white border border-[#1A1A1A] hover:bg-[#FFE14D] transition-colors text-[#1A1A1A] cursor-pointer shadow-[1px_1px_0px_0px_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5"
                aria-label="Decrease daily goal"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-mono font-bold text-lg text-[#1A1A1A]">{dailyGoal}</span>
              <button 
                onClick={() => updateGoal(dailyGoal + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-[3px] bg-white border border-[#1A1A1A] hover:bg-[#FFE14D] transition-colors text-[#1A1A1A] cursor-pointer shadow-[1px_1px_0px_0px_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5"
                aria-label="Increase daily goal"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-[#1A1A1A]/10">
          <div className="flex justify-between text-xs font-mono mb-2">
            <span className="text-[#8A7F72] uppercase tracking-wider">Today&apos;s Progress</span>
            <span className="font-bold text-[#1A1A1A]">{completedTasks} / {dailyGoal} TASKS ({goalProgress}%)</span>
          </div>
          <div className="w-full h-4 bg-[#F5F0E8] rounded-[3px] overflow-hidden border border-[#1A1A1A]">
            <div 
              className="h-full bg-[#FF4D00] transition-all duration-500 ease-out" 
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
