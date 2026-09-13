"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths } from "date-fns";
import { db } from "@/lib/db";

export function HabitCalendar() {
  const completions = useLiveQuery(() => db.habitCompletions.toArray());
  const habits = useLiveQuery(() => db.habits.toArray());

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get total habits to know if a day was fully completed
  const totalHabits = habits?.length || 0;

  return (
    <div className="bg-surface-dark rounded-[24px] p-6 text-surface-card shadow-lg relative overflow-hidden">
      {/* Background glow per prompt constraint */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-yellow/20 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="relative z-10 flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Training Days</h2>
        <div className="text-sm text-surface-card/70 bg-surface-card/10 px-3 py-1 rounded-full">
          {format(today, "MMMM")}
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-7 gap-y-4 gap-x-2 text-center text-sm">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
          <div key={`header-${i}`} className="text-surface-card/50 font-medium pb-2">
            {day}
          </div>
        ))}
        
        {/* Empty slots for start of month offset */}
        {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {daysInMonth.map((date) => {
          const isToday = isSameDay(date, today);
          const dayCompletions = completions?.filter(c => isSameDay(new Date(c.date), date)) || [];
          
          let dayStatus = 'none';
          if (totalHabits > 0) {
            if (dayCompletions.length === totalHabits) dayStatus = 'all';
            else if (dayCompletions.length > 0) dayStatus = 'some';
          }

          return (
            <div key={date.toString()} className="flex justify-center items-center h-8">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
                  ${isToday && dayStatus === 'none' ? 'border border-accent-yellow text-accent-yellow' : ''}
                  ${dayStatus === 'all' ? 'bg-accent-yellow text-surface-dark font-medium' : ''}
                  ${dayStatus === 'some' ? 'bg-surface-card/20 text-surface-card' : ''}
                  ${dayStatus === 'none' && !isToday ? 'text-surface-card/40' : ''}
                `}
              >
                {format(date, "d")}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="relative z-10 flex items-center gap-4 mt-6 text-xs text-surface-card/60">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full border border-accent-yellow" />
          <span>Current day</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-accent-yellow" />
          <span>Done</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-surface-card/20" />
          <span>Partial</span>
        </div>
      </div>
    </div>
  );
}
