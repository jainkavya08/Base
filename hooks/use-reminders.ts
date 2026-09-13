"use client";

import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export function useReminders() {
  const reminders = useLiveQuery(() => db.reminders.toArray());

  useEffect(() => {
    if (!reminders) return;

    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach((reminder) => {
        const fireAt = new Date(reminder.fireAt);
        if (now >= fireAt) {
          // Fire notification
          if (Notification.permission === "granted") {
            new Notification("Reminder", {
              body: reminder.title,
            });
          }
          // Remove from db after firing
          db.reminders.delete(reminder.id);
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [reminders]);
}
