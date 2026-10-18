"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { format, isToday, isYesterday } from "date-fns";
import { CheckCircle, XCircle } from "lucide-react";

export function RecentSessions() {
  const { data: statsData } = useSWR('/api/pomodoro/stats.php', fetcher);
  
  const sessions = statsData?.sessions?.slice(0, 5) || [];

  if (sessions.length === 0) return null;

  const formatRelativeDay = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, 'MMM d');
  };

  return (
    <div className="bg-[#FDFAF4] rounded-[6px] p-6 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1A1A1A]/10">
        <span className="badge-sendlinks">RECENT SESSIONS</span>
        <span className="text-xs font-mono text-[#8A7F72]">HISTORY</span>
      </div>
      
      <div className="flex flex-col gap-2">
        {sessions.map((session: any) => (
          <div key={session.id} className="flex items-center justify-between p-2.5 bg-[#F5F0E8] rounded-[3px] border border-[#1A1A1A]/20">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-[2px] bg-[#FDFAF4] border border-[#1A1A1A] flex items-center justify-center shrink-0">
                {session.status === 'completed' ? (
                  <CheckCircle className="w-4 h-4 text-[#FF4D00]" />
                ) : (
                  <XCircle className="w-4 h-4 text-[#8A7F72]" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-sans font-medium text-[#1A1A1A] capitalize">
                  {session.type?.replace('_', ' ')}
                </span>
                <span className="text-[11px] font-mono text-[#8A7F72]">
                  {formatRelativeDay(session.completedAt)} at {format(new Date(session.completedAt), 'HH:mm')}
                </span>
              </div>
            </div>
            
            <span className="text-xs font-mono font-medium text-[#1A1A1A] bg-[#FFE14D] px-2 py-0.5 rounded-[2px] border border-[#1A1A1A]">
              {session.durationMinutes}m
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
