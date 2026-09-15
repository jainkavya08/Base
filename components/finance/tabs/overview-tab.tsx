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

export function OverviewTab() {
  const { data: txData } = useSWR('/api/finance/transactions.php', fetcher);
  const { data: accountsData } = useSWR('/api/finance/accounts.php', fetcher);
  const transactions: any[] = txData?.transactions;
  const accounts: any[] = accountsData?.accounts;
  
  const [balanceMode, setBalanceMode] = useState<"total" | "account">("total");

  if (!transactions || !accounts) return null;

  const today = new Date();
  const currentMonthStart = startOfMonth(today);
  const currentMonthEnd = endOfMonth(today);

  // Current month stats (exclude transfers)
  const currentMonthTx = transactions.filter(tx => {
    const txDate = parseISO(tx.date);
    return isWithinInterval(txDate, { start: currentMonthStart, end: currentMonthEnd });
  });

  const income = currentMonthTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = currentMonthTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  
  // Calculate total balance from all active accounts
  const totalBalance = accounts.filter(a => a.isActive).reduce((acc, a) => acc + a.balance, 0);
  
  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

  // Chart data for current month
  const daysInMonth = eachDayOfInterval({ start: currentMonthStart, end: currentMonthEnd });
  let cumulativeExpense = 0;
  let cumulativeIncome = 0;
  
  const chartData = daysInMonth.map(date => {
    const dayStr = format(date, "yyyy-MM-dd");
    const dayExpenses = currentMonthTx
      .filter(t => t.type === 'expense' && t.date === dayStr)
      .reduce((acc, t) => acc + t.amount, 0);
      
    const dayIncome = currentMonthTx
      .filter(t => t.type === 'income' && t.date === dayStr)
      .reduce((acc, t) => acc + t.amount, 0);
    
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
    <div className="flex flex-col gap-10">
      
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-dark text-surface-dark-foreground rounded-2xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-accent-yellow/20 rounded-full blur-2xl" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <p className="text-surface-dark-foreground/60 text-sm font-medium mb-1">Total Balance</p>
              <h2 className="text-3xl font-medium">{formatCurrency(totalBalance)}</h2>
            </div>
            <div className="mt-4 flex items-center text-xs text-surface-dark-foreground/80 gap-1">
              <Wallet className="w-3 h-3" /> Across {accounts.filter(a => a.isActive).length} accounts
            </div>
          </div>
        </div>

        <div className="bg-surface-card rounded-2xl p-6 shadow-sm border border-transparent hover:border-border transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-ink-muted text-sm font-medium mb-1">Monthly Income</p>
              <h3 className="text-2xl font-medium text-ink">{formatCurrency(income)}</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-accent-green/20 text-accent-green flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-surface-card rounded-2xl p-6 shadow-sm border border-transparent hover:border-border transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-ink-muted text-sm font-medium mb-1">Monthly Expenses</p>
              <h3 className="text-2xl font-medium text-ink">{formatCurrency(expense)}</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-accent-coral/20 text-accent-coral flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-surface-card rounded-2xl p-6 shadow-sm border border-transparent hover:border-border transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-ink-muted text-sm font-medium mb-1">Savings Rate</p>
              <h3 className="text-2xl font-medium text-ink">
                {income > 0 ? `${savingsRate.toFixed(1)}%` : "N/A"}
              </h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Account Balance Toggle */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <h3 className="text-xl font-medium text-ink">Balance</h3>
          <Select value={balanceMode} onValueChange={(v: any) => setBalanceMode(v)}>
            <SelectTrigger className="w-[180px] bg-canvas border-border h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total">Total Balance</SelectItem>
              <SelectItem value="account">By Account</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {balanceMode === 'total' && (
           <div className="text-4xl font-medium text-ink">{formatCurrency(totalBalance)}</div>
        )}

        {balanceMode === 'account' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {accounts.filter(a => a.isActive).map(account => (
              <div key={account.id} className="bg-surface-card p-5 rounded-xl border border-border/50 relative overflow-hidden group">
                {account.color && (
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: account.color }} />
                )}
                <p className="text-ink-muted text-sm font-medium mb-2">{account.name}</p>
                <p className="text-2xl font-medium text-ink">{formatCurrency(account.balance)}</p>
                <p className="text-xs text-ink-muted mt-2">{account.accountType}</p>
              </div>
            ))}
            {accounts.filter(a => a.isActive).length === 0 && (
              <p className="text-ink-muted text-sm">No active accounts.</p>
            )}
          </div>
        )}
      </div>

      {/* 3. Trend Chart */}
      <div className="bg-surface-card rounded-2xl p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-xl font-medium text-ink">Spending Overview</h3>
          <p className="text-ink-muted text-sm mt-1">Income vs Expenses (Cumulative this month)</p>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent-coral)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-accent-coral)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent-green)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-accent-green)" stopOpacity={0}/>
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
                tickFormatter={(value) => formatCurrency(value, true).replace('.00','')}
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
                formatter={(value: any, name: any) => [formatCurrency(value), name === 'income' ? 'Income' : 'Expense']}
              />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="var(--color-accent-green)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorIncome)" 
                connectNulls
              />
              <Area 
                type="monotone" 
                dataKey="expense" 
                stroke="var(--color-accent-coral)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorExpense)" 
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* 4. Recent Transactions List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium text-ink">Recent Transactions</h3>
        </div>
        <div className="flex flex-col gap-2">
          {transactions.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map((tx) => {
            const acc = accounts.find(a => a.id === tx.accountId);
            return (
              <div key={tx.id} className="bg-surface-card p-4 rounded-xl flex items-center justify-between border border-border/50 hover:border-border transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    tx.type === 'income' ? 'bg-accent-green/20 text-accent-green' : 
                    tx.type === 'expense' ? 'bg-accent-coral/20 text-accent-coral' : 'bg-ink-muted/20 text-ink-muted'
                  )}>
                    {tx.type === 'income' ? <TrendingUp className="w-5 h-5" /> : 
                     tx.type === 'expense' ? <TrendingDown className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-ink">{tx.title || tx.category}</h4>
                    <p className="text-xs text-ink-muted">
                      {format(parseISO(tx.date), "MMM d, yyyy")} {acc ? `• ${acc.name}` : ''}
                    </p>
                  </div>
                </div>
                <span className={cn("font-medium", 
                  tx.type === 'income' ? 'text-accent-green' : 
                  tx.type === 'expense' ? 'text-ink' : 'text-ink-muted'
                )}>
                  {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatCurrency(tx.amount)}
                </span>
              </div>
            );
          })}
          
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
