"use client";

import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths, eachDayOfInterval } from "date-fns";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";

export function FinanceDashboard() {
  const { data } = useSWR('/api/finance/transactions.php', fetcher);
  const transactions: any[] = data?.transactions;

  if (!transactions) return null;

  const today = new Date();
  const currentMonthStart = startOfMonth(today);
  const currentMonthEnd = endOfMonth(today);

  // Filter current month transactions
  const currentMonthTx = transactions.filter(tx => {
    const txDate = parseISO(tx.date);
    return isWithinInterval(txDate, { start: currentMonthStart, end: currentMonthEnd });
  });

  const income = currentMonthTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = currentMonthTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const net = income - expense;

  // Chart data for current month (cumulative expenses)
  const daysInMonth = eachDayOfInterval({ start: currentMonthStart, end: currentMonthEnd });
  let cumulativeExpense = 0;
  
  const chartData = daysInMonth.map(date => {
    const dayStr = format(date, "yyyy-MM-dd");
    const dayExpenses = currentMonthTx
      .filter(t => t.type === 'expense' && t.date === dayStr)
      .reduce((acc, t) => acc + t.amount, 0);
    
    cumulativeExpense += dayExpenses;
    
    // Only show data up to today if it's the current month
    if (date > today) return { name: format(date, "MMM d"), amount: null };
    
    return {
      name: format(date, "MMM d"),
      amount: cumulativeExpense
    };
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-dark text-surface-dark-foreground rounded-2xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-accent-yellow/20 rounded-full blur-2xl" />
          <div className="relative z-10">
            <p className="text-surface-dark-foreground/60 text-sm font-medium mb-1">Net Balance</p>
            <h2 className="text-3xl font-medium">${net.toFixed(2)}</h2>
          </div>
        </div>

        <div className="bg-surface-card rounded-2xl p-6 shadow-sm border border-transparent hover:border-border transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-ink-muted text-sm font-medium mb-1">Income</p>
              <h3 className="text-2xl font-medium text-ink">${income.toFixed(2)}</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-accent-yellow/20 text-accent-yellow flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-surface-card rounded-2xl p-6 shadow-sm border border-transparent hover:border-border transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-ink-muted text-sm font-medium mb-1">Expenses</p>
              <h3 className="text-2xl font-medium text-ink">${expense.toFixed(2)}</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-accent-coral/20 text-accent-coral flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-surface-card rounded-2xl p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-xl font-medium text-ink">Spend Trend</h3>
          <p className="text-ink-muted text-sm mt-1">Cumulative expenses this month</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent-coral)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-accent-coral)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }}
                tickFormatter={(value, index) => index % 5 === 0 ? value : ''}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                cursor={{ stroke: 'var(--color-ink-muted)', strokeWidth: 1, strokeDasharray: '4 4' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  backgroundColor: 'var(--color-surface-dark)',
                  color: 'var(--color-surface-card)',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
                itemStyle={{ color: 'var(--color-accent-coral)' }}
                formatter={(value: any) => [`$${value.toFixed(2)}`, 'Expense']}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="var(--color-accent-coral)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Recent Transactions List */}
      <div>
        <h3 className="text-xl font-medium text-ink mb-4">Recent Transactions</h3>
        <div className="flex flex-col gap-2">
          {transactions.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10).map((tx) => (
            <div key={tx.id} className="bg-surface-card p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-accent-yellow/20 text-accent-yellow' : 'bg-accent-coral/20 text-accent-coral'}`}>
                  {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-medium text-ink">{tx.category}</h4>
                  <p className="text-xs text-ink-muted">{format(parseISO(tx.date), "MMM d, yyyy")} {tx.note && `• ${tx.note}`}</p>
                </div>
              </div>
              <span className={`font-medium ${tx.type === 'income' ? 'text-ink' : 'text-ink'}`}>
                {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
              </span>
            </div>
          ))}
          
          {transactions.length === 0 && (
            <div className="text-center py-12 bg-surface-card rounded-2xl border border-dashed border-border">
              <div className="w-12 h-12 rounded-full bg-canvas flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-6 h-6 text-ink-muted" />
              </div>
              <p className="text-ink-muted">No transactions yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
