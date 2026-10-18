"use client";

import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isFuture, startOfDay, addDays } from "date-fns";
import { fetchApi, fetcher } from "@/lib/api";
import type { Habit } from "@/lib/db";
import { CheckCircle, Circle } from "lucide-react";
import { getHabitStatusForDate } from "@/lib/habits-logic";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HabitIcon } from "@/components/ui/habit-icon";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col gap-3">
      {/* Month Selector Pills */}
      <div className="flex justify-between gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        {monthsList.map(m => {
          const isSelected = m.getMonth() === currentMonth.getMonth() && m.getFullYear() === currentMonth.getFullYear();
          return (
            <button 
              key={m.toISOString()}
              onClick={() => setCurrentMonth(m)}
              className={cn(
                "px-4 py-1.5 rounded-[4px] text-xs font-sans font-medium transition-all min-w-[70px]",
                isSelected 
                  ? "bg-[#1A1A1A] text-[#FFE14D] border border-[#1A1A1A] shadow-[2px_2px_0px_0px_#FF4D00]" 
                  : "bg-[#FDFAF4] text-[#1A1A1A] border border-[#1A1A1A] shadow-[1px_1px_0px_0px_#1A1A1A] hover:bg-[#FFE14D]"
              )}
            >
              {format(m, "MMM yyyy")}
            </button>
          );
        })}
      </div>

      {/* Calendar Card */}
      <div className="bg-[#FDFAF4] rounded-[6px] p-4 md:p-5 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1A1A1A]/10">
          <span className="badge-sendlinks">MONTHLY OVERVIEW</span>
          <span className="text-xs font-mono text-[#8A7F72]">{format(currentMonth, "MMMM yyyy")}</span>
        </div>

        <div className="grid grid-cols-7 gap-y-2 text-center text-xs">
          {/* Days Header */}
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
            const isTodayDay = today.getDay() === i;
            return (
              <div 
                key={`header-${i}`} 
                className={cn(
                  "font-mono font-medium pb-2",
                  isTodayDay ? "text-[#FF4D00] font-bold" : "text-[#8A7F72]"
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
          {daysInMonth.map((date) => {
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

            return (
              <Popover key={date.toString()} open={selectedDate && isSameDay(selectedDate, date) ? true : false} onOpenChange={(v) => !v && setSelectedDate(null)}>
                <PopoverTrigger render={
                  <div 
                    className="relative flex justify-center items-center h-8 sm:h-9 w-full group cursor-pointer"
                    onClick={() => !isFutureDate && setSelectedDate(date)}
                  >
                    <button 
                      disabled={isFutureDate}
                      className={cn(
                        "w-7 h-7 sm:w-8 sm:h-8 rounded-[3px] border flex items-center justify-center transition-transform text-xs font-mono font-medium z-10 relative",
                        isAllCompleted 
                          ? "bg-[#FFE14D] text-[#1A1A1A] border-[#1A1A1A] shadow-[1px_1px_0px_0px_#1A1A1A] font-bold" 
                          : isToday 
                          ? "bg-[#1A1A1A] text-white border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#FF4D00]" 
                          : isPartial 
                          ? "bg-[#C8E6C9] text-[#1A1A1A] border-[#1A1A1A]" 
                          : isMissed 
                          ? "bg-[#EDE8DC] text-[#8A7F72] border-[#1A1A1A]/30" 
                          : isFutureDate 
                          ? "text-[#8A7F72]/40 border-transparent bg-transparent cursor-default" 
                          : "bg-[#F5F0E8] text-[#1A1A1A] border-[#1A1A1A]/40 hover:bg-[#FFE14D]"
                      )}
                    >
                      <span>{format(date, "d")}</span>
                    </button>
                  </div>
                } />
                <PopoverContent side="left" align="start" className="w-64 bg-[#FDFAF4] border border-[#1A1A1A] shadow-[6px_6px_0px_0px_#1A1A1A] rounded-[6px] p-4 z-50">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#1A1A1A]/10">
                    <h4 className="font-serif text-lg font-normal text-[#1A1A1A]">{format(date, 'MMMM d')}</h4>
                    <span className="badge-sendlinks">{dayCompleted}/{dayTotal}</span>
                  </div>
                  
                  {dayTotal === 0 ? (
                    <p className="text-xs text-[#8A7F72] font-sans">No habits scheduled for this day.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {habits.filter((h: any) => !h.paused && getHabitStatusForDate(h, completions, date) !== 'inactive' && getHabitStatusForDate(h, completions, date) !== 'future').map((habit: any) => {
                        const status = getHabitStatusForDate(habit, completions, date);
                        const isCompleted = status === 'completed';
                        return (
                          <div key={habit.id} className="flex items-center justify-between p-1.5 bg-[#F5F0E8] rounded-[3px] border border-[#1A1A1A]/20">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                <HabitIcon icon={habit.icon} className="w-3.5 h-3.5 text-[#1A1A1A]" />
                              </div>
                              <span className="text-xs font-sans font-medium text-[#1A1A1A]">{habit.title}</span>
                            </div>
                            {(habit.type === 'daily' || habit.type === 'avoid' || habit.type === 'weekly') ? (
                              <button 
                                onClick={() => toggleHistoricalCompletion(habit, date)}
                                className={cn(
                                  "w-5 h-5 rounded-[2px] border border-[#1A1A1A] flex items-center justify-center transition-colors",
                                  isCompleted ? "bg-[#FFE14D] text-[#1A1A1A]" : "bg-white text-[#8A7F72] hover:bg-[#FFE14D]"
                                )}
                              >
                                {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                              </button>
                            ) : (
                               <span className="text-[10px] font-mono text-[#8A7F72]">
                                 {isCompleted ? 'Done' : 'Pending'}
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
