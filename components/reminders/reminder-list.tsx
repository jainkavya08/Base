"use client";

import useSWR, { mutate } from "swr";
import { format, isPast, isToday, isTomorrow, isThisWeek } from "date-fns";
import { fetcher, fetchApi } from "@/lib/api";
import { Bell, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function getRelativeTimeLabel(date: Date) {
  if (isPast(date)) return "Overdue";
  if (isToday(date)) return `Today at ${format(date, "h:mm a")}`;
  if (isTomorrow(date)) return `Tomorrow at ${format(date, "h:mm a")}`;
  if (isThisWeek(date)) return format(date, "EEEE 'at' h:mm a");
  return format(date, "MMM d 'at' h:mm a");
}

export function ReminderList() {
  const { data } = useSWR('/api/reminders/reminders.php', fetcher);
  const reminders = data?.reminders;

  if (!reminders) return null;

  // Sort by fireAt ascending
  const sortedReminders = [...reminders].sort((a: any, b: any) => 
    new Date(a.fireAt).getTime() - new Date(b.fireAt).getTime()
  );

  const deleteReminder = async (id: string) => {
    await fetchApi(`/api/reminders/reminders.php?id=${id}`, { method: 'DELETE' });
    mutate('/api/reminders/reminders.php');
  };

  return (
    <div className="flex flex-col gap-3">
      {sortedReminders.map((reminder: any) => {
        const fireAt = new Date(reminder.fireAt);
        const overdue = isPast(fireAt);
        
        return (
          <div 
            key={reminder.id} 
            className={`group flex items-center gap-4 p-4 rounded-2xl transition-all border ${overdue ? 'bg-accent-coral/10 border-accent-coral/20' : 'bg-surface-card border-transparent hover:border-border'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${overdue ? 'bg-accent-coral/20 text-accent-coral' : 'bg-canvas text-accent-yellow'}`}>
              <Bell className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className={`font-medium truncate ${overdue ? 'text-accent-coral' : 'text-ink'}`}>
                {reminder.title}
              </h4>
              <p className={`text-sm ${overdue ? 'text-accent-coral/80' : 'text-ink-muted'}`}>
                {getRelativeTimeLabel(fireAt)}
              </p>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => deleteReminder(reminder.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-muted hover:text-accent-coral hover:bg-canvas"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
      })}

      {sortedReminders.length === 0 && (
        <div className="text-center py-16 bg-surface-card rounded-2xl border border-dashed border-border">
          <div className="w-16 h-16 rounded-full bg-canvas flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-ink-muted" />
          </div>
          <h3 className="text-lg font-medium text-ink">No upcoming reminders</h3>
          <p className="text-ink-muted mt-1">Add one to get notified.</p>
        </div>
      )}
    </div>
  );
}
