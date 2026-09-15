"use client";

import { useState } from "react";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function FocusCalendar() {
  const [currentDate, setCurrentDate] = useState(startOfDay(new Date()));
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  
  // Create an array of days to pad the first week
  const startDate = new Date(monthStart);
  const dayOfWeek = startDate.getDay(); // 0 is Sunday
  const paddingDays = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Make Monday 0
  
  startDate.setDate(startDate.getDate() - paddingDays);
  
  const endDate = new Date(monthEnd);
  const endDayOfWeek = endDate.getDay();
  const endPaddingDays = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek;
  
  endDate.setDate(endDate.getDate() + endPaddingDays);
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const { data: statsData } = useSWR('/api/pomodoro/stats.php', fetcher);
  
  const sessions = (statsData?.sessions || []).filter((s: any) => {
    const d = new Date(s.completedAt);
    return d >= startDate && d <= endDate;
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="bg-surface-card rounded-[32px] p-6 shadow-sm border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-ink-muted uppercase tracking-wider">Focus Calendar</h3>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1 rounded hover:bg-canvas text-ink-muted hover:text-ink">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-ink w-20 text-center">
            {format(currentDate, 'MMMM')}
          </span>
          <button onClick={nextMonth} className="p-1 rounded hover:bg-canvas text-ink-muted hover:text-ink">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-ink-muted">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const daySessions = sessions.filter((s: any) => s.type === 'focus' && s.status === 'completed' && isSameDay(new Date(s.completedAt), day));
          
          let intensityClass = "bg-canvas text-ink-muted";
          if (daySessions.length > 0) {
            if (daySessions.length <= 2) intensityClass = "bg-accent-blue/30 text-ink";
            else if (daySessions.length <= 5) intensityClass = "bg-accent-blue/60 text-surface-card";
            else intensityClass = "bg-accent-blue text-surface-card";
          }

          return (
            <div 
              key={i} 
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center text-xs transition-colors",
                !isCurrentMonth && "opacity-20",
                intensityClass,
                isToday(day) && "ring-2 ring-accent-blue ring-offset-2 ring-offset-surface-card font-bold"
              )}
              title={`${daySessions.length} sessions`}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
    </div>
  );
}
