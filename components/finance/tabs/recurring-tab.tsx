"use client";

import useSWR, { mutate } from "swr";
import { fetcher, fetchApi } from "@/lib/api";
import { format, isPast, parseISO } from "date-fns";
import { Repeat, Calendar, CreditCard, Trash2, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { AddRecurringDialog } from "../dialogs/add-recurring-dialog";

export function RecurringTab() {
  const { data: recData } = useSWR('/api/finance/recurring.php', fetcher);
  const { data: accData } = useSWR('/api/finance/accounts.php', fetcher);
  
  const recurring: any[] = recData?.recurring;
  const accounts: any[] = accData?.accounts;

  if (!recurring || !accounts) return null;

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this recurring payment?")) {
      await fetchApi(`/api/finance/recurring.php?id=${id}`, { method: 'DELETE' });
      mutate('/api/finance/recurring.php');
    }
  };

  const activeRecurring = recurring.filter(r => r.isActive);
  const totalMonthly = activeRecurring.reduce((acc, curr) => {
    if (curr.frequency === 'monthly') return acc + curr.amount;
    if (curr.frequency === 'weekly') return acc + (curr.amount * 4.33);
    if (curr.frequency === 'yearly') return acc + (curr.amount / 12);
    if (curr.frequency === 'daily') return acc + (curr.amount * 30);
    return acc;
  }, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-sendlinks">SUBSCRIPTIONS</span>
          </div>
          <h2 className="font-serif italic font-normal text-2xl md:text-3xl text-[#1A1A1A]">Recurring Payments</h2>
          <p className="text-xs font-sans text-[#8A7F72] mt-0.5">Manage subscriptions and repeating bills.</p>
        </div>
        <AddRecurringDialog />
      </div>

      <div className="bg-[#FDFAF4] rounded-[6px] border border-[#1A1A1A] p-5 flex flex-col sm:flex-row items-center gap-5 shadow-[4px_4px_0px_0px_#1A1A1A]">
        <div className="w-12 h-12 rounded-[4px] bg-[#FFE14D] border border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] text-[#1A1A1A] flex items-center justify-center shrink-0">
          <Repeat className="w-6 h-6" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-[#8A7F72] text-xs font-mono uppercase tracking-wider mb-1">Estimated Monthly Cost</p>
          <h3 className="font-serif italic font-normal text-3xl text-[#1A1A1A]">{formatCurrency(totalMonthly)}</h3>
        </div>
        <div className="flex gap-6 border-t sm:border-t-0 sm:border-l border-[#1A1A1A]/10 pt-3 sm:pt-0 sm:pl-6">
          <div>
            <p className="text-[#8A7F72] text-xs font-mono uppercase tracking-wider mb-1">Active</p>
            <p className="font-mono text-xl font-medium text-[#1A1A1A]">{activeRecurring.length}</p>
          </div>
          <div>
            <p className="text-[#8A7F72] text-xs font-mono uppercase tracking-wider mb-1">Total</p>
            <p className="font-mono text-xl font-medium text-[#1A1A1A]">{recurring.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recurring.length > 0 ? (
          recurring.map((item) => {
            const acc = accounts.find(a => a.id === item.accountId);
            return (
              <div key={item.id} className={`bg-[#FDFAF4] rounded-[6px] p-5 border border-[#1A1A1A] ${item.isActive ? 'shadow-[4px_4px_0px_0px_#1A1A1A]' : 'opacity-60 shadow-[2px_2px_0px_0px_#1A1A1A]'} relative group flex flex-col justify-between`}>
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-[#1A1A1A] text-base">{item.name}</h3>
                      <p className="text-xs font-mono text-[#8A7F72] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span className="capitalize">{item.frequency}</span>
                      </p>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded-[2px] border text-[10px] font-mono uppercase tracking-wider ${item.isActive ? 'bg-[#FFE14D] border-[#1A1A1A] text-[#1A1A1A]' : 'bg-[#F5F0E8] border-[#1A1A1A]/30 text-[#8A7F72]'}`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="font-serif italic font-normal text-2xl text-[#1A1A1A]">{formatCurrency(item.amount)}</p>
                    <p className="text-xs font-mono text-[#8A7F72] mt-0.5">{item.categoryId} • {acc?.name || 'Unknown Account'}</p>
                  </div>
                </div>
                
                <div className="bg-[#F5F0E8] rounded-[4px] border border-[#1A1A1A]/20 p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[#8A7F72] font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Next Due:</span>
                  </div>
                  <span className="font-mono font-medium text-[#1A1A1A]">{format(parseISO(item.nextDueDate), "MMM d, yyyy")}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-16 bg-[#FDFAF4] rounded-[6px] border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] flex flex-col items-center">
            <div className="w-12 h-12 rounded-[4px] bg-[#F5F0E8] border border-[#1A1A1A] flex items-center justify-center mb-3">
              <Repeat className="w-6 h-6 text-[#8A7F72]" />
            </div>
            <h3 className="font-serif italic font-normal text-xl text-[#1A1A1A]">No recurring payments</h3>
            <p className="text-xs text-[#8A7F72] mt-1 max-w-sm mx-auto mb-5">
              Track your subscriptions, rent, or recurring bills to forecast your expenses.
            </p>
            <AddRecurringDialog />
          </div>
        )}
      </div>
    </div>
  );
}
