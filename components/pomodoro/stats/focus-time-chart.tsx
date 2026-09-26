"use client";

import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";

function formatDuration(minutes: number) {
  const totalMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

export function FocusTimeChart({ sessions, days }: { sessions: any[], days: number }) {
  
  const data = useMemo(() => {
    const end = startOfDay(new Date());
    const start = subDays(end, days - 1);
    const interval = eachDayOfInterval({ start, end });
    
    return interval.map(date => {
      const daySessions = sessions.filter(s => startOfDay(new Date(s.completedAt)).getTime() === date.getTime());
      const minutes = daySessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
      return {
        date: format(date, 'MMM d'),
        minutes,
        sessions: daySessions.length
      };
    });
  }, [sessions, days]);

  return (
    <div className="bg-surface-card rounded-[32px] p-6 lg:p-8 shadow-sm border border-border/50 col-span-1 lg:col-span-2">
      <h3 className="text-lg font-medium text-ink mb-6">Focus Time</h3>
      
      <div className="h-[300px] w-full">
        {sessions.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-ink-muted text-sm">
            Complete focus sessions to see your trends.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'var(--ink-muted)' }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'var(--ink-muted)' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-surface-dark text-surface-dark-foreground px-4 py-3 rounded-xl shadow-xl text-sm">
                        <div className="font-medium mb-1">{data.date}</div>
                        <div className="text-accent-blue">{formatDuration(data.minutes)}</div>
                        <div className="text-surface-dark-foreground/70 text-xs">{data.sessions} sessions</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="minutes" 
                stroke="var(--accent-blue)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorMinutes)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
