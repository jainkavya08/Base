"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { startOfDay } from "date-fns";

export function TodaySummary() {
  const { data: statsData, isLoading, error } = useSWR('/api/pomodoro/stats.php', fetcher);
  const dbSessions = statsData?.sessions || [];

  const todayMidnight = startOfDay(new Date()).getTime();

  const sessions = dbSessions.filter((s: any) => {
    const d = startOfDay(new Date(s.completedAt)).getTime();
    return d === todayMidnight;
  });

  const focusSessions = sessions.filter((s: any) => s.type === 'focus' && s.status === 'completed');
  const totalMinutes = focusSessions.reduce((acc: number, curr: any) => acc + curr.durationMinutes, 0);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  const formattedTime = hours > 0 
    ? `${hours}h ${minutes}m` 
    : `${minutes}m`;

  return (
    <div className="bg-[#FDFAF4] rounded-[6px] p-6 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] relative">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1A1A1A]/10">
        <span className="badge-sendlinks">TODAY'S LOG</span>
        <span className="text-xs font-mono text-[#8A7F72]">DAILY ACCRUAL</span>
      </div>
      
      {isLoading ? (
        <div className="flex items-end justify-between opacity-50">
          <div>
            <div className="font-serif text-4xl font-normal text-[#1A1A1A] mb-1">-</div>
            <div className="text-xs font-sans text-[#8A7F72]">Completed Sessions</div>
          </div>
          <div className="text-right">
            <div className="font-serif text-3xl font-normal text-[#FF4D00] mb-1">-</div>
            <div className="text-xs font-sans text-[#8A7F72]">Total Focus Time</div>
          </div>
        </div>
      ) : error ? (
        <div className="text-[#FF4D00] text-sm font-medium">Failed to load statistics</div>
      ) : (
        <div className="flex items-end justify-between">
          <div>
            <div className="font-serif text-5xl font-normal text-[#1A1A1A] mb-1 leading-none">{focusSessions.length}</div>
            <div className="text-xs font-sans text-[#8A7F72]">Completed Sessions</div>
          </div>
          
          <div className="text-right">
            <div className="font-serif text-4xl font-normal text-[#FF4D00] mb-1 leading-none">{formattedTime}</div>
            <div className="text-xs font-sans text-[#8A7F72]">Total Focus Time</div>
          </div>
        </div>
      )}
    </div>
  );
}
