"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export function CompletionTrend({ data }: { data: any[] }) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" strokeOpacity={0.4} />
          <XAxis 
            dataKey="formattedDate" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--color-ink-muted)", fontSize: 12 }}
            dy={10}
            minTickGap={30}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--color-ink-muted)", fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--color-border)", strokeWidth: 1, strokeDasharray: "4 4" }} />
          <Line 
            type="monotone" 
            dataKey="percentage" 
            stroke="var(--color-accent-blue)" 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: "var(--color-accent-blue)", stroke: "var(--color-surface-card)", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-surface-card border border-border/50 rounded-2xl p-4 shadow-lg text-sm">
        <p className="text-ink-muted mb-1">{data.formattedDate}</p>
        <p className="text-ink font-semibold text-lg">{data.percentage}% completion</p>
        <p className="text-ink-muted text-xs mt-1">{data.completed} of {data.total} habits completed</p>
      </div>
    );
  }
  return null;
};
