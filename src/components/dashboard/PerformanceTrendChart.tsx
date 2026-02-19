"use client";

import { format } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type WeeklyStat = {
  date: string;
  completed: number;
};

export default function PerformanceTrendChart({ data }: { data: WeeklyStat[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="rgba(255,255,255,0.2)"
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: string) => format(new Date(v), "MMM d")}
        />
        <YAxis
          stroke="rgba(255,255,255,0.2)"
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "16px",
            backdropFilter: "blur(12px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
          itemStyle={{ color: "#fff", fontSize: "12px", fontWeight: "bold" }}
          labelStyle={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", marginBottom: "4px" }}
        />
        <Area
          type="monotone"
          dataKey="completed"
          stroke="#6366f1"
          fillOpacity={1}
          fill="url(#colorCompleted)"
          strokeWidth={3}
          animationDuration={1600}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
