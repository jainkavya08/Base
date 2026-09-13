"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";

export function PomodoroTabs() {
  const pathname = usePathname();

  const tabs = [
    { name: "Pomodoro", href: "/pomodoro" },
    { name: "Stats & Progress", href: "/pomodoro/stats" },
  ];

  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-px">
      <div className="flex gap-6">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="relative pb-3 text-sm font-medium transition-colors"
            >
              <span className={isActive ? "text-ink" : "text-ink-muted hover:text-ink"}>
                {tab.name}
              </span>
              {isActive && (
                <motion.div
                  layoutId="pomodoro-tab-indicator"
                  className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-accent-blue"
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
