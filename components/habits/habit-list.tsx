"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { format, subDays, startOfWeek, addDays, isSameDay, startOfDay } from "date-fns";
import { db, Habit, HabitCompletion } from "@/lib/db";
import { CheckCircle, Circle, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateStreak, getHabitStatusForDate } from "@/lib/habits-logic";
import { HabitDetailModal } from "./habit-detail-modal";
import { HabitIcon } from "@/components/ui/habit-icon";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function HabitList() {
  const habits = useLiveQuery(() => db.habits.toArray());
  const completions = useLiveQuery(() => db.habitCompletions.toArray());
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  if (!habits || !completions) return null;

  const today = startOfDay(new Date());
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const toggleCompletion = async (habit: Habit, date: Date, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const existing = completions.find(c => c.habitId === habit.id && c.date === dateStr);
    
    if (existing) {
      // For numeric/duration, if they click the big check, maybe we just clear it or complete it?
      // Let's just delete the completion to "undo".
      await db.habitCompletions.delete(existing.id);
    } else {
      await db.habitCompletions.add({
        id: crypto.randomUUID(),
        habitId: habit.id,
        date: dateStr,
        value: (habit.type === 'numeric' || habit.type === 'duration') ? habit.target : undefined
      });
    }
  };

  const updateNumericProgress = async (habit: Habit, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const dateStr = format(today, 'yyyy-MM-dd');
    const existing = completions.find(c => c.habitId === habit.id && c.date === dateStr);
    
    let newValue = delta;
    if (existing) {
      newValue = Math.max(0, (existing.value || 0) + delta);
      if (newValue === 0) {
        await db.habitCompletions.delete(existing.id);
        return;
      }
      await db.habitCompletions.update(existing.id, { value: newValue });
    } else {
      if (newValue <= 0) return;
      await db.habitCompletions.add({
        id: crypto.randomUUID(),
        habitId: habit.id,
        date: dateStr,
        value: newValue
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {habits.map((habit) => {
        const habitCompletions = completions.filter(c => c.habitId === habit.id);
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
          thisWeekCompletions = habitCompletions.filter(c => {
             const d = startOfDay(new Date(c.date));
             return d >= weekStart && d < addDays(weekStart, 7);
          }).length;
        }

        const pct = thisWeekTotal === 0 ? 0 : Math.round((thisWeekCompletions / thisWeekTotal) * 100);
        
        // Check if completed today
        const todayStatus = getHabitStatusForDate(habit, habitCompletions, today);
        const isCompletedToday = todayStatus === 'completed';
        
        // Numeric value today
        const todayCompletion = habitCompletions.find(c => c.date === format(today, 'yyyy-MM-dd'));
        const todayValue = todayCompletion?.value || 0;

        return (
          <div 
            key={habit.id} 
            onClick={() => setSelectedHabit(habit)}
            className={cn(
              "bg-surface-card rounded-2xl p-5 shadow-sm border border-transparent flex flex-col gap-4 cursor-pointer hover:shadow-md transition-all relative overflow-hidden group",
              habit.paused && "opacity-60 grayscale-[0.5]"
            )}
          >
            {/* Top row */}
            <div className="flex justify-between items-start">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-canvas flex items-center justify-center text-xl shrink-0">
                  <HabitIcon icon={habit.icon} className="w-5 h-5 text-ink" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-medium text-ink flex items-center gap-2">
                    {habit.title} 
                    {habit.paused && <span className="text-[10px] uppercase bg-canvas px-2 py-0.5 rounded-full text-ink-muted font-medium">Paused</span>}
                  </h3>
                  <p className="text-sm text-ink-muted">
                    {habit.description || (habit.type === 'daily' ? 'Daily' : habit.type === 'weekly' ? `${habit.target} times per week` : `${habit.target} ${habit.unit} daily`)}
                  </p>
                </div>
              </div>

              {/* Completion button */}
              {(habit.type === 'daily' || habit.type === 'weekly' || habit.type === 'avoid') ? (
                <button 
                  onClick={(e) => toggleCompletion(habit, today, e)}
                  disabled={habit.paused}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 active:scale-90",
                    isCompletedToday 
                      ? "bg-accent-blue text-surface-card" 
                      : "bg-canvas text-ink-muted hover:bg-border/50 hover:text-ink"
                  )}
                >
                  <CheckCircle className="w-6 h-6" />
                </button>
              ) : (
                /* Numeric/Duration controls */
                <div className="flex items-center gap-3 bg-canvas p-1 rounded-full" onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={(e) => updateNumericProgress(habit, -1, e)}
                    disabled={habit.paused}
                    className="w-8 h-8 rounded-full bg-surface-card flex items-center justify-center text-ink-muted hover:text-ink shadow-sm active:scale-95 transition-transform"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium w-16 text-center tabular-nums">
                    {todayValue} / {habit.target}
                  </span>
                  <button 
                    onClick={(e) => updateNumericProgress(habit, 1, e)}
                    disabled={habit.paused}
                    className="w-8 h-8 rounded-full bg-accent-blue text-surface-card flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-2 gap-4 sm:gap-0">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1.5 text-sm font-medium text-ink">
                  🔥 {current} day streak
                </div>
                
                {/* Mini Calendar */}
                <div className="flex gap-1.5">
                  {dayStatuses.map(({ day, status }, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-ink-muted">{format(day, 'ee').charAt(0)}</span>
                      <div className={cn(
                        "w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold transition-colors",
                        status === 'completed' ? "bg-accent-blue text-surface-card" :
                        status === 'inactive' ? "bg-transparent text-transparent" :
                        status === 'missed' ? "bg-canvas text-ink-muted/50" :
                        "bg-canvas text-ink-muted"
                      )}>
                        {status === 'completed' ? '✓' : status === 'missed' ? '×' : status === 'inactive' ? '' : '·'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-medium text-ink">{pct}%</span>
                <span className="text-[10px] text-ink-muted">{thisWeekCompletions} / {thisWeekTotal} this week</span>
              </div>
            </div>
            
            {/* Very subtle background progress bar if not completed */}
            {!isCompletedToday && habit.type !== 'avoid' && pct > 0 && pct < 100 && (
              <div 
                className="absolute bottom-0 left-0 h-1 bg-accent-blue/20 transition-all duration-500" 
                style={{ width: `${pct}%` }} 
              />
            )}
            {isCompletedToday && (
              <div className="absolute bottom-0 left-0 h-1 bg-accent-blue w-full" />
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
        completions={completions.filter(c => c.habitId === selectedHabit?.id)} 
        open={!!selectedHabit} 
        onOpenChange={(v) => !v && setSelectedHabit(null)} 
      />
    </div>
  );
}
