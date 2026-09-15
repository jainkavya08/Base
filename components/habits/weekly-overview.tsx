"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { getHabitStatusForDate } from "@/lib/habits-logic";
import { format, startOfWeek, addDays, isSameDay, isFuture } from "date-fns";
import { cn } from "@/lib/utils";

export function WeeklyOverview() {
  const { data: habitsData, isLoading: habitsLoading } = useSWR('/api/habits/habits.php', fetcher);
  const { data: completionsData, isLoading: completionsLoading } = useSWR('/api/habits/completions.php', fetcher);

  const habits = habitsData?.habits;
  const completions = completionsData?.completions;

  if (habitsLoading || completionsLoading || !habits || !completions || habits.length === 0) return null;

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  let globalCompletedDays = 0;
  let globalTotalDays = 0;

  const dayStats = weekDays.map(date => {
    let dayTotal = 0;
    let dayCompleted = 0;

    if (!isFuture(date)) {
      habits.forEach((habit: any) => {
        if (habit.paused || habit.type === "weekly") return; // weekly habits don't easily map to specific day dots here globally
        const status = getHabitStatusForDate(habit, completions, date);
        if (status !== "inactive" && status !== "future") {
          dayTotal++;
          if (status === "completed") dayCompleted++;
        }
      });
      if (dayTotal > 0) {
        globalTotalDays++;
        if (dayCompleted === dayTotal) globalCompletedDays++;
      }
    }

    return {
      date,
      total: dayTotal,
      completed: dayCompleted,
      isPerfect: dayTotal > 0 && dayCompleted === dayTotal,
      isPartial: dayTotal > 0 && dayCompleted > 0 && dayCompleted < dayTotal,
      isMissed: dayTotal > 0 && dayCompleted === 0 && !isSameDay(date, today), // today might just be pending
    };
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Hidden on mobile if we want a cleaner header, but let's keep the title minimal */}
      <div className="hidden md:flex items-center justify-between">
        <h3 className="font-medium text-ink">This Week</h3>
        <span className="text-sm text-ink-muted bg-surface-card px-3 py-1 rounded-full">
          {globalCompletedDays} / {globalTotalDays} perfect days
        </span>
      </div>
      
      <div className="flex justify-between items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
        {dayStats.map((stat, i) => {
          const isToday = isSameDay(stat.date, today);
          
          return (
            <div 
              key={i} 
              className="flex flex-col items-center justify-center gap-2 min-w-[44px]"
            >
              <span className={cn(
                "text-[11px] font-medium uppercase tracking-wider",
                isToday ? "text-accent-yellow" : "text-ink-muted"
              )}>
                {format(stat.date, 'EE').substring(0, 3)}
              </span>
              
              <div className={cn(
                "w-10 h-10 rounded-full flex flex-col items-center justify-center text-sm font-semibold transition-colors",
                isToday ? "bg-accent-yellow text-surface-dark-foreground shadow-sm" : 
                "bg-surface-card text-ink"
              )}>
                <span>{format(stat.date, 'd')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
