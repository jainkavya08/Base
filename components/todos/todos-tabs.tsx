"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function TodosTabs() {
  const pathname = usePathname();
  
  const tabs = [
    { name: "Todos", href: "/todos", match: (p: string) => p === "/todos" || p.startsWith("/todos/") && !p.includes("stats") },
    { name: "Stats & Progress", href: "/todos/stats", match: (p: string) => p === "/todos/stats" }
  ];

  return (
    <div className="flex items-center gap-1 border-b border-border/50 pb-[1px]">
      {tabs.map((tab) => {
        const isActive = tab.match(pathname);
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              "relative px-6 py-3 text-sm font-medium transition-colors",
              isActive ? "text-ink" : "text-ink-muted hover:text-ink"
            )}
          >
            {tab.name}
            {isActive && (
              <motion.div
                layoutId="todos-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
