"use client";

import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { subDays, startOfDay, format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FocusTimeChart } from "./focus-time-chart";
import { SessionsBarChart } from "./sessions-bar-chart";
import { TaskProductivityChart } from "./task-productivity-chart";
import { FocusHeatmap } from "./focus-heatmap";
import { FocusInsights } from "./focus-insights";
import { LogSessionDialog } from "./log-session-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function StatsDashboard() {
  const [timeRange, setTimeRange] = useState("30"); // days
  
  const days = parseInt(timeRange);
  const startDate = subDays(startOfDay(new Date()), days);

  const sessions = useLiveQuery(() => 
    db.pomodoroSessions
      .where('completedAt')
      .aboveOrEqual(startDate.toISOString())
      .toArray()
  ) || [];

  const focusSessions = sessions.filter(s => s.type === 'focus' && s.status === 'completed');
  
  const totalMinutes = focusSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  
  const avgPerDay = days > 0 ? (focusSessions.length / days).toFixed(1) : 0;

  // Compute a simple streak based on focus sessions
  const streak = calculateFocusStreak(focusSessions);

  useEffect(() => {
    // One-time wipe of the demo data
    if (typeof window !== "undefined" && !localStorage.getItem("wiped_demo_data")) {
      db.pomodoroSessions.clear().then(() => {
        localStorage.setItem("wiped_demo_data", "true");
      });
    }
  }, []);

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-ink">Understand your focus patterns over time.</h2>
        </div>
        <div className="flex items-center gap-3">

          <LogSessionDialog />
          <Select value={timeRange} onValueChange={(val) => val && setTimeRange(val)}>
          <SelectTrigger className="w-40 bg-surface-card border-none shadow-sm rounded-xl">
            <SelectValue placeholder="Last 30 Days" />
          </SelectTrigger>
          <SelectContent className="bg-surface-card border-none shadow-xl rounded-xl">
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 3 Months</SelectItem>
            <SelectItem value="365">This Year</SelectItem>
          </SelectContent>
        </Select>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Focus Time" value={`${totalHours}h ${remainingMins}m`} />
        <MetricCard title="Sessions" value={focusSessions.length.toString()} />
        <MetricCard title="Avg / Day" value={avgPerDay.toString()} />
        <MetricCard title="Streak" value={`${streak} days`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FocusTimeChart sessions={focusSessions} days={days} />
        <SessionsBarChart sessions={focusSessions} days={days} />
        <TaskProductivityChart sessions={focusSessions} />
        <FocusHeatmap sessions={focusSessions} />
      </div>
      
      <FocusInsights sessions={focusSessions} />
      
      <RecentSessions sessions={focusSessions} />

    </div>
  );
}

function MetricCard({ title, value }: { title: string, value: string }) {
  return (
    <div className="bg-surface-card rounded-2xl p-6 shadow-sm border border-border/50">
      <div className="text-3xl font-light text-ink mb-1">{value}</div>
      <div className="text-sm font-medium text-ink-muted uppercase tracking-wider">{title}</div>
    </div>
  );
}

// Simple streak calculator for focus sessions
function calculateFocusStreak(sessions: any[]) {
  const dates = [...new Set(sessions.map(s => startOfDay(new Date(s.completedAt)).toISOString()))].sort().reverse();
  if (dates.length === 0) return 0;
  
  let current = 0;
  const today = startOfDay(new Date()).toISOString();
  const yesterday = subDays(startOfDay(new Date()), 1).toISOString();
  
  if (dates[0] !== today && dates[0] !== yesterday) {
    return 0; // Streak broken
  }
  
  let checkDate = dates[0] === today ? new Date(today) : new Date(yesterday);
  
  for (const d of dates) {
    if (d === checkDate.toISOString()) {
      current++;
      checkDate = subDays(checkDate, 1);
    } else if (new Date(d) < checkDate) {
      break;
    }
  }
  
  return current;
}

function RecentSessions({ sessions }: { sessions: any[] }) {
  // Sort descending by completion time and show last 10
  const recent = [...sessions]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 10);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this session?")) {
      await db.pomodoroSessions.delete(id);
    }
  };

  if (recent.length === 0) return null;

  return (
    <div className="bg-surface-card rounded-[32px] p-6 lg:p-8 shadow-sm border border-border/50">
      <h3 className="text-lg font-medium text-ink mb-6">Recent Sessions</h3>
      <div className="flex flex-col gap-3">
        {recent.map(session => (
          <div key={session.id} className="flex items-center justify-between p-4 bg-canvas rounded-2xl">
            <div className="flex flex-col">
              <span className="text-ink font-medium">{session.durationMinutes} minutes</span>
              <span className="text-ink-muted text-sm">{format(new Date(session.completedAt), "MMM d, yyyy 'at' h:mm a")}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleDelete(session.id)}
              className="text-accent-coral/60 hover:text-accent-coral hover:bg-accent-coral/10 rounded-full w-10 h-10"
              title="Delete Session"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
