"use client";

import { useEffect } from "react";
import { useReminders } from "@/hooks/use-reminders";
import { useAppStore } from "@/lib/store";
import { HabitReminders } from "@/components/habits/habit-reminders";

export function GlobalHooks() {
  useReminders();
  
  const theme = useAppStore((state) => state.settings?.theme || 'light');
  const hasHydrated = useAppStore((state) => state._hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, hasHydrated]);

  return <HabitReminders />;
}
