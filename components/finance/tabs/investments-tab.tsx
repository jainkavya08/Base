"use client";

import useSWR, { mutate } from "swr";
import { fetcher, fetchApi } from "@/lib/api";
import { TrendingUp, LineChart, Shield, ArrowUpRight, ArrowDownRight, Trash2, PieChart, MoreHorizontal } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { AddInvestmentDialog } from "../dialogs/add-investment-dialog";

export function InvestmentsTab() {
  const { data } = useSWR('/api/finance/investments.php', fetcher);
  const investments: any[] = data?.investments;

  if (!investments) return null;

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this investment?")) {
      await fetchApi(`/api/finance/investments.php?id=${id}`, { method: 'DELETE' });
      mutate('/api/finance/investments.php');
    }
  };

  const totalInvested = investments.reduce((acc, curr) => acc + curr.investedAmount, 0);
  const totalCurrent = investments.reduce((acc, curr) => acc + curr.currentValue, 0);
  const totalGain = totalCurrent - totalInvested;
  const totalGainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-sendlinks">PORTFOLIO</span>
          </div>
          <h2 className="font-serif italic font-normal text-2xl md:text-3xl text-[#1A1A1A]">Investments</h2>
          <p className="text-xs font-sans text-[#8A7F72] mt-0.5">Track your portfolio and assets.</p>
        </div>
        <AddInvestmentDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#FDFAF4] rounded-[6px] p-5 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] md:col-span-2">
          <span className="badge-sendlinks mb-2">VALUATION</span>
          <p className="text-[#8A7F72] text-xs font-mono uppercase tracking-wider mb-1">Total Portfolio Value</p>
          <div className="flex items-end gap-3 mb-3">
            <h2 className="font-serif italic font-normal text-3xl md:text-4xl text-[#1A1A1A]">{formatCurrency(totalCurrent)}</h2>
            <div className={`flex items-center gap-1 text-xs font-mono font-medium pb-1 ${totalGain >= 0 ? 'text-[#1A1A1A]' : 'text-[#FF4D00]'}`}>
              {totalGain >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {formatCurrency(Math.abs(totalGain))} ({Math.abs(totalGainPercentage).toFixed(2)}%)
            </div>
          </div>
          <p className="text-xs font-mono text-[#8A7F72]">Total Invested: {formatCurrency(totalInvested)}</p>
        </div>

        <div className="bg-[#1A1A1A] text-[#FDFAF4] rounded-[6px] p-5 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FF4D00] flex flex-col justify-between">
          <div>
            <span className="inline-block px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider font-semibold border rounded-[2px] mb-2 bg-[#FFE14D] text-[#1A1A1A] border-[#1A1A1A]">
              DIVERSIFICATION
            </span>
            <p className="text-[#FDFAF4]/70 text-xs font-mono uppercase tracking-wider mb-1">Asset Classes</p>
            <h3 className="font-serif italic font-normal text-3xl">{new Set(investments.map(i => i.type)).size}</h3>
          </div>
          <div className="mt-3 flex items-center text-xs font-mono text-[#FDFAF4]/70 gap-1.5">
            <PieChart className="w-3.5 h-3.5" /> Across {investments.length} individual assets
          </div>
        </div>
      </div>

      <div className="bg-[#FDFAF4] rounded-[6px] border border-[#1A1A1A] overflow-hidden shadow-[4px_4px_0px_0px_#1A1A1A]">
        <div className="p-3.5 border-b border-[#1A1A1A]/10 bg-[#F5F0E8] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="badge-sendlinks">HOLDINGS</span>
            <h3 className="font-serif italic font-normal text-xl text-[#1A1A1A]">Your Assets</h3>
          </div>
        </div>
        
        {investments.length > 0 ? (
          <div className="divide-y divide-[#1A1A1A]/10">
            {investments.sort((a, b) => b.currentValue - a.currentValue).map((inv) => {
              const gain = inv.currentValue - inv.investedAmount;
              const gainPercent = inv.investedAmount > 0 ? (gain / inv.investedAmount) * 100 : 0;
              
              return (
                <div key={inv.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F5F0E8] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[4px] bg-[#FFE14D] border border-[#1A1A1A] shadow-[1px_1px_0px_0px_#1A1A1A] text-[#1A1A1A] flex items-center justify-center shrink-0">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-[#1A1A1A]">{inv.name}</h4>
                      <p className="text-xs font-mono text-[#8A7F72] mt-0.5">{inv.type} {inv.platform ? `• ${inv.platform}` : ''}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 justify-between sm:justify-end text-xs font-mono">
                    <div className="text-right">
                      <p className="text-[10px] text-[#8A7F72] uppercase tracking-wider mb-0.5">Invested</p>
                      <p className="font-medium text-[#1A1A1A]">{formatCurrency(inv.investedAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[#8A7F72] uppercase tracking-wider mb-0.5">Current</p>
                      <p className="font-medium text-[#1A1A1A]">{formatCurrency(inv.currentValue)}</p>
                    </div>
                    <div className="text-right min-w-[70px]">
                      <p className="text-[10px] text-[#8A7F72] uppercase tracking-wider mb-0.5">Returns</p>
                      <div className={`font-medium flex items-center justify-end gap-0.5 ${gain >= 0 ? 'text-[#1A1A1A]' : 'text-[#FF4D00]'}`}>
                        {gain >= 0 ? '+' : ''}{gainPercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-10 h-10 rounded-[4px] bg-[#F5F0E8] border border-[#1A1A1A] flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-5 h-5 text-[#8A7F72]" />
            </div>
            <h3 className="font-serif italic font-normal text-xl text-[#1A1A1A]">No investments tracked</h3>
            <p className="text-xs text-[#8A7F72] mt-1 max-w-sm mx-auto mb-4">
              Add your stocks, mutual funds, crypto, or real estate to see your total net worth.
            </p>
            <AddInvestmentDialog />
          </div>
        )}
      </div>
    </div>
  );
}
