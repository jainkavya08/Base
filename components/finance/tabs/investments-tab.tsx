"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { TrendingUp, PieChart, TrendingDown, MoreHorizontal, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { AddInvestmentDialog } from "../dialogs/add-investment-dialog";

export function InvestmentsTab() {
  const investments = useLiveQuery(() => db.investments.toArray());

  if (!investments) return null;

  const totalInvested = investments.reduce((acc, curr) => acc + curr.investedAmount, 0);
  const totalCurrent = investments.reduce((acc, curr) => acc + curr.currentValue, 0);
  const totalGain = totalCurrent - totalInvested;
  const totalGainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-medium text-ink">Investments</h2>
          <p className="text-sm text-ink-muted mt-1">Track your portfolio and assets.</p>
        </div>
        <AddInvestmentDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-card rounded-2xl p-6 border border-border/50 shadow-sm md:col-span-2">
          <p className="text-ink-muted text-sm font-medium mb-1">Total Portfolio Value</p>
          <div className="flex items-end gap-4 mb-4">
            <h2 className="text-4xl font-medium text-ink">{formatCurrency(totalCurrent)}</h2>
            <div className={`flex items-center gap-1 text-sm font-medium pb-1 ${totalGain >= 0 ? 'text-accent-green' : 'text-accent-coral'}`}>
              {totalGain >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {formatCurrency(Math.abs(totalGain))} ({Math.abs(totalGainPercentage).toFixed(2)}%)
            </div>
          </div>
          <p className="text-xs text-ink-muted">Total Invested: {formatCurrency(totalInvested)}</p>
        </div>

        <div className="bg-surface-dark text-surface-card rounded-2xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-accent-green/20 rounded-full blur-2xl" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <p className="text-surface-card/60 text-sm font-medium mb-1">Asset Classes</p>
              <h3 className="text-2xl font-medium">{new Set(investments.map(i => i.type)).size}</h3>
            </div>
            <div className="mt-4 flex items-center text-xs text-surface-card/80 gap-1">
              <PieChart className="w-3 h-3" /> Across {investments.length} individual assets
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border/50 bg-canvas flex justify-between items-center">
          <h3 className="font-medium text-ink">Your Assets</h3>
        </div>
        
        {investments.length > 0 ? (
          <div className="divide-y divide-border/50">
            {investments.sort((a, b) => b.currentValue - a.currentValue).map((inv) => {
              const gain = inv.currentValue - inv.investedAmount;
              const gainPercent = inv.investedAmount > 0 ? (gain / inv.investedAmount) * 100 : 0;
              
              return (
                <div key={inv.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-canvas transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent-green/10 text-accent-green flex items-center justify-center shrink-0">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-medium text-ink">{inv.name}</h4>
                      <p className="text-xs text-ink-muted mt-0.5">{inv.type} {inv.platform ? `• ${inv.platform}` : ''}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8 justify-between sm:justify-end">
                    <div className="text-right">
                      <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">Invested</p>
                      <p className="font-medium text-ink">{formatCurrency(inv.investedAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">Current</p>
                      <p className="font-medium text-ink">{formatCurrency(inv.currentValue)}</p>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">Returns</p>
                      <div className={`font-medium flex items-center justify-end gap-1 ${gain >= 0 ? 'text-accent-green' : 'text-accent-coral'}`}>
                        {gain >= 0 ? '+' : ''}{gainPercent.toFixed(1)}%
                      </div>
                    </div>
                    <button className="text-ink-muted hover:text-ink p-1">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-full bg-canvas flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-ink-muted" />
            </div>
            <h3 className="text-lg font-medium text-ink">No investments tracked</h3>
            <p className="text-ink-muted mt-1 max-w-sm mx-auto mb-4">
              Add your stocks, mutual funds, crypto, or real estate to see your total net worth.
            </p>
            <AddInvestmentDialog />
          </div>
        )}
      </div>
    </div>
  );
}
