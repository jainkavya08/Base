"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AddHabitDialog } from "./add-habit-dialog";

export function HabitsTabs() {
  const pathname = usePathname();

  const tabs = [
    { name: "Habits", href: "/habits" },
    { name: "Stats & Progress", href: "/habits/stats" },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 gap-4 sm:gap-0 pb-px mb-8">
      <div className="flex gap-6">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "relative pb-3 text-sm font-medium transition-colors",
                isActive ? "text-ink" : "text-ink-muted hover:text-ink"
              )}
            >
              {tab.name}
              {isActive && (
                <motion.div
                  layoutId="habits-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue rounded-t-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </Link>
          );
        })}
      </div>
      <div className="pb-2">
        <AddHabitDialog />
      </div>
    </div>
  );
}
