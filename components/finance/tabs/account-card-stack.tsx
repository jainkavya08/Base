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
  const cards = [
    { id: 'total', name: 'Total Balance', balance: totalBalance, type: 'total' },
    ...activeAccounts.map(a => ({ ...a, type: 'account' }))
  ];

  if (activeAccounts.length === 0) {
    return (
      <div className="bg-surface-card rounded-2xl p-6 shadow-sm border border-border/50 h-full min-h-[200px] flex flex-col justify-between">
        <div>
          <p className="text-ink-muted text-xs font-medium uppercase tracking-wider mb-1">Total Balance</p>
          <h2 className="text-3xl font-medium text-ink">{formatCurrency(totalBalance)}</h2>
        </div>
        <div className="mt-4 flex items-center text-xs text-ink-muted gap-1">
          <Wallet className="w-3 h-3" /> No active accounts
        </div>
      </div>
    );
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const currentCard = cards[currentIndex];

  return (
    <div className="relative h-full min-h-[200px] group rounded-2xl overflow-hidden shadow-sm">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "absolute inset-0 p-6 flex flex-col justify-between border cursor-grab active:cursor-grabbing",
            currentCard.type === 'total' 
              ? "bg-surface-card border-border/50 text-ink" 
              : "bg-surface-dark border-transparent text-surface-dark-foreground"
          )}
          style={currentCard.type === 'account' && (currentCard as any).color ? {
            // Apply a subtle gradient of the bank's accent color to the dark card
            backgroundImage: `linear-gradient(to bottom right, ${(currentCard as any).color}25, transparent)`
          } : {}}
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
              <p className={cn(
                "text-xs font-medium uppercase tracking-wider mb-1",
                currentCard.type === 'total' ? "text-ink-muted" : "text-surface-dark-foreground/70"
              )}>
                {currentCard.type === 'total' ? 'Total Balance' : currentCard.name}
              </p>
              
              {currentCard.type === 'account' && (
                <h3 className="font-medium text-base">
                  {(currentCard as any).accountNumberLast4 ? `•••• ${(currentCard as any).accountNumberLast4}` : (currentCard as any).accountType}
                </h3>
              )}
            </div>

            {currentCard.type === 'account' && (currentCard as any).color && (
              <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: (currentCard as any).color }} />
            )}
            
            {/* Navigation Controls (Visible on hover for desktop) */}
            <div className="flex flex-col gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity pointer-events-auto">
              <button 
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded transition-colors",
                  currentCard.type === 'total' 
                    ? "bg-canvas hover:bg-canvas-elevated text-ink-muted hover:text-ink"
                    : "bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
                )}
                aria-label="Previous card"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded transition-colors",
                  currentCard.type === 'total' 
                    ? "bg-canvas hover:bg-canvas-elevated text-ink-muted hover:text-ink"
                    : "bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
                )}
                aria-label="Next card"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 pointer-events-none">
            <h2 className={cn(
              "font-medium",
              currentCard.type === 'total' ? "text-4xl" : "text-3xl"
            )}>
              {formatCurrency(currentCard.balance)}
            </h2>
          </div>
          
        </motion.div>
      </AnimatePresence>

      {/* Fixed Indicators at the bottom */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1 z-20 pointer-events-none">
        {cards.map((_, idx) => (
          <div 
            key={idx} 
            className={cn(
              "h-1 rounded-full transition-all duration-300 pointer-events-auto cursor-pointer shadow-sm",
              idx === currentIndex 
                ? (currentCard.type === 'total' ? "w-4 bg-accent" : "w-4 bg-white") 
                : (currentCard.type === 'total' ? "w-1.5 bg-border hover:bg-ink-muted" : "w-1.5 bg-white/30 hover:bg-white/60")
            )}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to card ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
