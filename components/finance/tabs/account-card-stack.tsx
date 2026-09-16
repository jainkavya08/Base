"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils/currency";
import { ChevronUp, ChevronDown, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface Account {
  id: string;
  name: string;
  balance: number;
  accountType: string;
  accountNumberLast4?: string;
  color?: string;
}

interface AccountCardStackProps {
  accounts: Account[];
  totalBalance: number;
}

export function AccountCardStack({ accounts, totalBalance }: AccountCardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeAccounts = accounts.filter(a => (a as any).isActive !== false);

  if (activeAccounts.length === 0) {
    return (
      <div className="bg-surface-dark text-surface-dark-foreground rounded-2xl p-6 relative overflow-hidden shadow-lg h-[200px] flex flex-col justify-between">
        <div>
          <p className="text-surface-dark-foreground/60 text-sm font-medium mb-1">Total Balance</p>
          <h2 className="text-3xl font-medium">{formatCurrency(totalBalance)}</h2>
        </div>
        <div className="mt-4 flex items-center text-xs text-surface-dark-foreground/80 gap-1">
          <Wallet className="w-3 h-3" /> No active accounts
        </div>
      </div>
    );
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeAccounts.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeAccounts.length) % activeAccounts.length);
  };

  const currentAccount = activeAccounts[currentIndex];

  return (
    <div className="bg-surface-card rounded-2xl p-6 shadow-sm border border-border/50 relative h-full min-h-[220px] flex flex-col justify-between group overflow-hidden">
      {/* Background Accent */}
      {currentAccount.color && (
        <div 
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 transition-colors duration-500" 
          style={{ backgroundColor: currentAccount.color }} 
        />
      )}

      {/* Header: Total Balance remains visible */}
      <div className="flex justify-between items-start z-10 relative">
        <div>
          <p className="text-ink-muted text-xs font-medium uppercase tracking-wider mb-1">Total Balance</p>
          <h2 className="text-2xl font-medium text-ink">{formatCurrency(totalBalance)}</h2>
        </div>
        
        {/* Navigation Controls */}
        {activeAccounts.length > 1 && (
          <div className="flex flex-col gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <button 
              onClick={handlePrev}
              className="w-6 h-6 flex items-center justify-center rounded bg-canvas hover:bg-canvas-elevated text-ink-muted hover:text-ink transition-colors"
              aria-label="Previous account"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button 
              onClick={handleNext}
              className="w-6 h-6 flex items-center justify-center rounded bg-canvas hover:bg-canvas-elevated text-ink-muted hover:text-ink transition-colors"
              aria-label="Next account"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Swipeable Card Stack Area */}
      <div className="relative h-24 mt-4 z-10">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentAccount.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-surface-dark text-surface-dark-foreground rounded-xl p-4 flex flex-col justify-between shadow-md cursor-grab active:cursor-grabbing"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(e, { offset }) => {
              const swipe = offset.y;
              if (swipe < -20) {
                handleNext();
              } else if (swipe > 20) {
                handlePrev();
              }
            }}
          >
            <div className="flex justify-between items-start pointer-events-none">
              <div>
                <h3 className="font-medium text-base truncate max-w-[150px]">{currentAccount.name}</h3>
                <p className="text-xs text-surface-dark-foreground/70">
                  {currentAccount.accountNumberLast4 ? `•••• ${currentAccount.accountNumberLast4}` : currentAccount.accountType}
                </p>
              </div>
              {currentAccount.color && (
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentAccount.color }} />
              )}
            </div>
            <div className="mt-2 text-xl font-medium pointer-events-none">
              {formatCurrency(currentAccount.balance)}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Indicators */}
      {activeAccounts.length > 1 && (
        <div className="flex justify-center gap-1 mt-4 z-10 relative">
          {activeAccounts.map((_, idx) => (
            <div 
              key={idx} 
              className={cn(
                "h-1 rounded-full transition-all duration-300 cursor-pointer",
                idx === currentIndex ? "w-4 bg-accent" : "w-1.5 bg-border hover:bg-ink-muted"
              )}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to account ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
