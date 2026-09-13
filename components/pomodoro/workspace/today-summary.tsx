"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { format, startOfDay } from "date-fns";

export function TodaySummary() {
  const sessions = useLiveQuery(() => 
    db.pomodoroSessions.filter(s => {
      const d = startOfDay(new Date(s.completedAt));
      return d.getTime() === startOfDay(new Date()).getTime();
    }).toArray()
  ) || [];

  const focusSessions = sessions.filter(s => s.type === 'focus' && s.status === 'completed');
  const totalMinutes = focusSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  const formattedTime = hours > 0 
    ? `${hours}h ${minutes}m` 
    : `${minutes}m`;

  return (
    <div className="bg-surface-card rounded-[32px] p-6 shadow-sm border border-border/50">
      <h3 className="text-sm font-medium text-ink-muted mb-4 uppercase tracking-wider">Today's Focus</h3>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="text-4xl font-light text-ink mb-1">{focusSessions.length}</div>
          <div className="text-sm text-ink-muted font-medium">Completed Sessions</div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-medium text-accent-blue mb-1">{formattedTime}</div>
          <div className="text-sm text-ink-muted font-medium">Total Time</div>
        </div>
      </div>
    </div>
  );
}
