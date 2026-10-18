"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { formatCurrency } from "@/lib/utils/currency";
import { format, parseISO, subMonths, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Legend } from "recharts";
import { PieChart as RechartsPieChart, Pie, Cell as PieCell } from "recharts";

export function StatsTab() {
  const { data } = useSWR('/api/finance/transactions.php', fetcher);
  const transactions: any[] = data?.transactions;

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
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-sendlinks">ANALYTICS</span>
          </div>
          <h2 className="font-serif italic font-normal text-2xl md:text-3xl text-[#1A1A1A]">Statistics & Progress</h2>
          <p className="text-xs font-sans text-[#8A7F72] mt-0.5">Deep dive into your financial habits and trends.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Pie Chart */}
        <div className="bg-[#FDFAF4] p-5 rounded-[6px] border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#1A1A1A]/10">
            <span className="badge-sendlinks">DISTRIBUTION</span>
            <h3 className="font-serif italic font-normal text-xl text-[#1A1A1A]">Expenses by Category (This Month)</h3>
          </div>
          {categoryData.length > 0 ? (
            <div className="flex flex-col h-full justify-between pb-2">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="#1A1A1A"
                      strokeWidth={1}
                    >
                      {categoryData.map((entry, index) => (
                        <PieCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => formatCurrency(value)}
                      contentStyle={{ 
                        borderRadius: '4px', 
                        border: '1px solid #1A1A1A', 
                        backgroundColor: '#FDFAF4', 
                        color: '#1A1A1A',
                        boxShadow: '4px 4px 0px 0px #1A1A1A',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#1A1A1A]/10">
                {categoryData.slice(0, 8).map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5 truncate">
                      <div className="w-2.5 h-2.5 rounded-[2px] border border-[#1A1A1A] shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-[#8A7F72] truncate" title={cat.name}>{cat.name}</span>
                    </div>
                    <span className="font-medium text-[#1A1A1A] ml-2">{formatCurrency(cat.value, true).replace('.00','')}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs font-mono text-[#8A7F72]">
              No expenses this month.
            </div>
          )}
        </div>

        {/* 6 Month Trend Bar Chart */}
        <div className="bg-[#FDFAF4] p-5 rounded-[6px] border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#1A1A1A]/10">
            <span className="badge-sendlinks">COMPARISON</span>
            <h3 className="font-serif italic font-normal text-xl text-[#1A1A1A]">Income vs Expenses (6 Months)</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last6MonthsData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A1A1A" strokeOpacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#8A7F72', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#8A7F72', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                  tickFormatter={(val) => formatCurrency(val, true).replace('.00','')}
                />
                <Tooltip 
                  cursor={{ fill: '#1A1A1A', fillOpacity: 0.05 }}
                  contentStyle={{ 
                    borderRadius: '4px', 
                    border: '1px solid #1A1A1A', 
                    backgroundColor: '#FDFAF4', 
                    color: '#1A1A1A',
                    boxShadow: '4px 4px 0px 0px #1A1A1A',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px'
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Legend iconType="square" wrapperStyle={{ paddingTop: '16px', fontFamily: 'var(--font-mono)', fontSize: '11px' }} />
                <Bar dataKey="income" name="Income" fill="#1A1A1A" stroke="#1A1A1A" strokeWidth={1} radius={[2, 2, 0, 0]} maxBarSize={32} />
                <Bar dataKey="expense" name="Expenses" fill="#FF4D00" stroke="#1A1A1A" strokeWidth={1} radius={[2, 2, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
