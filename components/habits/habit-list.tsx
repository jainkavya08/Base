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
    <div className="flex flex-col relative w-full">
      {/* Subtle vertical timeline line */}
      {habits.length > 0 && (
        <div className="absolute left-[26px] top-[30px] bottom-[30px] w-px bg-border/40 border-l border-dashed border-border" />
      )}
      
      <div className="flex flex-col gap-5 w-full">
      {habits.map((habit: any, index: number) => {
        const habitCompletions = completions.filter((c: any) => c.habitId === habit.id);
        const { current } = calculateStreak(habit, habitCompletions);
        
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
              "flex items-center gap-4 cursor-pointer group relative w-full",
              habit.paused && "opacity-60 grayscale-[0.5]"
            )}
          >
            {/* LEFT: Completion Control */}
            <div className="relative z-10 shrink-0 ml-1">
              {(habit.type === 'daily' || habit.type === 'weekly' || habit.type === 'avoid') ? (
                <button 
                  onClick={(e) => toggleCompletion(habit, today, e)}
                  disabled={habit.paused}
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90",
                    isCompletedToday 
                      ? "bg-accent-yellow text-surface-dark-foreground shadow-sm" 
                      : "bg-surface-card border border-border text-ink-muted hover:border-accent-yellow/50 hover:text-accent-yellow"
                  )}
                >
                  {isCompletedToday ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5 opacity-40" />}
                </button>
              ) : (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    // If it's a numeric habit, just clicking the circle adds 1, or marks completed if goal reached?
                    // Let's just make clicking it toggle full completion (reach target) or 0
                    if (isCompletedToday) {
                      updateNumericProgress(habit, -habit.target, e);
                    } else {
                      updateNumericProgress(habit, habit.target - todayValue, e);
                    }
                  }}
                  disabled={habit.paused}
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90",
                    isCompletedToday 
                      ? "bg-accent-yellow text-surface-dark-foreground shadow-sm" 
                      : (todayValue > 0 ? "bg-accent-yellow/20 border border-accent-yellow text-accent-yellow" : "bg-surface-card border border-border text-ink-muted hover:border-accent-yellow/50 hover:text-accent-yellow")
                  )}
                >
                  {isCompletedToday ? <CheckCircle className="w-5 h-5" /> : (todayValue > 0 ? <span className="text-xs font-medium">{todayValue}</span> : <Circle className="w-5 h-5 opacity-40" />)}
                </button>
              )}
            </div>

            {/* CARD (CENTER & RIGHT) */}
            <div className={cn(
              "flex-1 bg-surface-card rounded-[20px] p-4 flex items-center justify-between border shadow-sm transition-all overflow-hidden",
              isCompletedToday ? "border-transparent bg-canvas/50" : "border-border/60 hover:shadow-md"
            )}>
              {/* CENTER: Name & Streak */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  isCompletedToday ? "bg-canvas text-ink-muted" : "bg-canvas text-ink"
                )}>
                  <HabitIcon icon={habit.icon} className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className={cn(
                    "font-medium truncate",
                    isCompletedToday ? "text-ink-muted" : "text-ink"
                  )}>
                    {habit.title}
                  </h3>
                  <p className="text-xs text-ink-muted flex items-center gap-1.5 mt-0.5">
                    Streak {current} days
                    {habit.paused && <span className="uppercase text-[9px] bg-canvas px-1.5 py-0.5 rounded font-medium ml-1">Paused</span>}
                  </p>
                </div>
              </div>

              {/* RIGHT: Value / Time */}
              <div className="flex flex-col items-end justify-center shrink-0 ml-3">
                <div className="text-ink-muted/80 w-5 h-5 flex justify-end">
                   {habit.type === 'duration' || habit.type === 'numeric' ? (
                     <span className="text-xs font-medium text-ink tabular-nums">{habit.target} {habit.unit}</span>
                   ) : habit.type === 'weekly' ? (
                     <span className="text-xs font-medium text-ink">{habit.target}x/wk</span>
                   ) : (
                     <span className="text-[10px] uppercase font-semibold tracking-wider text-ink-muted opacity-60">Daily</span>
                   )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      </div>
      
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
