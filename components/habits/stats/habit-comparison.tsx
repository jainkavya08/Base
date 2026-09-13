"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export function HabitComparison({ data }: { data: any[] }) {
  // Only show habits that have some activity or are active
  const chartData = data.slice(0, 10); // Limit to top 10

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          layout="vertical" 
          margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--color-border)" strokeOpacity={0.4} />
          <XAxis 
            type="number" 
            domain={[0, 100]} 
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--color-ink-muted)", fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis 
            type="category" 
            dataKey="title" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--color-ink)", fontSize: 12, fontWeight: 500 }}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-canvas)", opacity: 0.5 }} />
          <Bar dataKey="completionRate" radius={[0, 4, 4, 0]} barSize={24}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="var(--color-accent-blue)" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-surface-card border border-border/50 rounded-2xl p-3 shadow-lg text-sm">
        <p className="text-ink font-medium mb-1">{data.icon} {data.title}</p>
        <p className="text-ink-muted">{data.completionRate}% completion rate</p>
      </div>
    );
  }
  return null;
};
