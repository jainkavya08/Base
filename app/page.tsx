"use client";

import { BentoGrid } from "@/components/home/bento-grid";
import { format } from "date-fns";
import { useAppStore } from "@/lib/store";
import { QuickDock } from "@/components/home/quick-dock";
import Link from "next/link";
import { ArrowUpRight, Play, CheckCircle } from "lucide-react";

function getGreeting(name: string) {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

export default function Home() {
  const today = new Date();
  const name = useAppStore((state) => state.settings?.profile?.name || "Friend");

  return (
    <>
      <div className="p-4 md:p-8 max-w-7xl mx-auto h-full flex flex-col gap-6 md:gap-8 relative pb-28 sm:pb-32">
        {/* Header Band */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1A1A1A]/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-sendlinks">DESK LEDGER</span>
              <span className="text-xs font-mono text-[#544C40] uppercase tracking-wider">SENDLINKS SYSTEM</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#1A1A1A] leading-[1.05]">
              {getGreeting(name)}
            </h1>
            <p className="text-[#544C40] mt-2 font-sans text-sm sm:text-base">
              {format(today, "EEEE, MMMM do, yyyy")} &bull; Thoughtful, distraction-free productivity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/pomodoro"
              className="btn-primary-sendlinks h-[38px] px-4 flex items-center gap-1.5 text-xs sm:text-sm font-sans font-medium"
            >
              <Play className="w-3.5 h-3.5" />
              Focus Mode
            </Link>
            <Link
              href="/habits"
              className="btn-secondary-sendlinks h-[38px] px-4 flex items-center gap-1.5 text-xs sm:text-sm font-sans font-medium border border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A]"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Log Habits
            </Link>
          </div>
        </div>

        {/* Bento Grid of Widgets */}
        <BentoGrid />
      </div>

      {/* Tactile Desk Dock Tray */}
      <QuickDock />
    </>
  );
}
