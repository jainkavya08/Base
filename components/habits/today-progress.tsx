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

  if (total === 0) return null;

  return (
    <div className="bg-surface-card rounded-2xl p-6 shadow-sm border border-transparent flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-90 absolute top-0 left-0" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="var(--color-canvas)" strokeWidth="8" fill="transparent" />
          <circle 
            cx="50" 
            cy="50" 
            r="40" 
            stroke="var(--color-accent-blue)" 
            strokeWidth="8" 
            fill="transparent" 
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 40}
            strokeDashoffset={(2 * Math.PI * 40) * (1 - percentage / 100)}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="text-center flex flex-col items-center">
          <span className="text-xl font-medium text-ink leading-tight">{percentage}%</span>
        </div>
      </div>
      
      <div className="flex flex-col justify-center">
        <h2 className="text-2xl font-medium text-ink">Today's Progress</h2>
        <p className="text-ink-muted mt-1 text-sm">
          You have completed <span className="text-ink font-medium">{completed}</span> out of <span className="text-ink font-medium">{total}</span> scheduled habits today.
        </p>
        
        {percentage === 100 && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-accent-blue/20 text-accent-blue text-xs font-medium rounded-full w-fit">
            <span>🌟</span> All habits completed!
          </div>
        )}
      </div>
    </div>
  );
}
