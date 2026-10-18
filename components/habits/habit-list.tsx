"use client";

import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { format, subDays, startOfWeek, addDays, isSameDay, startOfDay } from "date-fns";
import { fetchApi, fetcher } from "@/lib/api";
import type { Habit, HabitCompletion } from "@/lib/db";
import { CheckCircle, Circle, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateStreak, getHabitStatusForDate } from "@/lib/habits-logic";
import { HabitDetailModal } from "./habit-detail-modal";
import { HabitIcon } from "@/components/ui/habit-icon";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function HabitList() {
  const { data: habitsData, isLoading: habitsLoading } = useSWR('/api/habits/habits.php', fetcher);
  const { data: completionsData, isLoading: completionsLoading } = useSWR('/api/habits/completions.php', fetcher);
  const { mutate } = useSWRConfig();
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  
  const habits = habitsData?.habits;
  const completions = completionsData?.completions;
  
  if (habitsLoading || completionsLoading || !habits || !completions) return null;

  const today = startOfDay(new Date());
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const toggleCompletion = async (habit: Habit, date: Date, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
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

  const updateNumericProgress = async (habit: Habit, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const dateStr = format(today, 'yyyy-MM-dd');
    const existing = completions.find((c: any) => c.habitId === habit.id && c.date === dateStr);
    
    let newValue = delta;
    if (existing) {
      newValue = Math.max(0, (existing.value || 0) + delta);
      if (newValue === 0) {
        await fetchApi('/api/habits/completions.php', {
          method: 'DELETE',
          body: JSON.stringify({ id: existing.id })
        });
        mutate('/api/habits/completions.php');
        return;
      }
    } else {
      if (newValue <= 0) return;
    }
    
    await fetchApi('/api/habits/completions.php', {
      method: 'POST',
      body: JSON.stringify({
        id: existing ? existing.id : crypto.randomUUID(),
        habitId: habit.id,
        date: dateStr,
        value: newValue
      })
    });
    mutate('/api/habits/completions.php');
  };

  return (
    <div className="flex flex-col gap-4">
      {habits.map((habit: any) => {
        const habitCompletions = completions.filter((c: any) => c.habitId === habit.id);
        const { current } = calculateStreak(habit, habitCompletions);
        
        // Compute this week's progress for the mini-calendar
        let thisWeekCompletions = 0;
        let thisWeekTotal = habit.type === 'weekly' ? habit.target! : 0;
        
        const dayStatuses = weekDays.map(day => {
          const status = getHabitStatusForDate(habit, habitCompletions, day);
          if (habit.type !== 'weekly' && status !== 'inactive' && status !== 'future') {
            thisWeekTotal++;
          }
          if (status === 'completed') thisWeekCompletions++;
          return { day, status };
        });

        // Weekly target takes precedence
        if (habit.type === 'weekly') {
          thisWeekCompletions = habitCompletions.filter((c: any) => {
             const d = startOfDay(new Date(c.date));
             return d >= weekStart && d < addDays(weekStart, 7);
          }).length;
        }

        const pct = thisWeekTotal === 0 ? 0 : Math.round((thisWeekCompletions / thisWeekTotal) * 100);
        
        // Check if completed today
        const todayStatus = getHabitStatusForDate(habit, habitCompletions, today);
        const isCompletedToday = todayStatus === 'completed';
        
        // Numeric value today
        const todayCompletion = habitCompletions.find((c: any) => c.date === format(today, 'yyyy-MM-dd'));
        const todayValue = todayCompletion?.value || 0;

        return (
          <div 
            key={habit.id} 
            onClick={() => setSelectedHabit(habit)}
            className={cn(
              "bg-[#FDFAF4] rounded-[6px] p-5 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] flex flex-col gap-4 cursor-pointer hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_#1A1A1A] transition-all relative overflow-hidden group",
              habit.paused && "opacity-60 grayscale-[0.5]"
            )}
          >
            {/* Top row */}
            <div className="flex justify-between items-start">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-[4px] bg-[#FFE14D] border border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] flex items-center justify-center text-xl shrink-0">
                  <HabitIcon icon={habit.icon} className="w-5 h-5 text-[#1A1A1A]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-serif text-xl font-normal text-[#1A1A1A] flex items-center gap-2">
                    {habit.title} 
                    {habit.paused && <span className="badge-sendlinks text-[10px]">PAUSED</span>}
                  </h3>
                  <p className="text-xs text-[#8A7F72] font-sans">
                    {habit.description || (habit.type === 'daily' ? 'Daily routine' : habit.type === 'weekly' ? `${habit.target} times per week` : `${habit.target} ${habit.unit} daily`)}
                  </p>
                </div>
              </div>

              {/* Completion button */}
              {(habit.type === 'daily' || habit.type === 'weekly' || habit.type === 'avoid') ? (
                <button 
                  onClick={(e) => toggleCompletion(habit, today, e)}
                  disabled={habit.paused}
                  className={cn(
                    "w-11 h-11 rounded-[4px] border border-[#1A1A1A] flex items-center justify-center transition-all shrink-0 active:translate-x-[1px] active:translate-y-[1px]",
                    isCompletedToday 
                      ? "bg-[#FFE14D] text-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A]" 
                      : "bg-[#F5F0E8] text-[#8A7F72] hover:bg-[#FFE14D] hover:text-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A]"
                  )}
                  title={isCompletedToday ? "Mark Incomplete" : "Mark Complete"}
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
              ) : (
                /* Numeric/Duration controls */
                <div className="flex items-center gap-2 bg-[#F5F0E8] p-1 rounded-[4px] border border-[#1A1A1A]" onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={(e) => updateNumericProgress(habit, -1, e)}
                    disabled={habit.paused}
                    className="w-7 h-7 rounded-[2px] bg-white border border-[#1A1A1A] flex items-center justify-center text-[#1A1A1A] shadow-[1px_1px_0px_0px_#1A1A1A] active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-mono font-medium w-16 text-center tabular-nums text-[#1A1A1A]">
                    {todayValue} / {habit.target}
                  </span>
                  <button 
                    onClick={(e) => updateNumericProgress(habit, 1, e)}
                    disabled={habit.paused}
                    className="w-7 h-7 rounded-[2px] bg-[#FFE14D] border border-[#1A1A1A] text-[#1A1A1A] flex items-center justify-center shadow-[1px_1px_0px_0px_#1A1A1A] active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-1 gap-3 sm:gap-0 pt-2 border-t border-[#1A1A1A]/10">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="badge-sendlinks">{current} DAY STREAK</span>
                </div>
                
                {/* Mini Calendar */}
                <div className="flex gap-1.5">
                  {dayStatuses.map(({ day, status }, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono text-[#8A7F72]">{format(day, 'ee').charAt(0)}</span>
                      <div className={cn(
                        "w-5 h-5 rounded-[2px] border flex items-center justify-center text-[10px] font-mono font-bold",
                        status === 'completed' ? "bg-[#FFE14D] border-[#1A1A1A] text-[#1A1A1A] shadow-[1px_1px_0px_0px_#1A1A1A]" :
                        status === 'inactive' ? "bg-transparent border-transparent text-transparent" :
                        status === 'missed' ? "bg-[#F5F0E8] border-[#1A1A1A]/30 text-[#8A7F72]" :
                        "bg-[#F5F0E8] border-[#1A1A1A]/30 text-[#8A7F72]"
                      )}>
                        {status === 'completed' ? '✓' : status === 'missed' ? '×' : status === 'inactive' ? '' : '·'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-mono font-medium text-[#1A1A1A]">{pct}% complete</span>
                <span className="text-[10px] font-sans text-[#8A7F72]">{thisWeekCompletions} / {thisWeekTotal} this week</span>
              </div>
            </div>
            
            {/* Tactile progress bar */}
            {!isCompletedToday && habit.type !== 'avoid' && pct > 0 && pct < 100 && (
              <div 
                className="absolute bottom-0 left-0 h-1 bg-[#FFE14D] border-t border-[#1A1A1A]" 
                style={{ width: `${pct}%` }} 
              />
            )}
            {isCompletedToday && (
              <div className="absolute bottom-0 left-0 h-1 bg-[#FF4D00] w-full" />
            )}
          </div>
        );
      })}
      
      {habits.length === 0 && (
        <div className="text-center py-16 bg-surface-card rounded-2xl border border-dashed border-border flex flex-col items-center gap-4">
          <p className="text-ink-muted text-lg">No habits added yet.</p>
          <p className="text-ink-muted text-sm max-w-xs">Start building your routine by creating your first habit above.</p>
        </div>
      )}

      <HabitDetailModal 
        habit={selectedHabit} 
        completions={completions.filter((c: any) => c.habitId === selectedHabit?.id)} 
        open={!!selectedHabit} 
        onOpenChange={(v) => !v && setSelectedHabit(null)} 
      />
    </div>
  );
}
