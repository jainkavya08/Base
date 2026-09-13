"use client";

import { useMemo } from "react";
import { Lightbulb } from "lucide-react";
import { startOfDay } from "date-fns";

export function FocusInsights({ sessions }: { sessions: any[] }) {
  
  const insights = useMemo(() => {
    if (sessions.length < 5) {
      return ["Keep completing focus sessions to discover your productivity patterns."];
    }

    const messages: string[] = [];

    // Avg session length
    const avgLen = Math.round(sessions.reduce((acc, curr) => acc + curr.durationMinutes, 0) / sessions.length);
    messages.push(`Your average focus session is ${avgLen} minutes.`);

    // Best day
    const dayCounts = [0,0,0,0,0,0,0]; // Sun-Sat
    sessions.forEach(s => {
      dayCounts[new Date(s.completedAt).getDay()] += 1;
    });
    const maxDayIdx = dayCounts.indexOf(Math.max(...dayCounts));
    const dayNames = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];
    if (Math.max(...dayCounts) > 1) {
      messages.push(`You complete the most sessions on ${dayNames[maxDayIdx]}.`);
    }

    return messages;
  }, [sessions]);

  return (
    <div className="bg-surface-card rounded-[32px] p-6 lg:p-8 shadow-sm border border-border/50">
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="w-5 h-5 text-accent-blue" />
        <h3 className="text-lg font-medium text-ink">Productivity Insights</h3>
      </div>
      
      <div className="flex flex-col gap-4">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-3 p-4 bg-canvas rounded-2xl border border-border/30">
            <span className="text-sm font-medium text-ink">{insight}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
