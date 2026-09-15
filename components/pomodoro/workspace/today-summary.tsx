"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { format, startOfDay } from "date-fns";

export function TodaySummary() {
  const { data: statsData, isLoading, error } = useSWR('/api/pomodoro/stats.php', fetcher);
  const dbSessions = statsData?.sessions || [];

  const todayMidnight = startOfDay(new Date()).getTime();

  const sessions = dbSessions.filter((s: any) => {
    const d = startOfDay(new Date(s.completedAt)).getTime();
    return d === todayMidnight;
  });

  const focusSessions = sessions.filter((s: any) => s.type === 'focus' && s.status === 'completed');
  const totalMinutes = focusSessions.reduce((acc: number, curr: any) => acc + curr.durationMinutes, 0);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  const formattedTime = hours > 0 
    ? `${hours}h ${minutes}m` 
    : `${minutes}m`;

  return (
    <div className="bg-surface-card rounded-[32px] p-6 shadow-sm border border-border/50 relative">
      <h3 className="text-sm font-medium text-ink-muted mb-4 uppercase tracking-wider">Today's Focus</h3>
      
      {isLoading ? (
        <div className="flex items-end justify-between opacity-50">
          <div>
            <div className="text-4xl font-light text-ink mb-1">-</div>
            <div className="text-sm text-ink-muted font-medium">Completed Sessions</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-medium text-accent-blue mb-1">-</div>
            <div className="text-sm text-ink-muted font-medium">Total Time</div>
          </div>
        </div>
      ) : error ? (
        <div className="text-accent-coral text-sm font-medium">Failed to load statistics</div>
      ) : (
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
      )}
    </div>
  );
}
