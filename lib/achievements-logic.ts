import { Habit, HabitCompletion } from "./db";
import { calculateStreak, getHabitStatusForDate } from "./habits-logic";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isBefore, startOfDay } from "date-fns";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number; // 0-100
}

export function evaluateAchievements(habits: Habit[], completions: HabitCompletion[]): Achievement[] {
  const today = startOfDay(new Date());

  // 1. First Step: First completed habit
  const hasFirstStep = completions.length > 0;
  let firstStepDate: Date | undefined;
  if (hasFirstStep) {
    const sortedCompletions = [...completions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    firstStepDate = new Date(sortedCompletions[0].date);
  }

  // 2. Streaks (7 Day, 30 Day)
  let maxStreakEver = 0;
  habits.forEach(habit => {
    const habitCompletions = completions.filter(c => c.habitId === habit.id);
    const { longest } = calculateStreak(habit, habitCompletions);
    if (longest > maxStreakEver) {
      maxStreakEver = longest;
    }
  });

  const has7Day = maxStreakEver >= 7;
  const has30Day = maxStreakEver >= 30;

  // 3. Perfect Week (Complete every scheduled habit for a week)
  // We'll check the current week, or if any week in the past was perfect. 
  // For simplicity and performance, we'll check the last 4 weeks.
  let hasPerfectWeek = false;
  let perfectWeekProgress = 0;
  
  // Checking current week
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: currentWeekStart, end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }) });
  
  let currentWeekPerfectDays = 0;
  let currentWeekPastDays = 0;

  weekDays.forEach(date => {
    if (isBefore(date, today) || date.getTime() === today.getTime()) {
      let dayTotal = 0;
      let dayCompleted = 0;
      habits.forEach(h => {
        if (h.paused) return;
        const status = getHabitStatusForDate(h, completions, date);
        if (status !== 'inactive' && status !== 'future') {
          dayTotal++;
          if (status === 'completed') dayCompleted++;
        }
      });
      if (dayTotal > 0) {
        currentWeekPastDays++;
        if (dayTotal === dayCompleted) currentWeekPerfectDays++;
      }
    }
  });

  if (currentWeekPastDays >= 7 && currentWeekPerfectDays === 7) {
    hasPerfectWeek = true;
  }
  perfectWeekProgress = Math.min(100, Math.round((currentWeekPerfectDays / 7) * 100));

  // 4. Perfect Month (Complete every scheduled habit for a month)
  let hasPerfectMonth = false;
  let perfectMonthProgress = 0;
  
  const currentMonthStart = startOfMonth(today);
  const monthDays = eachDayOfInterval({ start: currentMonthStart, end: endOfMonth(currentMonthStart) });
  
  let currentMonthPerfectDays = 0;
  let currentMonthPastDays = 0;

  monthDays.forEach(date => {
    if (isBefore(date, today) || date.getTime() === today.getTime()) {
      let dayTotal = 0;
      let dayCompleted = 0;
      habits.forEach(h => {
        if (h.paused) return;
        const status = getHabitStatusForDate(h, completions, date);
        if (status !== 'inactive' && status !== 'future') {
          dayTotal++;
          if (status === 'completed') dayCompleted++;
        }
      });
      if (dayTotal > 0) {
        currentMonthPastDays++;
        if (dayTotal === dayCompleted) currentMonthPerfectDays++;
      }
    }
  });

  if (currentMonthPastDays >= monthDays.length && currentMonthPerfectDays === monthDays.length) {
    hasPerfectMonth = true;
  }
  perfectMonthProgress = Math.min(100, Math.round((currentMonthPerfectDays / monthDays.length) * 100));

  return [
    {
      id: "first_step",
      title: "First Step",
      description: "Complete your first habit",
      icon: "🏆",
      unlocked: hasFirstStep,
      unlockedAt: firstStepDate,
      progress: hasFirstStep ? 100 : 0
    },
    {
      id: "streak_7",
      title: "7 Day Streak",
      description: "Maintain a 7-day streak on any habit",
      icon: "🔥",
      unlocked: has7Day,
      progress: Math.min(100, Math.round((maxStreakEver / 7) * 100))
    },
    {
      id: "streak_30",
      title: "30 Day Streak",
      description: "Maintain a 30-day streak on any habit",
      icon: "🔥",
      unlocked: has30Day,
      progress: Math.min(100, Math.round((maxStreakEver / 30) * 100))
    },
    {
      id: "perfect_week",
      title: "Perfect Week",
      description: "Complete every scheduled habit for a week",
      icon: "💯",
      unlocked: hasPerfectWeek,
      progress: perfectWeekProgress
    },
    {
      id: "perfect_month",
      title: "Perfect Month",
      description: "Complete every scheduled habit for a month",
      icon: "🌟",
      unlocked: hasPerfectMonth,
      progress: perfectMonthProgress
    }
  ];
}
