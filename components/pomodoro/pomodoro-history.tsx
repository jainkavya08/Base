"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { format, subDays, eachDayOfInterval, startOfDay, endOfDay, isSameDay } from "date-fns";
import { db } from "@/lib/db";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function PomodoroHistory() {
  const sessions = useLiveQuery(() => db.pomodoroSessions.toArray());

  // Last 7 days data
  const today = new Date();
  const last7Days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today,
  });

  const chartData = last7Days.map(date => {
    const daySessions = sessions?.filter(s => isSameDay(new Date(s.completedAt), date)) || [];
    const totalMinutes = daySessions.reduce((acc, session) => acc + session.durationMinutes, 0);
    return {
      name: format(date, "EEE"), // Mon, Tue, etc.
      minutes: totalMinutes,
      isToday: isSameDay(date, today)
    };
  });

  return (
    <div className="bg-surface-card rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      <div>
        <h3 className="text-xl font-medium text-ink">Focus History</h3>
        <p className="text-ink-muted text-sm mt-1">Total minutes focused per day</p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }}
            />
            <Tooltip 
              cursor={{ fill: 'var(--color-canvas)' }}
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                backgroundColor: 'var(--color-surface-dark)',
                color: 'var(--color-surface-card)',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
              }}
              itemStyle={{ color: 'var(--color-accent-yellow)' }}
            />
            <Bar dataKey="minutes" radius={[4, 4, 4, 4]} maxBarSize={40}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isToday ? 'var(--color-accent-yellow)' : 'var(--color-ink-muted)'} 
                  fillOpacity={entry.isToday ? 1 : 0.2}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
