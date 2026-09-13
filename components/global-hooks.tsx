"use client";

import { useReminders } from "@/hooks/use-reminders";

export function GlobalHooks() {
  useReminders();
  return null;
}
