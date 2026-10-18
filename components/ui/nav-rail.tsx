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
          "relative w-11 h-11 flex items-center justify-center rounded-[4px] transition-transform duration-100 z-10",
          isActive
            ? "bg-[#1A1A1A] text-[#FFE14D] border border-[#1A1A1A] shadow-[2px_2px_0px_0px_#FF4D00]"
            : "text-[#1A1A1A] hover:bg-[#EDE8DC] hover:text-[#1A1A1A] active:translate-x-[1px] active:translate-y-[1px]"
        )}
      >
        <item.icon
          className="w-5 h-5 relative z-10"
          strokeWidth={isActive ? 2.5 : 2}
        />
      </Link>
    );
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 flex-col gap-4 z-50">
        {/* Brand Accent Top Tag */}
        <div className="w-14 bg-[#1A1A1A] text-[#FFE14D] border border-[#1A1A1A] rounded-[4px] py-1.5 flex flex-col items-center shadow-[3px_3px_0px_0px_#FF4D00]">
          <span className="font-serif text-sm font-bold tracking-tight">BASE</span>
        </div>

        {/* Primary Stack */}
        <div className="w-14 bg-[#FDFAF4] rounded-[6px] py-2 flex flex-col items-center gap-2 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
          {PRIMARY_ITEMS.map(renderDesktopItem)}
        </div>

        {/* Secondary Stack */}
        <div className="w-14 bg-[#FDFAF4] rounded-[6px] py-2 flex flex-col items-center gap-2 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
          {SECONDARY_ITEMS.map(renderDesktopItem)}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FDFAF4] border-t-2 border-[#1A1A1A] z-50 flex items-center justify-around px-2 py-2 pb-[calc(8px+env(safe-area-inset-bottom))] shadow-[0px_-3px_0px_0px_#1A1A1A]">
        {PRIMARY_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNav}
              className={cn(
                "flex flex-col items-center gap-1 p-1.5 rounded-[4px] transition-colors flex-1 text-center",
                isActive
                  ? "bg-[#1A1A1A] text-[#FFE14D] border border-[#1A1A1A]"
                  : "text-[#1A1A1A] hover:bg-[#EDE8DC]"
              )}
            >
              <item.icon
                className="w-5 h-5 mx-auto"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-sans font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={cn(
            "flex flex-col items-center gap-1 p-1.5 rounded-[4px] transition-colors flex-1 text-center",
            isMobileMenuOpen ? "bg-[#FFE14D] text-[#1A1A1A] border border-[#1A1A1A]" : "text-[#1A1A1A] hover:bg-[#EDE8DC]"
          )}
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5 mx-auto" strokeWidth={2} />
          ) : (
            <Menu className="w-5 h-5 mx-auto" strokeWidth={2} />
          )}
          <span className="text-[10px] font-sans font-medium">More</span>
        </button>
      </nav>

      {/* Mobile More Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={handleNav}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute bottom-[75px] left-3 right-3 bg-[#FDFAF4] border-2 border-[#1A1A1A] rounded-[6px] p-4 shadow-[6px_6px_0px_0px_#1A1A1A]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#1A1A1A]/20">
                  <span className="badge-sendlinks">MORE DESTINATIONS</span>
                </div>
                {SECONDARY_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleNav}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-[4px] border transition-transform",
                        isActive
                          ? "bg-[#1A1A1A] text-[#FFE14D] border-[#1A1A1A] shadow-[2px_2px_0px_0px_#FF4D00]"
                          : "bg-[#FDFAF4] text-[#1A1A1A] border-[#1A1A1A] hover:bg-[#EDE8DC]"
                      )}
                    >
                      <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                      <span className="font-sans font-medium text-sm">{item.label}</span>
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
