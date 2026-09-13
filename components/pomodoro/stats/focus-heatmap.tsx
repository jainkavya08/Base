"use client";

import { useMemo } from "react";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import { cn } from "@/lib/utils";

export function FocusHeatmap({ sessions }: { sessions: any[] }) {
  
  const heatmapData = useMemo(() => {
    const end = startOfDay(new Date());
    const start = subDays(end, 84); // 12 weeks
    const days = eachDayOfInterval({ start, end });
    
    // Group into weeks
    const weeks: any[][] = [];
    let currentWeek: any[] = [];
    
    days.forEach(day => {
      if (day.getDay() === 1 && currentWeek.length > 0) { // Monday start
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      const daySessions = sessions.filter(s => startOfDay(new Date(s.completedAt)).getTime() === day.getTime());
      const minutes = daySessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
      
      currentWeek.push({
        date: day,
        minutes
      });
    });
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  }, [sessions]);

  return (
    <div className="bg-surface-card rounded-[32px] p-6 lg:p-8 shadow-sm border border-border/50 col-span-1 lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-ink">Focus Consistency</h3>
      </div>
      
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-2 min-w-max">
          {heatmapData.map((week, i) => (
            <div key={i} className="flex flex-col gap-2">
              {week.map((day, j) => {
                let intensity = "bg-canvas"; // 0
                if (day.minutes > 0 && day.minutes <= 30) intensity = "bg-accent-blue/30";
                else if (day.minutes > 30 && day.minutes <= 90) intensity = "bg-accent-blue/60";
                else if (day.minutes > 90) intensity = "bg-accent-blue";

                return (
                  <div
                    key={j}
                    className={cn("w-4 h-4 rounded-sm transition-colors", intensity)}
                    title={`${format(day.date, 'MMM d, yyyy')}: ${day.minutes} min`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-2 text-xs text-ink-muted mt-2">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-canvas" />
        <div className="w-3 h-3 rounded-sm bg-accent-blue/30" />
        <div className="w-3 h-3 rounded-sm bg-accent-blue/60" />
        <div className="w-3 h-3 rounded-sm bg-accent-blue" />
        <span>More</span>
      </div>
    </div>
  );
}
