"use client";

import { Habit, HabitCompletion, db } from "@/lib/db";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { calculateStreak } from "@/lib/habits-logic";
import { format, subDays, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2, PauseCircle, PlayCircle, Edit3 } from "lucide-react";
import { HabitIcon } from "@/components/ui/habit-icon";

interface HabitDetailModalProps {
  habit: Habit | null;
  completions: HabitCompletion[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HabitDetailModal({ habit, completions, open, onOpenChange }: HabitDetailModalProps) {
  if (!habit) return null;

  const { current, longest } = calculateStreak(habit, completions);
  const totalCompletions = completions.length;
  
  // Calculate completion rate (completions / days since creation)
  const createdAt = startOfDay(new Date(habit.createdAt));
  const today = startOfDay(new Date());
  const daysSinceCreation = Math.max(1, Math.floor((today.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const completionRate = Math.round((totalCompletions / daysSinceCreation) * 100);

  // Generate heatmap data (last 7 weeks = 49 days)
  const heatmapDays = Array.from({ length: 49 }).map((_, i) => {
    const d = subDays(today, 48 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const comp = completions.find(c => c.date === dateStr);
    
    let level = 0; // 0: none, 1: low, 2: med, 3: high, 4: max
    if (comp) {
      if (habit.type === 'numeric' || habit.type === 'duration') {
        const pct = comp.value! / habit.target!;
        if (pct >= 1) level = 4;
        else if (pct >= 0.75) level = 3;
        else if (pct >= 0.5) level = 2;
        else if (pct > 0) level = 1;
      } else {
        level = 4;
      }
    }
    return { date: d, level };
  });

  // Group by week for rendering
  const weeks: { date: Date, level: number }[][] = [];
  for (let i = 0; i < 7; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      week.push(heatmapDays[j * 7 + i]);
    }
    weeks.push(week);
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this habit? All history will be lost.")) {
      await db.habits.delete(habit.id);
      
      // Delete associated completions
      const compIds = completions.map(c => c.id);
      if (compIds.length > 0) {
        await db.habitCompletions.bulkDelete(compIds);
      }
      onOpenChange(false);
    }
  };

  const togglePause = async () => {
    await db.habits.update(habit.id, { paused: !habit.paused });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-32px)] sm:w-full sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-surface-card border-none shadow-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center bg-canvas rounded-xl text-3xl">
              <HabitIcon icon={habit.icon} className="w-8 h-8 text-ink" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-medium text-ink">{habit.title}</DialogTitle>
              {habit.description && (
                <p className="text-sm text-ink-muted mt-1">{habit.description}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="bg-canvas rounded-xl p-4 flex flex-col gap-1">
            <span className="text-ink-muted text-xs uppercase tracking-wider">Current Streak</span>
            <span className="text-2xl font-medium text-ink flex items-center gap-2">
              🔥 {current} <span className="text-base text-ink-muted font-normal">days</span>
            </span>
          </div>
          <div className="bg-canvas rounded-xl p-4 flex flex-col gap-1">
            <span className="text-ink-muted text-xs uppercase tracking-wider">Longest Streak</span>
            <span className="text-2xl font-medium text-ink flex items-center gap-2">
              🏆 {longest} <span className="text-base text-ink-muted font-normal">days</span>
            </span>
          </div>
          <div className="bg-canvas rounded-xl p-4 flex flex-col gap-1">
            <span className="text-ink-muted text-xs uppercase tracking-wider">Completion Rate</span>
            <span className="text-2xl font-medium text-ink flex items-center gap-2">
              📈 {completionRate}%
            </span>
          </div>
          <div className="bg-canvas rounded-xl p-4 flex flex-col gap-1">
            <span className="text-ink-muted text-xs uppercase tracking-wider">Total Completions</span>
            <span className="text-2xl font-medium text-ink flex items-center gap-2">
              ✓ {totalCompletions}
            </span>
          </div>
        </div>

        <div className="py-4 border-t border-border/50">
          <h3 className="text-sm font-medium text-ink mb-4">Consistency (Last 49 Days)</h3>
          
          <div className="flex gap-1 overflow-x-auto pb-2">
            {weeks[0].map((_, colIndex) => (
              <div key={colIndex} className="flex flex-col gap-1">
                {weeks.map((week, rowIndex) => {
                  const day = week[colIndex];
                  const levelClasses = [
                    "bg-canvas", // 0
                    "bg-accent-blue/20", // 1
                    "bg-accent-blue/40", // 2
                    "bg-accent-blue/70", // 3
                    "bg-accent-blue", // 4
                  ];
                  return (
                    <div 
                      key={rowIndex} 
                      title={format(day.date, 'MMM d, yyyy')}
                      className={`w-4 h-4 rounded-sm ${levelClasses[day.level]}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex justify-end items-center gap-2 mt-2 text-xs text-ink-muted">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-canvas" />
            <div className="w-3 h-3 rounded-sm bg-accent-blue/20" />
            <div className="w-3 h-3 rounded-sm bg-accent-blue/40" />
            <div className="w-3 h-3 rounded-sm bg-accent-blue/70" />
            <div className="w-3 h-3 rounded-sm bg-accent-blue" />
            <span>More</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border/50">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={togglePause} className="text-ink hover:bg-canvas">
              {habit.paused ? <PlayCircle className="w-4 h-4 mr-2" /> : <PauseCircle className="w-4 h-4 mr-2" />}
              {habit.paused ? "Resume" : "Pause"}
            </Button>
            <Button variant="ghost" size="sm" className="text-ink hover:bg-canvas">
              <Edit3 className="w-4 h-4 mr-2" /> Edit
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-accent-coral hover:bg-accent-coral/10 hover:text-accent-coral">
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
