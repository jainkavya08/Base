"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { getHabitStatusForDate } from "@/lib/habits-logic";
import { format, startOfWeek, addDays, isSameDay, isFuture } from "date-fns";
import { cn } from "@/lib/utils";

export function WeeklyOverview() {
  const habits = useLiveQuery(() => db.habits.toArray());
  const completions = useLiveQuery(() => db.habitCompletions.toArray());

  if (!habits || !completions || habits.length === 0) return null;

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  let globalCompletedDays = 0;
  let globalTotalDays = 0;

  const dayStats = weekDays.map(date => {
    let dayTotal = 0;
    let dayCompleted = 0;

    if (!isFuture(date)) {
      habits.forEach(habit => {
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
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-ink">This Week</h3>
        <span className="text-sm text-ink-muted bg-surface-card px-3 py-1 rounded-full">
          {globalCompletedDays} / {globalTotalDays} perfect days
        </span>
      </div>
      
      <div className="flex justify-between items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {dayStats.map((stat, i) => {
          const isToday = isSameDay(stat.date, today);
          
          return (
            <div 
              key={i} 
              className={cn(
                "flex flex-col items-center justify-between p-2 rounded-full h-[110px] min-w-[60px] transition-all",
                isToday && stat.isPerfect ? "bg-accent-blue shadow-md border border-transparent" : 
                isToday ? "bg-surface-card ring-2 ring-inset ring-accent-blue border border-transparent shadow-sm" : 
                "bg-surface-card border border-border/50"
              )}
            >
              <span className={cn(
                "text-sm font-medium mt-1",
                isToday && stat.isPerfect ? "text-surface-card" : 
                isToday ? "text-accent-blue" : "text-ink"
              )}>
                {format(stat.date, 'EE').charAt(0)}
              </span>
              
              <div className={cn(
                "w-11 h-11 rounded-full flex flex-col items-center justify-center text-sm font-semibold relative",
                isToday && stat.isPerfect ? "bg-surface-card text-accent-blue" : 
                isToday ? "bg-accent-blue text-surface-card" : 
                "bg-canvas text-ink",
                !isToday && stat.isPerfect ? "ring-2 ring-accent-blue/50" : "",
                !isToday && stat.isPartial ? "ring-1 ring-accent-blue/30" : ""
              )}>
                <span>{format(stat.date, 'd')}</span>
                
                {/* Small indicator dots for completed/missed status */}
                {!isToday && (
                  <div className="absolute -bottom-1 flex justify-center w-full">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      stat.isPerfect ? "bg-accent-blue" :
                      stat.isPartial ? "bg-accent-blue/50" :
                      "bg-transparent"
                    )} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
