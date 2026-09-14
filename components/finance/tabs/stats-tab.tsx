"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils/currency";
import { format, parseISO, subMonths, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Legend } from "recharts";
import { PieChart as RechartsPieChart, Pie, Cell as PieCell } from "recharts";

export function StatsTab() {
  const transactions = useLiveQuery(() => db.financeTransactions.toArray());

  if (!transactions) return null;

  // 1. Expense by Category (Current Month)
  const today = new Date();
  const currentMonthStart = startOfMonth(today);
  const currentMonthEnd = endOfMonth(today);
  
  const currentMonthExpenses = transactions.filter(tx => 
    tx.type === 'expense' && 
    isWithinInterval(parseISO(tx.date), { start: currentMonthStart, end: currentMonthEnd })
  );

  const categoryTotals: Record<string, number> = {};
  currentMonthExpenses.forEach(tx => {
    const cat = tx.category || 'Uncategorized';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + tx.amount;
  });

  const categoryData = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E', '#6C5CE7', '#55EFC4', '#FF9F43', '#D6A2E8'];

  // 2. Income vs Expenses (Last 6 Months)
  const last6MonthsData = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(today, 5 - i);
    const start = startOfMonth(d);
    const end = endOfMonth(d);
    
    const monthTxs = transactions.filter(tx => isWithinInterval(parseISO(tx.date), { start, end }));
    const income = monthTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = monthTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    
    return {
      name: format(start, "MMM"),
      income,
      expense,
      savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0
    };
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-medium text-ink">Statistics & Progress</h2>
          <p className="text-sm text-ink-muted mt-1">Deep dive into your financial habits.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category Pie Chart */}
        <div className="bg-surface-card p-6 rounded-2xl border border-border/50 shadow-sm">
          <h3 className="font-medium text-ink mb-6">Expenses by Category (This Month)</h3>
          {categoryData.length > 0 ? (
            <div className="flex flex-col h-full justify-between pb-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <PieCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-surface-dark)', color: '#fff' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {categoryData.slice(0, 8).map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-ink-muted truncate" title={cat.name}>{cat.name}</span>
                    </div>
                    <span className="font-medium text-ink ml-2">{formatCurrency(cat.value, true).replace('.00','')}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-ink-muted">
              No expenses this month.
            </div>
          )}
        </div>

        {/* 6 Month Trend Bar Chart */}
        <div className="bg-surface-card p-6 rounded-2xl border border-border/50 shadow-sm">
          <h3 className="font-medium text-ink mb-6">Income vs Expenses (6 Months)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last6MonthsData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }}
                  tickFormatter={(val) => formatCurrency(val, true).replace('.00','')}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--color-canvas)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-surface-dark)', color: '#fff' }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="income" name="Income" fill="var(--color-accent-green)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expense" name="Expenses" fill="var(--color-accent-coral)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
