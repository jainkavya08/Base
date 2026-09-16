"use client";

import { BentoGrid } from "@/components/home/bento-grid";
import { format } from "date-fns";
import { useAppStore } from "@/lib/store";

import { QuickDock } from "@/components/home/quick-dock";

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
      <div className="p-4 md:p-8 max-w-7xl mx-auto h-full flex flex-col gap-6 md:gap-8 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-medium text-ink">{getGreeting(name)}</h1>
            <p className="text-ink-muted mt-1">{format(today, "EEEE, MMMM do")}</p>
          </div>
        </div>

        <BentoGrid />
      </div>
      <QuickDock />
    </>
  );
}
