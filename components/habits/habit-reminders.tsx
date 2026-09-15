"use client";

import { useEffect, useRef } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { getHabitStatusForDate } from "@/lib/habits-logic";
import { format, startOfDay } from "date-fns";

export function HabitReminders() {
  const { data: habitsData } = useSWR('/api/habits/habits.php', fetcher);
  const { data: completionsData } = useSWR('/api/habits/completions.php', fetcher);
  const habits = habitsData?.habits;
  const completions = completionsData?.completions;
  
  const notifiedHabitsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Request permission if not granted
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    if (!habits || !completions) return;

    const checkReminders = () => {
      if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") {
        return;
      }

      const now = new Date();
      const today = startOfDay(now);
      const currentTimeString = format(now, "HH:mm");

      habits.forEach((habit: any) => {
        if (!habit.reminderTime || habit.paused) return;

        // Ensure this habit is supposed to be done today and hasn't been completed
        const status = getHabitStatusForDate(habit, completions, today);
        if (status === 'completed' || status === 'inactive' || status === 'future') return;

        // Check if the current time matches the reminder time
        // We'll allow a 1 minute window to avoid missing it, but track notified ones to avoid spam
        if (habit.reminderTime === currentTimeString && !notifiedHabitsRef.current.has(habit.id)) {
          // Trigger notification
          new Notification("Habit Reminder", {
            body: `Don't forget: ${habit.title}!`,
            icon: '/favicon.ico' // fallback
          });
          
          notifiedHabitsRef.current.add(habit.id);
        }
      });
    };

    // Check immediately, then every 30 seconds
    checkReminders();
    const intervalId = setInterval(checkReminders, 30000);

    return () => clearInterval(intervalId);
  }, [habits, completions]);

  // Daily reset of the notified set
  useEffect(() => {
    const resetAtMidnight = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const msUntilMidnight = tomorrow.getTime() - now.getTime();
      
      setTimeout(() => {
        notifiedHabitsRef.current.clear();
        resetAtMidnight(); // re-schedule for next day
      }, msUntilMidnight);
    };
    
    resetAtMidnight();
  }, []);

  return null;
}
