"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { 
  subDays, 
  eachDayOfInterval, 
  format, 
  startOfDay, 
  isSameDay 
} from "date-fns";
import { getHabitStatusForDate, calculateStreak } from "@/lib/habits-logic";
import { Flame, Trophy, CheckCircle2, TrendingUp, CalendarDays } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CompletionTrend } from "./completion-trend";
import { WeeklyPerformance } from "./weekly-performance";
import { HabitComparison } from "./habit-comparison";
import { ConsistencyHeatmap } from "./consistency-heatmap";
import { HabitIcon } from "@/components/ui/habit-icon";

export function StatsDashboard() {
  const { data: habitsData, isLoading: habitsLoading } = useSWR('/api/habits/habits.php', fetcher);
  const { data: completionsData, isLoading: completionsLoading } = useSWR('/api/habits/completions.php', fetcher);

  const habits = habitsData?.habits;
  const completions = completionsData?.completions;

  const [daysRange, setDaysRange] = useState("30");

  const stats = useMemo(() => {
    if (!habits || !completions || habits.length === 0) return null;

    const today = startOfDay(new Date());
    const rangeNum = parseInt(daysRange, 10);
    const startDate = subDays(today, rangeNum - 1); // e.g. 30 days including today

    const days = eachDayOfInterval({ start: startDate, end: today });

    // 1. Daily Trend Data
    const trendData = days.map(date => {
      let dailyTotal = 0;
      let dailyCompleted = 0;

      habits.forEach((habit: any) => {
        if (habit.paused || habit.type === "weekly") return;
        const status = getHabitStatusForDate(habit, completions, date);
        if (status !== "inactive" && status !== "future") {
          dailyTotal++;
          if (status === "completed") dailyCompleted++;
        }
      });

      return {
        date,
        formattedDate: format(date, "MMM d"),
        dateStr: format(date, "yyyy-MM-dd"),
        total: dailyTotal,
        completed: dailyCompleted,
        percentage: dailyTotal > 0 ? Math.round((dailyCompleted / dailyTotal) * 100) : 0,
      };
    });

    // 2. Weekly Performance (Average per day of week)
    const weekDaysStats = [0, 1, 2, 3, 4, 5, 6].map(dayIndex => ({
      dayIndex,
      name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex],
      totalPossible: 0,
      totalCompleted: 0,
    }));

    trendData.forEach(dayStat => {
      const dayOfWeek = dayStat.date.getDay();
      weekDaysStats[dayOfWeek].totalPossible += dayStat.total;
      weekDaysStats[dayOfWeek].totalCompleted += dayStat.completed;
    });

    const weeklyData = weekDaysStats.map(w => ({
      name: w.name,
      percentage: w.totalPossible > 0 ? Math.round((w.totalCompleted / w.totalPossible) * 100) : 0,
      dayIndex: w.dayIndex
    }));
    
    // Shift so Monday is first
    const shiftedWeeklyData = [...weeklyData.slice(1), weeklyData[0]];

    // 3. Habit Individual Performance & Streaks
    let totalCompletions = 0;
    let overallBestStreak = 0;
    let overallCurrentStreakSum = 0;
    let activeHabitCount = 0;

    const habitStats = habits.map((habit: any) => {
      const { current, longest } = calculateStreak(habit, completions);
      
      let habitTotal = 0;
      let habitCompleted = 0;

      // Calculate historical rate for this specific habit over the range
      days.forEach(date => {
        const status = getHabitStatusForDate(habit, completions, date);
        if (status !== "inactive" && status !== "future") {
          habitTotal++;
          if (status === "completed") {
             habitCompleted++;
             totalCompletions++;
          }
        }
      });

      const rate = habitTotal > 0 ? Math.round((habitCompleted / habitTotal) * 100) : 0;
      
      if (!habit.paused) {
        overallCurrentStreakSum += current;
        activeHabitCount++;
      }
      overallBestStreak = Math.max(overallBestStreak, longest);

      return {
        ...habit,
        currentStreak: current,
        bestStreak: longest,
        completionRate: rate,
        totalCompletionsForRange: habitCompleted,
      };
    });

    // 4. Global Metrics
    const globalTotalPossible = trendData.reduce((acc, curr) => acc + curr.total, 0);
    const globalTotalCompleted = trendData.reduce((acc, curr) => acc + curr.completed, 0);
    const overallRate = globalTotalPossible > 0 ? Math.round((globalTotalCompleted / globalTotalPossible) * 100) : 0;
    
    // Use the max current streak across all active habits as the "Current" streak to display, or avg
    const bestCurrentStreak = Math.max(...habitStats.map((h: any) => h.currentStreak), 0);

    // 5. Best & Worst Habits
    const sortedHabits = [...habitStats].sort((a, b) => b.completionRate - a.completionRate);
    const bestHabits = sortedHabits.filter((h: any) => h.completionRate > 0).slice(0, 3);
    const worstHabits = [...sortedHabits].reverse().filter((h: any) => h.completionRate < 100).slice(0, 3);

    return {
      trendData,
      weeklyData: shiftedWeeklyData,
      habitStats: sortedHabits,
      overallRate,
      bestCurrentStreak,
      overallBestStreak,
      totalCompletions,
      bestHabits,
      worstHabits
    };
  }, [habits, completions, daysRange]);

  if (habitsLoading || completionsLoading || !habits || !completions) {
    return null; // Loading
  }

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-surface-card rounded-full flex items-center justify-center mb-4 border border-border/50">
          <TrendingUp className="w-8 h-8 text-ink-muted" />
        </div>
        <h3 className="text-xl font-medium text-ink mb-2">No data yet</h3>
        <p className="text-ink-muted max-w-sm">
          Start creating and completing your habits to unlock trends, streaks, and personalized insights.
        </p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex flex-col gap-8">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-ink">Analytics Overview</h2>
        <Select value={daysRange} onValueChange={(val) => val && setDaysRange(val)}>
          <SelectTrigger className="w-[160px] bg-surface-card border-border/50 rounded-full h-10">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-border/50 shadow-md">
            <SelectItem value="7" className="rounded-xl">Last 7 Days</SelectItem>
            <SelectItem value="30" className="rounded-xl">Last 30 Days</SelectItem>
            <SelectItem value="90" className="rounded-xl">Last 3 Months</SelectItem>
            <SelectItem value="365" className="rounded-xl">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={<TrendingUp className="w-5 h-5 text-accent-blue" />}
          label="Completion Rate"
          value={`${stats.overallRate}%`}
        />
        <StatCard 
          icon={<Flame className="w-5 h-5 text-accent-coral" />}
          label="Current Streak"
          value={`${stats.bestCurrentStreak} days`}
        />
        <StatCard 
          icon={<Trophy className="w-5 h-5 text-accent-yellow" />}
          label="Best Streak"
          value={`${stats.overallBestStreak} days`}
        />
        <StatCard 
          icon={<CheckCircle2 className="w-5 h-5 text-accent-blue" />}
          label="Total Completions"
          value={stats.totalCompletions.toString()}
        />
      </div>

      {/* Primary Trend */}
      <div className="bg-surface-card rounded-[32px] p-6 lg:p-8 shadow-sm border border-border/50">
        <h3 className="text-lg font-medium text-ink mb-6">Completion Trend</h3>
        <CompletionTrend data={stats.trendData} />
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface-card rounded-[32px] p-6 lg:p-8 shadow-sm border border-border/50 flex flex-col">
          <h3 className="text-lg font-medium text-ink mb-6">Weekly Performance</h3>
          <div className="flex-1 min-h-[250px]">
            <WeeklyPerformance data={stats.weeklyData} />
          </div>
        </div>

        <div className="bg-surface-card rounded-[32px] p-6 lg:p-8 shadow-sm border border-border/50 flex flex-col">
          <h3 className="text-lg font-medium text-ink mb-6">Habit Performance</h3>
          <div className="flex-1 min-h-[250px]">
            <HabitComparison data={stats.habitStats} />
          </div>
        </div>
      </div>

      {/* Consistency Heatmap */}
      <div className="bg-surface-card rounded-[32px] p-6 lg:p-8 shadow-sm border border-border/50 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 mb-6">
          <CalendarDays className="w-5 h-5 text-ink-muted" />
          <h3 className="text-lg font-medium text-ink">Consistency</h3>
        </div>
        <ConsistencyHeatmap data={stats.trendData} />
      </div>

      {/* Best & Worst */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-card rounded-[32px] p-6 lg:p-8 shadow-sm border border-border/50">
          <h3 className="text-lg font-medium text-ink mb-6">Best Performing</h3>
          <div className="flex flex-col gap-4">
            {stats.bestHabits.length > 0 ? stats.bestHabits.map((habit: any) => (
              <div key={habit.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-canvas flex items-center justify-center shrink-0">
                    <HabitIcon icon={habit.icon} className="w-5 h-5 text-ink" />
                  </div>
                  <span className="font-medium text-ink">{habit.title}</span>
                </div>
                <span className="text-accent-blue font-semibold">{habit.completionRate}%</span>
              </div>
            )) : (
              <p className="text-sm text-ink-muted">Not enough data yet.</p>
            )}
          </div>
        </div>

        <div className="bg-surface-card rounded-[32px] p-6 lg:p-8 shadow-sm border border-border/50">
          <h3 className="text-lg font-medium text-ink mb-6">Needs Attention</h3>
          <div className="flex flex-col gap-4">
            {stats.worstHabits.length > 0 ? stats.worstHabits.map((habit: any) => (
              <div key={habit.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-canvas flex items-center justify-center shrink-0">
                    <HabitIcon icon={habit.icon} className="w-5 h-5 text-ink" />
                  </div>
                  <span className="font-medium text-ink">{habit.title}</span>
                </div>
                <span className="text-ink-muted font-medium">{habit.completionRate}%</span>
              </div>
            )) : (
              <p className="text-sm text-ink-muted">All habits are performing well!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-surface-card rounded-[32px] p-6 shadow-sm border border-border/50 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-ink-muted font-medium">{label}</span>
      </div>
      <span className="text-2xl md:text-3xl font-semibold text-ink">{value}</span>
    </div>
  );
}
