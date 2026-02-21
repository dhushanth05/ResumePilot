"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SkillGapItem {
  skill: string;
  present: boolean;
}

interface Props {
  data: SkillGapItem[];
}

export function SkillGapBar({ data }: Props) {
  const chartData = data.map((item) => ({
    skill: item.skill,
    present: item.present ? 1 : 0,
    missing: item.present ? 0 : 1,
  }));

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-slate-200">
        Skill Gap Overview
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="skill" tick={{ fill: "#cbd5f5", fontSize: 10 }} />
            <YAxis tick={{ fill: "#cbd5f5" }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="present" stackId="a" fill="#22c55e" />
            <Bar dataKey="missing" stackId="a" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

