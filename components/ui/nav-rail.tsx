"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/habits", icon: CheckCircle, label: "Habits" },
  { href: "/pomodoro", icon: Timer, label: "Pomodoro" },
  { href: "/todos", icon: ListTodo, label: "Todos" },
  { href: "/reminders", icon: Bell, label: "Reminders" },
  { href: "/finance", icon: Wallet, label: "Finance" },
];

export function NavRail() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 h-full w-16 md:w-20 bg-surface-card border-r border-border flex flex-col items-center py-6 shadow-sm z-50">
      <div className="flex-1 flex flex-col gap-6 w-full items-center">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
                isActive
                  ? "bg-accent-yellow text-surface-dark shadow-sm"
                  : "text-ink-muted hover:bg-canvas hover:text-ink"
              )}
            >
              <item.icon
                className={cn("w-5 h-5", isActive ? "fill-current" : "")}
              />
            </Link>
          );
        })}
      </div>
      
      <div className="mt-auto w-full flex justify-center">
        <Link
          href="/settings"
          title="Settings"
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
            pathname === "/settings"
              ? "bg-accent-yellow text-surface-dark shadow-sm"
              : "text-ink-muted hover:bg-canvas hover:text-ink"
          )}
        >
          <Settings
            className={cn(
              "w-5 h-5",
              pathname === "/settings" ? "fill-current" : ""
            )}
          />
        </Link>
      </div>
    </nav>
  );
}
