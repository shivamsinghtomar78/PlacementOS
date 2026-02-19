"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type SubjectProgress = {
  name: string;
  total: number;
};

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#818cf8", "#6ee7b7"];

export default function CurriculumFocusChart({ data }: { data: SubjectProgress[] }) {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <PieChart>
        <Pie
          data={data.map((s) => ({
            name: s.name,
            value: s.total || 1,
          }))}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={90}
          paddingAngle={4}
          dataKey="value"
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={PIE_COLORS[i % PIE_COLORS.length]}
              className="outline-none"
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "16px",
            backdropFilter: "blur(12px)",
          }}
          itemStyle={{ color: "#fff", fontSize: "12px", fontWeight: "bold" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
