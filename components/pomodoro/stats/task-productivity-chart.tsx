"use client";

import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export function TaskProductivityChart({ sessions }: { sessions: any[] }) {
  
  const todos = useLiveQuery(() => db.todos.toArray()) || [];

  const data = useMemo(() => {
    const taskTime: Record<string, number> = {};
    
    sessions.forEach(s => {
      if (s.todoId) {
        taskTime[s.todoId] = (taskTime[s.todoId] || 0) + s.durationMinutes;
      } else {
        taskTime['unassigned'] = (taskTime['unassigned'] || 0) + s.durationMinutes;
      }
    });

    const result = Object.keys(taskTime).map(id => {
      let title = "Unassigned";
      if (id !== 'unassigned') {
        const todo = todos.find(t => t.id === id);
        if (todo) title = todo.title;
      }
      return {
        id,
        title,
        minutes: taskTime[id]
      };
    });

    return result.sort((a, b) => b.minutes - a.minutes).slice(0, 5); // top 5
  }, [sessions, todos]);

  return (
    <div className="bg-surface-card rounded-[32px] p-6 lg:p-8 shadow-sm border border-border/50">
      <h3 className="text-lg font-medium text-ink mb-6">Focus By Task</h3>
      
      <div className="h-[250px] w-full">
        {data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-ink-muted text-sm">
            Associate sessions with tasks to see this chart.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <XAxis 
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'var(--ink-muted)' }}
              />
              <YAxis 
                dataKey="title" 
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'var(--ink)' }}
                width={120}
              />
              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-surface-dark text-surface-card px-4 py-3 rounded-xl shadow-xl text-sm">
                        <div className="font-medium mb-1 truncate max-w-[200px]">{data.title}</div>
                        <div className="text-accent-coral">{data.minutes} min</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="minutes" 
                fill="var(--accent-coral)" 
                radius={[0, 4, 4, 0]}
                barSize={20}
                activeBar={{ fill: 'var(--accent-coral)' }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
