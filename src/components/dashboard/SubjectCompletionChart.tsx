"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SubjectCompletion = {
  name: string;
  completed: number;
  inProgress: number;
  notStarted: number;
};

export default function SubjectCompletionChart({ data }: { data: SubjectCompletion[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data.map((s) => ({
          name: s.name.length > 12 ? `${s.name.slice(0, 12)}...` : s.name,
          Mastered: s.completed,
          "In Progress": s.inProgress,
          "Not Started": s.notStarted,
        }))}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis type="number" stroke="#475569" tick={{ fontSize: 10 }} />
        <YAxis
          dataKey="name"
          type="category"
          stroke="#475569"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          width={100}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "12px",
            color: "#fff",
          }}
        />
        <Bar dataKey="Mastered" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
        <Bar dataKey="In Progress" stackId="a" fill="#eab308" />
        <Bar dataKey="Not Started" stackId="a" fill="#475569" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
