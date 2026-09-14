"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  CheckCircle,
  Timer,
  ListTodo,
  Bell,
  Wallet,
  Settings,
  Menu,
  X
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNav = () => setIsMobileMenuOpen(false);

  const renderDesktopItem = (item: { href: string; icon: any; label: string }) => {
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
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 flex-col gap-4 z-50">
        {/* Primary Pill */}
        <div className="w-16 bg-surface-card rounded-[32px] py-3 flex flex-col items-center gap-3 shadow-sm border border-border/50">
          {PRIMARY_ITEMS.map(renderDesktopItem)}
        </div>

        {/* Secondary Pill */}
        <div className="w-16 bg-surface-card rounded-[32px] py-3 flex flex-col items-center gap-3 shadow-sm border border-border/50">
          {SECONDARY_ITEMS.map(renderDesktopItem)}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-card border-t border-border/50 z-50 flex items-center justify-around px-2 py-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
        {PRIMARY_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNav}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors flex-1",
                isActive ? "text-accent-yellow" : "text-ink-muted hover:text-ink"
              )}
            >
              <item.icon
                className={cn("w-6 h-6", isActive ? "fill-current" : "")}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors flex-1",
            isMobileMenuOpen ? "text-ink" : "text-ink-muted hover:text-ink"
          )}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" strokeWidth={2} />
          ) : (
            <Menu className="w-6 h-6" strokeWidth={2} />
          )}
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>

      {/* Mobile More Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-surface-dark/80 backdrop-blur-sm" onClick={handleNav}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute bottom-[80px] left-4 right-4 bg-surface-card border border-border/50 rounded-3xl p-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-2 px-2">More Options</h3>
                {SECONDARY_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleNav}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl transition-colors",
                        isActive ? "bg-surface-dark text-accent-yellow" : "text-ink hover:bg-canvas"
                      )}
                    >
                      <item.icon className={cn("w-6 h-6", isActive ? "fill-current" : "")} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
