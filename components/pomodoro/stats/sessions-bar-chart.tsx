"use client";

import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";

export function SessionsBarChart({ sessions, days }: { sessions: any[], days: number }) {
  
  const data = useMemo(() => {
    // Group by day of week
    const daysOfWeek = [0,1,2,3,4,5,6].map(d => ({
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d],
      sessions: 0
    }));

    sessions.forEach(s => {
      const d = new Date(s.completedAt).getDay();
      daysOfWeek[d].sessions += 1;
    });

    // Make Monday first
    return [...daysOfWeek.slice(1), daysOfWeek[0]];
  }, [sessions]);

  return (
    <div className="bg-surface-card rounded-[32px] p-6 lg:p-8 shadow-sm border border-border/50">
      <h3 className="text-lg font-medium text-ink mb-6">Sessions Per Day</h3>
      
      <div className="h-[250px] w-full">
        {sessions.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-ink-muted text-sm">
            Complete focus sessions to see your trends.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="day" 
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
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-surface-dark text-surface-card px-4 py-3 rounded-xl shadow-xl text-sm">
                        <div className="font-medium mb-1">{data.day}</div>
                        <div className="text-accent-blue">{data.sessions} sessions</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="sessions" 
                fill="var(--accent-blue)" 
                radius={[4, 4, 4, 4]}
                barSize={30}
                activeBar={{ fill: 'var(--accent-blue)' }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
