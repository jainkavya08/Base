"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { getTodayProgress } from "@/lib/habits-logic";

export function TodayProgress() {
  const { data: habitsData, isLoading: habitsLoading } = useSWR('/api/habits/habits.php', fetcher);
  const { data: completionsData, isLoading: completionsLoading } = useSWR('/api/habits/completions.php', fetcher);

  const habits = habitsData?.habits;
  const completions = completionsData?.completions;

  if (habitsLoading || completionsLoading || !habits || !completions) return null;

  const { completed, total, percentage } = getTodayProgress(habits, completions);

  return (
    <div className="bg-surface-card rounded-[22px] p-5 shadow-sm border border-border/50 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-ink">Today's progress</h2>
        <span className="text-sm text-ink-muted">{completed} / {total} completed</span>
      </div>
      
      <div className="flex items-center gap-3 mt-1">
        <div className="flex-1 h-3 rounded-full bg-canvas overflow-hidden">
          <div 
            className="h-full bg-accent-yellow rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm font-medium text-ink min-w-[3ch]">{percentage}%</span>
      </div>
    </div>
  );
}
