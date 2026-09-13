"use client";

import { useEffect } from "react";
import { useReminders } from "@/hooks/use-reminders";
import { useAppStore } from "@/lib/store";
import { HabitReminders } from "@/components/habits/habit-reminders";

export function GlobalHooks() {
  useReminders();
  
  const theme = useAppStore((state) => state.settings?.theme || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return <HabitReminders />;
}
