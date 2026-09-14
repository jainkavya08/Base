"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Repeat, Calendar, CheckCircle2, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { format, parseISO } from "date-fns";
import { AddRecurringDialog } from "../dialogs/add-recurring-dialog";

export function RecurringTab() {
  const recurring = useLiveQuery(() => db.recurringPayments.toArray());
  const accounts = useLiveQuery(() => db.bankAccounts.toArray());

  if (!recurring || !accounts) return null;

  const activeRecurring = recurring.filter(r => r.isActive);
  const totalMonthly = activeRecurring.reduce((acc, curr) => {
    if (curr.frequency === 'monthly') return acc + curr.amount;
    if (curr.frequency === 'weekly') return acc + (curr.amount * 4.33);
    if (curr.frequency === 'yearly') return acc + (curr.amount / 12);
    if (curr.frequency === 'daily') return acc + (curr.amount * 30);
    return acc;
  }, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-medium text-ink">Recurring Payments</h2>
          <p className="text-sm text-ink-muted mt-1">Manage subscriptions and repeating bills.</p>
        </div>
        <AddRecurringDialog />
      </div>

      <div className="bg-surface-card rounded-2xl border border-border/50 p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-accent-coral/10 text-accent-coral flex items-center justify-center shrink-0">
          <Repeat className="w-8 h-8" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-ink-muted text-sm font-medium mb-1">Estimated Monthly Cost</p>
          <h3 className="text-3xl font-medium text-ink">{formatCurrency(totalMonthly)}</h3>
        </div>
        <div className="flex gap-8 border-t sm:border-t-0 sm:border-l border-border/50 pt-4 sm:pt-0 sm:pl-8">
          <div>
            <p className="text-ink-muted text-xs uppercase tracking-wider mb-1">Active</p>
            <p className="text-xl font-medium text-ink">{activeRecurring.length}</p>
          </div>
          <div>
            <p className="text-ink-muted text-xs uppercase tracking-wider mb-1">Total</p>
            <p className="text-xl font-medium text-ink">{recurring.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recurring.length > 0 ? (
          recurring.map((item) => {
            const acc = accounts.find(a => a.id === item.accountId);
            return (
              <div key={item.id} className={`bg-surface-card rounded-2xl p-6 border ${item.isActive ? 'border-border/50 shadow-sm' : 'border-dashed border-border opacity-60'} relative group`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-ink text-lg">{item.name}</h3>
                    <p className="text-sm text-ink-muted flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      <span className="capitalize">{item.frequency}</span>
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${item.isActive ? 'bg-accent-green/10 text-accent-green' : 'bg-ink-muted/10 text-ink-muted'}`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-2xl font-medium text-ink">{formatCurrency(item.amount)}</p>
                  <p className="text-xs text-ink-muted mt-1">{item.categoryId} • {acc?.name || 'Unknown Account'}</p>
                </div>
                
                <div className="bg-canvas rounded-lg p-3 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-sm text-ink-muted">
                    <Calendar className="w-4 h-4" />
                    <span>Next Due:</span>
                  </div>
                  <span className="font-medium text-ink">{format(parseISO(item.nextDueDate), "MMM d, yyyy")}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-20 bg-surface-card rounded-2xl border border-dashed border-border flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-canvas flex items-center justify-center mb-4">
              <Repeat className="w-8 h-8 text-ink-muted" />
            </div>
            <h3 className="text-lg font-medium text-ink">No recurring payments</h3>
            <p className="text-ink-muted mt-1 max-w-sm mx-auto mb-6">
              Track your subscriptions, rent, or recurring bills to forecast your expenses.
            </p>
            <AddRecurringDialog />
          </div>
        )}
      </div>
    </div>
  );
}
