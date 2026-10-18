"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function TodosTabs() {
  const pathname = usePathname();
  
  const tabs = [
    { name: "Todos", href: "/todos", match: (p: string) => p === "/todos" || (p.startsWith("/todos/") && !p.includes("stats")) },
    { name: "Stats & Progress", href: "/todos/stats", match: (p: string) => p === "/todos/stats" }
  ];

  return (
    <div className="flex items-center gap-6 border-b border-[#1A1A1A]/10 pb-px mb-2">
      {tabs.map((tab) => {
        const isActive = tab.match(pathname);
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
                layoutId="todos-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1A1A1A]"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
