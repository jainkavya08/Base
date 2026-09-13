"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { format, subDays, isSameDay } from "date-fns";
import { db, Habit, HabitCompletion } from "@/lib/db";
import { CheckCircle, MoreHorizontal } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

function calculateStreak(completions: HabitCompletion[], habit: Habit) {
  // Simplified streak calculation for daily habits
  let streak = 0;
  const today = new Date();
  const sortedDates = completions
    .map(c => new Date(c.date))
    .sort((a, b) => b.getTime() - a.getTime());
  
  if (sortedDates.length === 0) return 0;

  // Check if completed today or yesterday to continue streak
  const lastCompleted = sortedDates[0];
  const isToday = isSameDay(today, lastCompleted);
  const isYesterday = isSameDay(subDays(today, 1), lastCompleted);
  
  if (!isToday && !isYesterday) return 0;

  let currentCheckDate = lastCompleted;
  streak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = subDays(currentCheckDate, 1);
    if (isSameDay(sortedDates[i], prevDate)) {
      streak++;
      currentCheckDate = sortedDates[i];
    } else {
      break;
    }
  }

  return streak;
}

export function HabitList() {
  const habits = useLiveQuery(() => db.habits.toArray());
  const completions = useLiveQuery(() => db.habitCompletions.toArray());

  if (!habits || !completions) return null;

  return (
    <div className="flex flex-col gap-4">
      {habits.map((habit) => {
        const habitCompletions = completions.filter(c => c.habitId === habit.id);
        const streak = calculateStreak(habitCompletions, habit);
        // For progress we'll show streak vs target (e.g. 30 days goal)
        const progressPercentage = Math.min((streak / 30) * 100, 100);

        return (
          <div key={habit.id} className="bg-surface-card rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-canvas flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-accent-yellow" />
              </div>
              <div>
                <h3 className="font-medium text-ink">{habit.title}</h3>
                <p className="text-sm text-ink-muted">
                  {habit.frequency === 'daily' ? 'Daily' : `${habit.targetCount}x Weekly`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm text-ink-muted">Current Streak: {streak}</span>
                <div className="w-32 h-2 rounded-full bg-canvas overflow-hidden flex">
                  <div 
                    className="h-full bg-accent-coral rounded-full transition-all" 
                    style={{ width: `${progressPercentage}%` }} 
                  />
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-ink-muted hover:text-ink">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>
        );
      })}
      
      {habits.length === 0 && (
        <div className="text-center py-12 bg-surface-card rounded-2xl border border-dashed border-border">
          <p className="text-ink-muted">No habits added yet. Start by creating one!</p>
        </div>
      )}
    </div>
  );
}
