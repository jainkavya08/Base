"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AddHabitDialog } from "./add-habit-dialog";

export function HabitsTabs() {
  const pathname = usePathname();

  const tabs = [
    { name: "My Habits", href: "/habits" },
    { name: "Stats & Progress", href: "/habits/stats" },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1A1A1A]/10 gap-4 sm:gap-0 pb-px mb-6">
      <div className="flex gap-4 sm:gap-6">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "relative pb-3 text-sm font-sans font-medium transition-colors",
                isActive ? "text-[#1A1A1A]" : "text-[#8A7F72] hover:text-[#1A1A1A]"
              )}
            >
              {tab.name}
              {isActive && (
                <motion.div
                  layoutId="habits-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1A1A1A]"
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
