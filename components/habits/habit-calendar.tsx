"use client";

import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isFuture, startOfDay, addDays } from "date-fns";
import { fetchApi, fetcher } from "@/lib/api";
import type { Habit } from "@/lib/db";
import { ChevronLeft, ChevronRight, CheckCircle, Circle } from "lucide-react";
import { getHabitStatusForDate } from "@/lib/habits-logic";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HabitIcon } from "@/components/ui/habit-icon";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function HabitCalendar() {
  const { data: habitsData, isLoading: habitsLoading } = useSWR('/api/habits/habits.php', fetcher);
  const { data: completionsData, isLoading: completionsLoading } = useSWR('/api/habits/completions.php', fetcher);
  const { mutate } = useSWRConfig();
  
  const habits = habitsData?.habits;
  const completions = completionsData?.completions;
  
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  if (habitsLoading || completionsLoading || !habits || !completions) return null;

  const today = startOfDay(new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const monthsList = [-1, 0, 1, 2].map(offset => addMonths(today, offset));

  const toggleHistoricalCompletion = async (habit: Habit, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existing = completions.find((c: any) => c.habitId === habit.id && c.date === dateStr);
    
    if (existing) {
      await fetchApi('/api/habits/completions.php', {
        method: 'DELETE',
        body: JSON.stringify({ id: existing.id })
      });
    } else {
      await fetchApi('/api/habits/completions.php', {
        method: 'POST',
        body: JSON.stringify({
          id: crypto.randomUUID(),
          habitId: habit.id,
          date: dateStr,
          value: (habit.type === 'numeric' || habit.type === 'duration') ? habit.target : undefined
        })
      });
    }
    mutate('/api/habits/completions.php');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Month Selector Pills */}
      <div className="flex justify-between gap-2 overflow-x-auto scrollbar-hide">
        {monthsList.map(m => {
          const isSelected = m.getMonth() === currentMonth.getMonth() && m.getFullYear() === currentMonth.getFullYear();
          return (
            <button 
              key={m.toISOString()}
              onClick={() => setCurrentMonth(m)}
              className={cn(
                "px-6 py-2 rounded-full font-medium transition-colors min-w-[80px]",
                isSelected ? "bg-accent-blue text-white shadow-md" : "bg-surface-card text-ink hover:bg-canvas"
              )}
            >
              {format(m, "MMM")}
            </button>
          );
        })}
      </div>

      {/* Calendar Card */}
      <div className="bg-surface-card rounded-[32px] p-4 md:p-6 shadow-sm border border-border/50">
        <div className="grid grid-cols-7 gap-y-4 text-center text-xs md:text-sm">
          {/* Days Header */}
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
            const isTodayDay = today.getDay() === i;
            return (
              <div 
                key={`header-${i}`} 
                className={cn(
                  "font-bold pb-2 md:pb-4",
                  isTodayDay ? "text-accent-blue" : "text-ink"
                )}
              >
                {day}
              </div>
            );
          })}
          
          {/* Empty slots for start of month */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Days */}
          {daysInMonth.map((date, idx) => {
            const isToday = isSameDay(date, today);
            const isFutureDate = isFuture(date) && !isToday;
            
            let dayTotal = 0;
            let dayCompleted = 0;
            
            if (!isFutureDate) {
              habits.forEach((habit: any) => {
                if (habit.paused) return;
                const status = getHabitStatusForDate(habit, completions, date);
                if (status !== 'inactive' && status !== 'future') {
                  dayTotal++;
                  if (status === 'completed') dayCompleted++;
                }
              });
            }

            const isAllCompleted = dayTotal > 0 && dayCompleted === dayTotal;
            const isMissed = dayTotal > 0 && dayCompleted === 0 && !isSameDay(date, today);
            const isPartial = dayTotal > 0 && dayCompleted > 0 && dayCompleted < dayTotal;

            // Check if adjacent days are also completed to show a continuous background (streak)
            let prevCompleted = false;
            let nextCompleted = false;
            
            if (isAllCompleted) {
              const prevDate = addDays(date, -1);
              const nextDate = addDays(date, 1);
              
              if (prevDate.getMonth() === currentMonth.getMonth()) {
                let prevTotal = 0, prevComp = 0;
                habits.forEach((habit: any) => {
                  if (habit.paused) return;
                  const st = getHabitStatusForDate(habit, completions, prevDate);
                  if (st !== 'inactive' && st !== 'future') { prevTotal++; if (st === 'completed') prevComp++; }
                });
                if (prevTotal > 0 && prevComp === prevTotal) prevCompleted = true;
              }
              
              if (nextDate.getMonth() === currentMonth.getMonth() && (!isFuture(nextDate) || isSameDay(nextDate, today))) {
                let nextTotal = 0, nextComp = 0;
                habits.forEach((habit: any) => {
                  if (habit.paused) return;
                  const st = getHabitStatusForDate(habit, completions, nextDate);
                  if (st !== 'inactive' && st !== 'future') { nextTotal++; if (st === 'completed') nextComp++; }
                });
                if (nextTotal > 0 && nextComp === nextTotal) nextCompleted = true;
              }
            }

            return (
              <Popover key={date.toString()} open={selectedDate && isSameDay(selectedDate, date) ? true : false} onOpenChange={(v) => !v && setSelectedDate(null)}>
                <PopoverTrigger render={
                  <div 
                    className="relative flex justify-center items-center h-8 sm:h-10 w-full group cursor-pointer"
                    onClick={() => !isFutureDate && setSelectedDate(date)}
                  >
                    {/* Connecting background for streaks */}
                    {isAllCompleted && (prevCompleted || nextCompleted) && (
                      <div className={cn(
                        "absolute top-1/2 -translate-y-1/2 h-6 sm:h-8 bg-accent-blue/15 z-0",
                        prevCompleted && nextCompleted ? "w-full left-0" : 
                        prevCompleted ? "w-1/2 left-0" : 
                        nextCompleted ? "w-1/2 right-0" : ""
                      )} />
                    )}

                    <button 
                      disabled={isFutureDate}
                      className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors text-xs sm:text-sm font-medium z-10 relative",
                        isAllCompleted ? 'bg-accent-blue text-white' : 
                        isMissed ? 'bg-[repeating-linear-gradient(45deg,var(--color-border),var(--color-border)_2px,transparent_2px,transparent_6px)] text-transparent border border-border/50' :
                        isPartial ? 'bg-accent-blue/20 text-accent-blue' :
                        isFutureDate ? 'text-ink-muted/60 cursor-default bg-canvas/30' : 
                        isToday ? 'border-2 border-accent-blue text-accent-blue' :
                        'bg-canvas/50 text-ink hover:bg-canvas'
                      )}
                    >
                      {/* For missed days with stripes, we want the text invisible but maybe show it slightly or not at all. The image shows no text for stripes, but let's just make it transparent above */}
                      <span className={isMissed ? 'invisible' : ''}>{format(date, "d")}</span>
                    </button>
                  </div>
                } />
                <PopoverContent side="left" align="start" className="w-64 bg-surface-card border-none shadow-xl p-4 z-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-ink">{format(date, 'MMMM d')}</h4>
                    <span className="text-xs text-ink-muted">{dayCompleted} / {dayTotal} completed</span>
                  </div>
                  
                  {dayTotal === 0 ? (
                    <p className="text-sm text-ink-muted">No habits scheduled for this day.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {habits.filter((h: any) => !h.paused && getHabitStatusForDate(h, completions, date) !== 'inactive' && getHabitStatusForDate(h, completions, date) !== 'future').map((habit: any) => {
                        const status = getHabitStatusForDate(habit, completions, date);
                        const isCompleted = status === 'completed';
                        return (
                          <div key={habit.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                                <HabitIcon icon={habit.icon} className="w-4 h-4 text-ink" />
                              </div>
                              <span className="text-sm font-medium text-ink">{habit.title}</span>
                            </div>
                            {(habit.type === 'daily' || habit.type === 'avoid' || habit.type === 'weekly') ? (
                              <button 
                                onClick={() => toggleHistoricalCompletion(habit, date)}
                                className={cn(
                                  "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                  isCompleted ? "text-accent-blue" : "text-ink-muted hover:text-ink hover:bg-canvas"
                                )}
                              >
                                {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                              </button>
                            ) : (
                               <span className="text-xs text-ink-muted font-medium bg-canvas px-2 py-0.5 rounded-md">
                                 {isCompleted ? 'Completed' : 'Pending'}
                               </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
      </div>
    </div>
  );
}
