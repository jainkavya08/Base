"use client";

import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, eachDayOfInterval } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { AccountCardStack } from "./account-card-stack";

export function OverviewTab() {
  const { data: txData } = useSWR('/api/finance/transactions.php', fetcher);
  const { data: accountsData } = useSWR('/api/finance/accounts.php', fetcher);
  const transactions: any[] = txData?.transactions;
  const accounts: any[] = accountsData?.accounts;

  if (!transactions || !accounts) return null;

  const today = new Date();
  const currentMonthStart = startOfMonth(today);
  const currentMonthEnd = endOfMonth(today);

  // Current month stats (exclude transfers)
  const currentMonthTx = transactions.filter(tx => {
    const txDate = parseISO(tx.date);
    return isWithinInterval(txDate, { start: currentMonthStart, end: currentMonthEnd });
  });

  const income = currentMonthTx.filter(t => t.type === 'income').reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
  const expense = currentMonthTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
  
  // Calculate total balance from all active accounts
  const totalBalance = accounts.filter(a => a.isActive).reduce((acc, a) => acc + parseFloat(a.balance || 0), 0);
  
  const savingsRate = income > 0 ? Math.max(0, Math.round(((income - expense) / income) * 100)) : 0;

  // Chart data for current month
  const daysInMonth = eachDayOfInterval({ start: currentMonthStart, end: currentMonthEnd });
  let cumulativeExpense = 0;
  let cumulativeIncome = 0;
  
  const chartData = daysInMonth.map(date => {
    const dayStr = format(date, "yyyy-MM-dd");
    const dayExpenses = currentMonthTx
      .filter(t => t.type === 'expense' && (t.date === dayStr || t.date.startsWith(dayStr)))
      .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
      
    const dayIncome = currentMonthTx
      .filter(t => t.type === 'income' && (t.date === dayStr || t.date.startsWith(dayStr)))
      .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
    
    cumulativeExpense += dayExpenses;
    cumulativeIncome += dayIncome;
    
    if (date > today) return { name: format(date, "MMM d"), expense: null, income: null };
    
    return {
      name: format(date, "MMM d"),
      expense: cumulativeExpense,
      income: cumulativeIncome
    };
  });

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="col-span-1 sm:col-span-2 lg:col-span-1 h-full min-w-0">
          <AccountCardStack accounts={accounts} totalBalance={totalBalance} />
        </div>

        <div className="bg-[#FDFAF4] rounded-[6px] p-5 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] box-border max-w-full">
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <span className="badge-sendlinks mb-2">INFLOW</span>
              <p className="text-[#8A7F72] text-xs font-mono uppercase tracking-wider mb-1">Monthly Income</p>
              <h3 className="font-serif italic font-normal text-2xl md:text-3xl text-[#1A1A1A] truncate">{formatCurrency(income)}</h3>
            </div>
            <div className="w-8 h-8 shrink-0 rounded-[4px] bg-[#FDFAF4] border border-[#1A1A1A] text-[#1A1A1A] shadow-[2px_2px_0px_0px_#FFE14D] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#1A1A1A]" />
            </div>
          </div>
        </div>

        <div className="bg-[#FDFAF4] rounded-[6px] p-5 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] box-border max-w-full">
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <span className="badge-sendlinks mb-2">OUTFLOW</span>
              <p className="text-[#8A7F72] text-xs font-mono uppercase tracking-wider mb-1">Monthly Expenses</p>
              <h3 className="font-serif italic font-normal text-2xl md:text-3xl text-[#1A1A1A] truncate">{formatCurrency(expense)}</h3>
            </div>
            <div className="w-8 h-8 shrink-0 rounded-[4px] bg-[#FDFAF4] border border-[#1A1A1A] text-[#FF4D00] shadow-[2px_2px_0px_0px_#FF4D00] flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-[#FF4D00]" />
            </div>
          </div>
        </div>

        <div className="bg-[#FDFAF4] rounded-[6px] p-5 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] box-border max-w-full">
          <div className="flex justify-between items-start">
            <div>
              <span className="badge-sendlinks mb-2">SAVINGS</span>
              <p className="text-[#8A7F72] text-xs font-mono uppercase tracking-wider mb-1">Savings Rate</p>
              <h3 className="font-serif italic font-normal text-2xl md:text-3xl text-[#1A1A1A]">
                {income > 0 ? `${savingsRate.toFixed(1)}%` : "N/A"}
              </h3>
            </div>
            <div className="w-8 h-8 shrink-0 rounded-[4px] bg-[#FDFAF4] border border-[#1A1A1A] text-[#1A1A1A] shadow-[2px_2px_0px_0px_#FFE14D] flex items-center justify-center">
              <PiggyBank className="w-4 h-4 text-[#1A1A1A]" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Trend Chart */}
      <div className="bg-[#FDFAF4] rounded-[6px] p-6 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#1A1A1A]/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-sendlinks">CUMULATIVE</span>
            </div>
            <h3 className="font-serif italic font-normal text-2xl text-[#1A1A1A]">Spending Overview</h3>
            <p className="text-[#8A7F72] text-xs font-sans mt-0.5">Income vs Expenses (Cumulative this month)</p>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF4D00" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FF4D00" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#8A7F72', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                tickFormatter={(value, index) => index % 5 === 0 ? value : ''}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#8A7F72', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                tickFormatter={(value) => formatCurrency(value, true).replace('.00','')}
              />
              <Tooltip 
                cursor={{ stroke: '#1A1A1A', strokeWidth: 1, strokeDasharray: '4 4' }}
                contentStyle={{ 
                  borderRadius: '4px', 
                  border: '1px solid #1A1A1A', 
                  backgroundColor: '#FDFAF4',
                  color: '#1A1A1A',
                  boxShadow: '4px 4px 0px 0px #1A1A1A',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px'
                }}
                formatter={(value: any, name: any) => [formatCurrency(value), name === 'income' ? 'Income' : 'Expense']}
              />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="#1A1A1A" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorIncome)" 
                connectNulls
              />
              <Area 
                type="monotone" 
                dataKey="expense" 
                stroke="#FF4D00" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorExpense)" 
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* 3. Recent Transactions List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="badge-sendlinks">HISTORY</span>
            <h3 className="font-serif italic font-normal text-2xl text-[#1A1A1A]">Recent Transactions</h3>
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          {transactions.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map((tx) => {
            const acc = accounts.find(a => a.id === tx.accountId);
            return (
              <div key={tx.id} className="bg-[#FDFAF4] p-3.5 rounded-[4px] flex items-center justify-between border border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] hover:translate-x-0.5 transition-transform cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-[4px] border border-[#1A1A1A] flex items-center justify-center shadow-[1px_1px_0px_0px_#1A1A1A]",
                    tx.type === 'income' ? 'bg-[#FFE14D] text-[#1A1A1A]' : 
                    tx.type === 'expense' ? 'bg-[#FF4D00] text-white' : 'bg-[#FDFAF4] text-[#1A1A1A]'
                  )}>
                    {tx.type === 'income' ? <TrendingUp className="w-4 h-4" /> : 
                     tx.type === 'expense' ? <TrendingDown className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-[#1A1A1A]">{tx.title || tx.category}</h4>
                    <p className="text-xs font-mono text-[#8A7F72]">
                      {format(parseISO(tx.date), "MMM d, yyyy")} {acc ? `• ${acc.name}` : ''}
                    </p>
                  </div>
                </div>
                <span className={cn("font-mono font-medium text-sm", 
                  tx.type === 'income' ? 'text-[#1A1A1A]' : 
                  tx.type === 'expense' ? 'text-[#FF4D00]' : 'text-[#8A7F72]'
                )}>
                  {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatCurrency(tx.amount)}
                </span>
              </div>
            );
          })}
          
          {transactions.length === 0 && (
            <div className="text-center py-12 bg-[#FDFAF4] rounded-[6px] border border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A]">
              <div className="w-10 h-10 rounded-[4px] bg-[#F5F0E8] border border-[#1A1A1A] flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-5 h-5 text-[#8A7F72]" />
              </div>
              <p className="text-sm font-sans text-[#8A7F72]">No transactions yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
