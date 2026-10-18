"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function FocusCalendar() {
  const [currentDate, setCurrentDate] = useState(startOfDay(new Date()));
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  
  const startDate = new Date(monthStart);
  const dayOfWeek = startDate.getDay();
  const paddingDays = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  startDate.setDate(startDate.getDate() - paddingDays);
  
  const endDate = new Date(monthEnd);
  const endDayOfWeek = endDate.getDay();
  const endPaddingDays = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek;
  
  endDate.setDate(endDate.getDate() + endPaddingDays);
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const { data: statsData } = useSWR('/api/pomodoro/stats.php', fetcher);
  
  const sessions = (statsData?.sessions || []).filter((s: any) => {
    const d = new Date(s.completedAt);
    return d >= startDate && d <= endDate;
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="bg-[#FDFAF4] rounded-[6px] p-6 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1A1A1A]/10">
        <span className="badge-sendlinks">FOCUS CALENDAR</span>
        <div className="flex items-center gap-1.5">
          <button onClick={prevMonth} className="p-1 rounded-[2px] border border-[#1A1A1A] hover:bg-[#FFE14D] text-[#1A1A1A]">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono font-medium text-[#1A1A1A] w-20 text-center">
            {format(currentDate, 'MMM yyyy')}
          </span>
          <button onClick={nextMonth} className="p-1 rounded-[2px] border border-[#1A1A1A] hover:bg-[#FFE14D] text-[#1A1A1A]">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
          <div key={i} className="text-center text-[10px] font-mono text-[#8A7F72]">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const daySessions = sessions.filter((s: any) => s.type === 'focus' && s.status === 'completed' && isSameDay(new Date(s.completedAt), day));
          
          let intensityClass = "bg-[#F5F0E8] text-[#8A7F72] border-[#1A1A1A]/20";
          if (daySessions.length > 0) {
            if (daySessions.length <= 2) intensityClass = "bg-[#FFE14D]/40 text-[#1A1A1A] border-[#1A1A1A]/40 font-medium";
            else if (daySessions.length <= 5) intensityClass = "bg-[#FFE14D] text-[#1A1A1A] border-[#1A1A1A] font-bold shadow-[1px_1px_0px_0px_#1A1A1A]";
            else intensityClass = "bg-[#FF4D00] text-white border-[#1A1A1A] font-bold shadow-[1px_1px_0px_0px_#1A1A1A]";
          }

          return (
            <div 
              key={i} 
              className={cn(
                "aspect-square rounded-[2px] border flex items-center justify-center text-xs font-mono transition-colors",
                !isCurrentMonth && "opacity-20",
                intensityClass,
                isToday(day) && "ring-2 ring-[#FF4D00] font-bold"
              )}
              title={`${daySessions.length} sessions on ${format(day, 'MMM d')}`}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
    </div>
  );
}
