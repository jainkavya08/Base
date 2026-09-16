"use client";

import { useEffect } from "react";
import { useReminders } from "@/hooks/use-reminders";
import { useAppStore } from "@/lib/store";
import { HabitReminders } from "@/components/habits/habit-reminders";

export function GlobalHooks() {
  useReminders();
  
  const theme = useAppStore((state) => state.settings?.theme || 'light');
  const accentColor = useAppStore((state) => state.settings?.accentColor || 'default');
  const hasHydrated = useAppStore((state) => state._hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (accentColor && accentColor !== 'default') {
      const accents: Record<string, string> = {
        Gold: '#F4C94C',
        Amber: '#f59e0b',
        Blue: '#3b82f6',
        Green: '#10b981',
        Purple: '#8b5cf6',
        Red: '#ef4444'
      };
      const color = accents[accentColor];
      if (color) {
        document.documentElement.style.setProperty('--accent', color);
        document.documentElement.style.setProperty('--primary', color);
        document.documentElement.style.setProperty('--ring', color);
        document.documentElement.style.setProperty('--sidebar-ring', color);
        document.documentElement.style.setProperty('--sidebar-primary', color);
        // Apply to the hardcoded accent-yellow variable so all UI elements (buttons, glows) update
        document.documentElement.style.setProperty('--accent-yellow', color);
      }
    } else {
      document.documentElement.style.removeProperty('--accent');
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--ring');
      document.documentElement.style.removeProperty('--sidebar-ring');
      document.documentElement.style.removeProperty('--sidebar-primary');
      document.documentElement.style.removeProperty('--accent-yellow');
    }
  }, [theme, accentColor, hasHydrated]);

  return <HabitReminders />;
}
