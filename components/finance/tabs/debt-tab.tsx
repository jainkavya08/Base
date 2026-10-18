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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-sendlinks">LIABILITIES</span>
          </div>
          <h2 className="font-serif italic font-normal text-2xl md:text-3xl text-[#1A1A1A]">Debt & Loans</h2>
          <p className="text-xs font-sans text-[#8A7F72] mt-0.5">Track money you owe and money owed to you.</p>
        </div>
        <AddDebtDialog />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        <div className="bg-[#FDFAF4] rounded-[6px] p-5 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] relative overflow-hidden box-border max-w-full">
          <span className="badge-sendlinks mb-2">LIABILITY</span>
          <p className="text-[#8A7F72] text-xs font-mono uppercase tracking-wider mb-1">Total Owed by You</p>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h2 className="font-serif italic font-normal text-3xl md:text-4xl text-[#1A1A1A] truncate">{formatCurrency(totalOwedByYou)}</h2>
            <div className="w-8 h-8 shrink-0 rounded-[4px] bg-[#FF4D00] text-white border border-[#1A1A1A] shadow-[1px_1px_0px_0px_#1A1A1A] flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-xs font-mono text-[#8A7F72]">Across {owedByYou.length} active records</p>
        </div>

        <div className="bg-[#FDFAF4] rounded-[6px] p-5 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] relative overflow-hidden box-border max-w-full">
          <span className="badge-sendlinks mb-2">RECEIVABLE</span>
          <p className="text-[#8A7F72] text-xs font-mono uppercase tracking-wider mb-1">Total Owed to You</p>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h2 className="font-serif italic font-normal text-3xl md:text-4xl text-[#1A1A1A] truncate">{formatCurrency(totalOwedToYou)}</h2>
            <div className="w-8 h-8 shrink-0 rounded-[4px] bg-[#FFE14D] text-[#1A1A1A] border border-[#1A1A1A] shadow-[1px_1px_0px_0px_#1A1A1A] flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-[#1A1A1A]" />
            </div>
          </div>
          <p className="text-xs font-mono text-[#8A7F72]">Across {owedToYou.length} active records</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* I Owe */}
        <div>
          <h3 className="font-serif italic font-normal text-xl text-[#1A1A1A] mb-3 flex items-center gap-2">
            <HandCoins className="w-4 h-4 text-[#FF4D00]" /> I Owe
          </h3>
          <div className="flex flex-col gap-3">
            {owedByYou.length > 0 ? owedByYou.map(debt => {
              const progress = ((debt.originalAmount - debt.remainingAmount) / debt.originalAmount) * 100;
              return (
                <div 
                  key={debt.id} 
                  className="bg-[#FDFAF4] p-4 rounded-[6px] border border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A] cursor-pointer hover:translate-x-0.5 transition-transform"
                  onClick={() => setSelectedDebt(debt)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-sm text-[#1A1A1A]">{debt.title}</h4>
                      <p className="text-xs font-mono text-[#8A7F72] mt-0.5">{debt.personOrOrganization || debt.person}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif italic font-normal text-xl text-[#1A1A1A]">{formatCurrency(debt.remainingAmount)}</p>
                      <p className="text-[10px] font-mono text-[#8A7F72]">of {formatCurrency(debt.originalAmount)}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] font-mono text-[#8A7F72] mb-1">
                      <span>{progress.toFixed(0)}% Repaid</span>
                    </div>
                    <div className="h-2 rounded-[2px] bg-[#F5F0E8] border border-[#1A1A1A] overflow-hidden">
                      <div className="h-full bg-[#1A1A1A]" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  {debt.dueDate && (
                    <div className="mt-2.5 text-[10px] font-mono text-[#8A7F72] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Due {format(parseISO(debt.dueDate), "MMM d, yyyy")}
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="p-8 text-center bg-[#FDFAF4] rounded-[6px] border border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A]">
                <p className="text-xs font-mono text-[#8A7F72]">You're completely debt free! 🎉</p>
              </div>
            )}
          </div>
        </div>

        {/* Owed to Me */}
        <div>
          <h3 className="font-serif italic font-normal text-xl text-[#1A1A1A] mb-3 flex items-center gap-2">
            <HandCoins className="w-4 h-4 text-[#1A1A1A]" /> Owed to Me
          </h3>
          <div className="flex flex-col gap-3">
            {owedToYou.length > 0 ? owedToYou.map(debt => {
              const progress = ((debt.originalAmount - debt.remainingAmount) / debt.originalAmount) * 100;
              return (
                <div 
                  key={debt.id} 
                  className="bg-[#FDFAF4] p-4 rounded-[6px] border border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A] cursor-pointer hover:translate-x-0.5 transition-transform"
                  onClick={() => setSelectedDebt(debt)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-sm text-[#1A1A1A]">{debt.title}</h4>
                      <p className="text-xs font-mono text-[#8A7F72] mt-0.5">{debt.personOrOrganization || debt.person}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif italic font-normal text-xl text-[#1A1A1A]">{formatCurrency(debt.remainingAmount)}</p>
                      <p className="text-[10px] font-mono text-[#8A7F72]">of {formatCurrency(debt.originalAmount)}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] font-mono text-[#8A7F72] mb-1">
                      <span>{progress.toFixed(0)}% Received</span>
                    </div>
                    <div className="h-2 rounded-[2px] bg-[#F5F0E8] border border-[#1A1A1A] overflow-hidden">
                      <div className="h-full bg-[#FFE14D]" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  {debt.dueDate && (
                    <div className="mt-2.5 text-[10px] font-mono text-[#8A7F72] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Due {format(parseISO(debt.dueDate), "MMM d, yyyy")}
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="p-8 text-center bg-[#FDFAF4] rounded-[6px] border border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A]">
                <p className="text-xs font-mono text-[#8A7F72]">Nobody owes you any money.</p>
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
