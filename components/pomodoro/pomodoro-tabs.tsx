"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function PomodoroTabs() {
  const pathname = usePathname();

  const tabs = [
    { name: "Focus Desk", href: "/pomodoro" },
    { name: "Analytics & Logs", href: "/pomodoro/stats" },
  ];

  return (
    <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-px mb-6">
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
                  layoutId="pomodoro-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1A1A1A]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
