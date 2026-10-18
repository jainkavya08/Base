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
      <div className="bg-[#FDFAF4] rounded-[6px] p-5 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] h-full min-h-[140px] flex flex-col justify-between">
        <div>
          <span className="badge-sendlinks mb-2">TOTAL</span>
          <p className="text-[#8A7F72] text-xs font-mono uppercase tracking-wider mb-1">Total Balance</p>
          <h2 className="font-serif italic font-normal text-3xl text-[#1A1A1A]">{formatCurrency(totalBalance)}</h2>
        </div>
        <div className="mt-4 flex items-center text-xs font-mono text-[#8A7F72] gap-1.5">
          <Wallet className="w-3.5 h-3.5" /> No active accounts
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
    <div className="relative h-full min-h-[140px] group rounded-[6px] overflow-hidden border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "absolute inset-0 p-5 flex flex-col justify-between cursor-grab active:cursor-grabbing",
            currentCard.type === 'total' 
              ? "bg-[#FDFAF4] text-[#1A1A1A]" 
              : "bg-[#1A1A1A] text-[#FDFAF4]"
          )}
          style={currentCard.type === 'account' && (currentCard as any).color ? {
            borderLeft: `4px solid ${(currentCard as any).color}`
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
              <span className={cn(
                "inline-block px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider font-semibold border rounded-[2px] mb-1.5",
                currentCard.type === 'total'
                  ? "bg-[#FFE14D] text-[#1A1A1A] border-[#1A1A1A]"
                  : "bg-[#FF4D00] text-white border-[#1A1A1A]"
              )}>
                {currentCard.type === 'total' ? 'PORTFOLIO' : 'ACCOUNT'}
              </span>
              <p className={cn(
                "text-xs font-mono uppercase tracking-wider",
                currentCard.type === 'total' ? "text-[#8A7F72]" : "text-[#FDFAF4]/70"
              )}>
                {currentCard.type === 'total' ? 'Total Balance' : currentCard.name}
              </p>
              
              {currentCard.type === 'account' && (
                <h3 className="font-mono text-xs text-[#FDFAF4]/90 mt-0.5">
                  {(currentCard as any).accountNumberLast4 ? `•••• ${(currentCard as any).accountNumberLast4}` : (currentCard as any).accountType}
                </h3>
              )}
            </div>

            {currentCard.type === 'account' && (currentCard as any).color && (
              <div className="w-3.5 h-3.5 rounded-[2px] border border-white/40 shadow-sm" style={{ backgroundColor: (currentCard as any).color }} />
            )}
          </div>

          <div className="mt-4 flex items-end justify-between gap-4">
            <h2 className={cn(
              "font-serif italic font-normal pointer-events-none truncate min-w-0 flex-1",
              currentCard.type === 'total' ? "text-3xl md:text-4xl text-[#1A1A1A]" : "text-2xl text-[#FDFAF4]"
            )}>
              {formatCurrency(currentCard.balance)}
            </h2>
            
            {/* Inline Indicators at bottom right */}
            <div className="flex gap-1.5 mb-1 pointer-events-auto">
              {cards.map((_, idx) => (
                <button
                  key={idx} 
                  className={cn(
                    "h-1.5 rounded-[2px] transition-all duration-200 cursor-pointer border",
                    idx === currentIndex 
                      ? (currentCard.type === 'total' ? "w-4 bg-[#FF4D00] border-[#1A1A1A]" : "w-4 bg-[#FFE14D] border-white") 
                      : (currentCard.type === 'total' ? "w-2 bg-[#1A1A1A]/20 border-transparent hover:bg-[#1A1A1A]/40" : "w-2 bg-white/30 border-transparent hover:bg-white/60")
                  )}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to card ${idx + 1}`}
                />
              ))}
            </div>
          </div>
          
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
