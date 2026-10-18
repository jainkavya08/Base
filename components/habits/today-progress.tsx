"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { getTodayProgress } from "@/lib/habits-logic";

export function TodayProgress() {
  const { data: habitsData, isLoading: habitsLoading } = useSWR('/api/habits/habits.php', fetcher);
  const { data: completionsData, isLoading: completionsLoading } = useSWR('/api/habits/completions.php', fetcher);

  const habits = habitsData?.habits;
  const completions = completionsData?.completions;

  if (habitsLoading || completionsLoading || !habits || !completions) return null;

  const { completed, total, percentage } = getTodayProgress(habits, completions);

  if (total === 0) return null;

  return (
    <div className="bg-[#FDFAF4] rounded-[6px] p-6 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-90 absolute top-0 left-0" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="#EDE8DC" strokeWidth="8" fill="transparent" />
          <circle 
            cx="50" 
            cy="50" 
            r="40" 
            stroke="#FF4D00" 
            strokeWidth="8" 
            fill="transparent" 
            strokeLinecap="butt"
            strokeDasharray={2 * Math.PI * 40}
            strokeDashoffset={(2 * Math.PI * 40) * (1 - percentage / 100)}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="text-center flex flex-col items-center">
          <span className="font-serif text-2xl font-normal text-[#1A1A1A] leading-tight">{percentage}%</span>
        </div>
      </div>
      
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          <span className="badge-sendlinks">DAILY DISCIPLINE</span>
        </div>
        <h2 className="font-serif text-3xl font-normal text-[#1A1A1A]">Today's Progress</h2>
        <p className="text-[#8A7F72] mt-1 font-sans text-sm">
          You have completed <span className="text-[#1A1A1A] font-medium">{completed}</span> out of <span className="text-[#1A1A1A] font-medium">{total}</span> scheduled habits today.
        </p>
        
        {percentage === 100 && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFE14D] border border-[#1A1A1A] text-[#1A1A1A] text-xs font-sans font-medium rounded-[2px] w-fit shadow-[2px_2px_0px_0px_#1A1A1A]">
            All habits completed today!
          </div>
        )}
      </div>
    </div>
  );
}
