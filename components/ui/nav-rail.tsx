"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  CheckCircle,
  Timer,
  ListTodo,
  Bell,
  Wallet,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PRIMARY_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/habits", icon: CheckCircle, label: "Habits" },
  { href: "/pomodoro", icon: Timer, label: "Pomodoro" },
  { href: "/todos", icon: ListTodo, label: "Todos" },
];

const SECONDARY_ITEMS = [
  { href: "/reminders", icon: Bell, label: "Reminders" },
  { href: "/finance", icon: Wallet, label: "Finance" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function NavRail() {
  const pathname = usePathname();

  const renderItem = (item: { href: string; icon: any; label: string }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        title={item.label}
        className={cn(
          "relative w-12 h-12 flex items-center justify-center transition-colors z-10 rounded-full",
          isActive ? "text-accent-yellow" : "text-ink-muted hover:text-ink"
        )}
      >
        {isActive && (
          <motion.div
            layoutId="nav-pill"
            className="absolute inset-0 bg-surface-dark rounded-full z-0"
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        )}
        <item.icon
          className={cn("w-[22px] h-[22px] relative z-10", isActive ? "fill-current" : "")}
          strokeWidth={isActive ? 2.5 : 2}
        />
      </Link>
    );
  };

  return (
    <nav className="fixed left-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
      {/* Primary Pill */}
      <div className="w-16 bg-surface-card rounded-[32px] py-3 flex flex-col items-center gap-3 shadow-sm border border-border/50">
        {PRIMARY_ITEMS.map(renderItem)}
      </div>

      {/* Secondary Pill */}
      <div className="w-16 bg-surface-card rounded-[32px] py-3 flex flex-col items-center gap-3 shadow-sm border border-border/50">
        {SECONDARY_ITEMS.map(renderItem)}
      </div>
    </nav>
  );
}
