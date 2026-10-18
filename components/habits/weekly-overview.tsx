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
        if (habit.paused || habit.type === "weekly") return;
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
      isMissed: dayTotal > 0 && dayCompleted === 0 && !isSameDay(date, today),
    };
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-2xl font-normal text-[#1A1A1A]">This Week's Rhythm</h3>
        <span className="badge-sendlinks">
          {globalCompletedDays} / {globalTotalDays} PERFECT DAYS
        </span>
      </div>
      
      <div className="flex justify-between items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {dayStats.map((stat, i) => {
          const isToday = isSameDay(stat.date, today);
          
          return (
            <div 
              key={i} 
              className={cn(
                "flex flex-col items-center justify-between p-2 rounded-[4px] h-[100px] min-w-[56px] transition-all",
                isToday && stat.isPerfect
                  ? "bg-[#FFE14D] border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A]"
                  : isToday
                  ? "bg-[#FDFAF4] border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_#FF4D00]"
                  : "bg-[#FDFAF4] border border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A]"
              )}
            >
              <span className={cn(
                "text-xs font-sans font-medium uppercase",
                isToday ? "text-[#1A1A1A] font-bold" : "text-[#8A7F72]"
              )}>
                {format(stat.date, 'EEE')}
              </span>
              
              <div className={cn(
                "w-9 h-9 rounded-[2px] flex flex-col items-center justify-center text-sm font-mono font-medium border",
                isToday && stat.isPerfect
                  ? "bg-[#1A1A1A] text-[#FFE14D] border-[#1A1A1A]"
                  : isToday
                  ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                  : stat.isPerfect
                  ? "bg-[#C8E6C9] text-[#1A1A1A] border-[#1A1A1A]"
                  : "bg-[#F5F0E8] text-[#1A1A1A] border-[#1A1A1A]/40"
              )}>
                <span>{format(stat.date, 'd')}</span>
              </div>

              <div className="h-1.5 flex items-center justify-center">
                {stat.isPerfect ? (
                  <span className="w-1.5 h-1.5 rounded-[1px] bg-[#FF4D00]" />
                ) : stat.isPartial ? (
                  <span className="w-1.5 h-1.5 rounded-[1px] bg-[#FFE14D] border border-[#1A1A1A]" />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
