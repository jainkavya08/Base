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
    <div className="flex flex-col gap-2.5">
      {sortedReminders.map((reminder: any) => {
        const fireAt = new Date(reminder.fireAt);
        const overdue = isPast(fireAt);
        
        return (
          <div 
            key={reminder.id} 
            className={`group flex items-center gap-3.5 p-3.5 rounded-[4px] transition-transform hover:translate-x-0.5 border ${
              overdue 
                ? 'bg-[#FDFAF4] border-2 border-[#FF4D00] shadow-[2px_2px_0px_0px_#FF4D00]' 
                : 'bg-[#FDFAF4] border border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A]'
            }`}
          >
            <div className={`w-8 h-8 rounded-[4px] border border-[#1A1A1A] flex items-center justify-center shrink-0 shadow-[1px_1px_0px_0px_#1A1A1A] ${
              overdue ? 'bg-[#FF4D00] text-white' : 'bg-[#FFE14D] text-[#1A1A1A]'
            }`}>
              <Bell className="w-4 h-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {overdue && <span className="badge-sendlinks bg-[#FF4D00] text-white border-[#1A1A1A]">OVERDUE</span>}
                <h4 className={`text-sm font-medium truncate ${overdue ? 'text-[#FF4D00]' : 'text-[#1A1A1A]'}`}>
                  {reminder.title}
                </h4>
              </div>
              <p className={`text-xs font-mono mt-0.5 ${overdue ? 'text-[#FF4D00]/80' : 'text-[#8A7F72]'}`}>
                {getRelativeTimeLabel(fireAt)}
              </p>
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => deleteReminder(reminder.id)}
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-[#8A7F72] hover:text-[#FF4D00] hover:border-[#FF4D00]"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        );
      })}

      {sortedReminders.length === 0 && (
        <div className="text-center py-16 bg-[#FDFAF4] rounded-[6px] border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
          <div className="w-12 h-12 rounded-[4px] bg-[#F5F0E8] border border-[#1A1A1A] flex items-center justify-center mx-auto mb-3">
            <Bell className="w-6 h-6 text-[#8A7F72]" />
          </div>
          <h3 className="font-serif italic font-normal text-xl text-[#1A1A1A]">No upcoming reminders</h3>
          <p className="text-xs text-[#8A7F72] mt-1">Add one to get notified.</p>
        </div>
      )}
    </div>
  );
}
