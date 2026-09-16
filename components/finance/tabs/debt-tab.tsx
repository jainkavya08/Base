"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher, fetchApi } from "@/lib/api";
import { Landmark, ArrowUpRight, ArrowDownRight, BadgeDollarSign, ShieldAlert, Trash2, HandCoins, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { format, parseISO } from "date-fns";
import { AddDebtDialog } from "../dialogs/add-debt-dialog";
import { DebtDetailDialog } from "../dialogs/debt-detail-dialog";
import { Progress } from "@/components/ui/progress";

export function DebtTab() {
  const [selectedDebt, setSelectedDebt] = useState<any>(null);
  const { data } = useSWR('/api/finance/debts.php', fetcher);
  const debts: any[] = data?.debts;

  if (!debts) return null;

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this debt record?")) {
      await fetchApi(`/api/finance/debts.php?id=${id}`, { method: 'DELETE' });
      mutate('/api/finance/debts.php');
    }
  };

  const owedByYou = debts.filter(d => d.type === 'owed_by_you' && d.status !== 'paid');
  const owedToYou = debts.filter(d => d.type === 'owed_to_you' && d.status !== 'paid');

  const totalOwedByYou = owedByYou.reduce((acc, curr) => acc + curr.remainingAmount, 0);
  const totalOwedToYou = owedToYou.reduce((acc, curr) => acc + curr.remainingAmount, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-medium text-ink">Debt & Loans</h2>
          <p className="text-sm text-ink-muted mt-1">Track money you owe and money owed to you.</p>
        </div>
        <AddDebtDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-card rounded-2xl p-6 border border-border/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-accent-coral/10 rounded-full blur-2xl" />
          <p className="text-ink-muted text-sm font-medium mb-1">Total Owed by You</p>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-4xl font-medium text-ink">{formatCurrency(totalOwedByYou)}</h2>
            <div className="w-8 h-8 rounded-full bg-accent-coral/20 text-accent-coral flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-ink-muted">Across {owedByYou.length} active records</p>
        </div>

        <div className="bg-surface-card rounded-2xl p-6 border border-border/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-accent-green/10 rounded-full blur-2xl" />
          <p className="text-ink-muted text-sm font-medium mb-1">Total Owed to You</p>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-4xl font-medium text-ink">{formatCurrency(totalOwedToYou)}</h2>
            <div className="w-8 h-8 rounded-full bg-accent-green/20 text-accent-green flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-ink-muted">Across {owedToYou.length} active records</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* I Owe */}
        <div>
          <h3 className="text-lg font-medium text-ink mb-4 flex items-center gap-2">
            <HandCoins className="w-5 h-5 text-accent-coral" /> I Owe
          </h3>
          <div className="flex flex-col gap-4">
            {owedByYou.length > 0 ? owedByYou.map(debt => {
              const progress = ((debt.originalAmount - debt.remainingAmount) / debt.originalAmount) * 100;
              return (
                <div 
                  key={debt.id} 
                  className="bg-surface-card p-5 rounded-xl border border-border/50 cursor-pointer hover:border-border transition-colors"
                  onClick={() => setSelectedDebt(debt)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-ink">{debt.title}</h4>
                      <p className="text-sm text-ink-muted">{debt.personOrOrganization || debt.person}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-ink">{formatCurrency(debt.remainingAmount)}</p>
                      <p className="text-xs text-ink-muted">remaining of {formatCurrency(debt.originalAmount)}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-ink-muted mb-1">
                      <span>{progress.toFixed(0)}% Paid</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                  {debt.dueDate && (
                    <div className="mt-3 text-xs text-ink-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Due {format(parseISO(debt.dueDate), "MMM d, yyyy")}
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="p-8 text-center bg-surface-card rounded-xl border border-dashed border-border">
                <p className="text-ink-muted text-sm">You're completely debt free! 🎉</p>
              </div>
            )}
          </div>
        </div>

        {/* Owed to Me */}
        <div>
          <h3 className="text-lg font-medium text-ink mb-4 flex items-center gap-2">
            <HandCoins className="w-5 h-5 text-accent-green" /> Owed to Me
          </h3>
          <div className="flex flex-col gap-4">
            {owedToYou.length > 0 ? owedToYou.map(debt => {
              const progress = ((debt.originalAmount - debt.remainingAmount) / debt.originalAmount) * 100;
              return (
                <div 
                  key={debt.id} 
                  className="bg-surface-card p-5 rounded-xl border border-border/50 cursor-pointer hover:border-border transition-colors"
                  onClick={() => setSelectedDebt(debt)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-ink">{debt.title}</h4>
                      <p className="text-sm text-ink-muted">{debt.personOrOrganization || debt.person}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-ink">{formatCurrency(debt.remainingAmount)}</p>
                      <p className="text-xs text-ink-muted">remaining of {formatCurrency(debt.originalAmount)}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-ink-muted mb-1">
                      <span>{progress.toFixed(0)}% Received</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                  {debt.dueDate && (
                    <div className="mt-3 text-xs text-ink-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Due {format(parseISO(debt.dueDate), "MMM d, yyyy")}
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="p-8 text-center bg-surface-card rounded-xl border border-dashed border-border">
                <p className="text-ink-muted text-sm">Nobody owes you any money.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      <DebtDetailDialog 
        debt={selectedDebt} 
        open={!!selectedDebt} 
        onOpenChange={(open) => {
          if (!open) setSelectedDebt(null);
        }} 
      />
    </div>
  );
}
