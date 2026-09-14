"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Wallet, Landmark, CreditCard, Coins, MoreHorizontal } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { AddAccountDialog } from "../dialogs/add-account-dialog";
import { format, parseISO } from "date-fns";

export function AccountsTab() {
  const accounts = useLiveQuery(() => db.bankAccounts.toArray());
  const transactions = useLiveQuery(() => db.financeTransactions.toArray());

  if (!accounts || !transactions) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-medium text-ink">Bank Accounts</h2>
          <p className="text-sm text-ink-muted mt-1">Manage your accounts, cards, and wallets</p>
        </div>
        <AddAccountDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.filter(a => a.isActive).map(account => {
          const accountTx = transactions.filter(t => t.accountId === account.id);
          
          return (
            <div key={account.id} className="bg-surface-card rounded-2xl p-6 border border-border/50 relative overflow-hidden group shadow-sm">
              {account.color && (
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: account.color }} />
              )}
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-canvas flex items-center justify-center text-ink shadow-sm border border-border/50 overflow-hidden">
                    {account.logo ? (
                      <img src={account.logo} alt={account.bankName} className="w-full h-full object-cover" />
                    ) : (
                      account.accountType === 'Credit Card' ? <CreditCard className="w-5 h-5" /> : 
                      account.accountType === 'Cash / Wallet' ? <Coins className="w-5 h-5" /> : 
                      <Landmark className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-ink">{account.name}</h3>
                    <p className="text-xs text-ink-muted">{account.bankName} {account.accountNumberLast4 ? `• ${account.accountNumberLast4}` : ''}</p>
                  </div>
                </div>
                <button className="text-ink-muted hover:text-ink p-1 rounded-md hover:bg-canvas transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-3xl font-medium text-ink">{formatCurrency(account.balance)}</p>
                <p className="text-xs text-ink-muted mt-1">{account.accountType}</p>
              </div>
              
              <div className="border-t border-border pt-4">
                <p className="text-xs text-ink-muted mb-3 font-medium uppercase tracking-wider">Recent Activity</p>
                {accountTx.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {accountTx.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3).map(tx => (
                      <div key={tx.id} className="flex justify-between items-center">
                        <span className="text-sm text-ink truncate max-w-[150px]">{tx.title || tx.category}</span>
                        <div className="text-right">
                          <span className={`text-sm font-medium ${tx.type === 'income' ? 'text-accent-green' : tx.type === 'expense' ? 'text-ink' : 'text-ink-muted'}`}>
                            {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatCurrency(tx.amount)}
                          </span>
                          <p className="text-[10px] text-ink-muted leading-tight">{format(parseISO(tx.date), "MMM d")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink-muted italic">No recent activity.</p>
                )}
              </div>
            </div>
          );
        })}
        
        {accounts.filter(a => a.isActive).length === 0 && (
          <div className="col-span-full text-center py-16 bg-surface-card rounded-2xl border border-dashed border-border flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-canvas flex items-center justify-center mb-4">
              <Landmark className="w-8 h-8 text-ink-muted" />
            </div>
            <h3 className="text-lg font-medium text-ink">No bank accounts yet</h3>
            <p className="text-ink-muted mt-1 max-w-sm mb-6">Add your first account to start tracking your balances and transactions.</p>
            <AddAccountDialog />
          </div>
        )}
      </div>
    </div>
  );
}
