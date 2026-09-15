"use client";

import { useEffect } from "react";
import useSWR, { mutate } from "swr";
import { fetcher, fetchApi } from "@/lib/api";

export function useReminders() {
  const { data } = useSWR('/api/reminders/reminders.php', fetcher);
  const reminders = data?.reminders;

  useEffect(() => {
    if (!reminders) return;

    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach(async (reminder: any) => {
        const fireAt = new Date(reminder.fireAt);
        if (now >= fireAt) {
          // Fire notification
          if (Notification.permission === "granted") {
            new Notification("Reminder", {
              body: reminder.title,
            });
          }
          // Remove from db after firing (or mark completed)
          try {
            await fetchApi('/api/reminders/delete.php', {
              method: 'POST',
              body: JSON.stringify({ id: reminder.id })
            });
            mutate('/api/reminders/reminders.php');
          } catch (e) {
            console.error("Failed to delete triggered reminder", e);
          }
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [reminders]);
}
