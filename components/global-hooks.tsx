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
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
    }

    if (accentColor && accentColor !== 'default') {
      const accents: Record<string, string> = {
        Gold: '#F4C94C',
        Amber: '#f59e0b',
        Blue: '#3b82f6',
        Green: '#10b981',
        Purple: '#8b5cf6',
        Red: '#ef4444',
        Ocean: '#33648b'
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

  useEffect(() => {
    // One-time migration for quickLinks from old storage to new storage
    try {
      const oldStorage = localStorage.getItem('personal-dashboard-storage');
      if (oldStorage) {
        const oldState = JSON.parse(oldStorage).state;
        if (oldState && Array.isArray(oldState.quickLinks) && oldState.quickLinks.length > 0) {
          const newStorage = localStorage.getItem('base:dock-config');
          if (!newStorage) {
            // Migrate
            const migratedState = {
              state: {
                quickLinks: oldState.quickLinks,
                _hasHydrated: true
              },
              version: 0
            };
            localStorage.setItem('base:dock-config', JSON.stringify(migratedState));
          }
          
          // Remove quickLinks from old storage to avoid confusion
          delete oldState.quickLinks;
          localStorage.setItem('personal-dashboard-storage', JSON.stringify({
            state: oldState,
            version: JSON.parse(oldStorage).version
          }));
        }
      }
    } catch (e) {
      console.error('Migration failed:', e);
    }
  }, []);

  return <HabitReminders />;
}
