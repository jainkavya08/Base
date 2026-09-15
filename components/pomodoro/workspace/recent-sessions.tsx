"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { format, isToday, isYesterday } from "date-fns";
import { CheckCircle, XCircle } from "lucide-react";

export function RecentSessions() {
  const { data: statsData } = useSWR('/api/pomodoro/stats.php', fetcher);
  
  const sessions = statsData?.sessions?.slice(0, 5) || [];

  if (sessions.length === 0) return null;

  const formatRelativeDay = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, 'MMM d');
  };

  return (
    <div className="bg-surface-card rounded-[32px] p-6 shadow-sm border border-border/50">
      <h3 className="text-sm font-medium text-ink-muted mb-4 uppercase tracking-wider">Recent Sessions</h3>
      
      <div className="flex flex-col gap-3">
        {sessions.map((session: any) => (
          <div key={session.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-canvas flex items-center justify-center shrink-0">
                {session.status === 'completed' ? (
                  <CheckCircle className="w-4 h-4 text-accent-blue" />
                ) : (
                  <XCircle className="w-4 h-4 text-ink-muted" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-ink capitalize">
                  {session.type?.replace('_', ' ')}
                </span>
                <span className="text-xs text-ink-muted">
                  {formatRelativeDay(session.completedAt)} at {format(new Date(session.completedAt), 'HH:mm')}
                </span>
              </div>
            </div>
            
            <span className="text-sm font-medium text-ink">
              {session.durationMinutes} min
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
