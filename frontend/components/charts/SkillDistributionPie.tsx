"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Props {
  data: { label: string; value: number }[];
}

const COLORS = ["#22c55e", "#ef4444", "#a855f7", "#0ea5e9"];

export function SkillDistributionPie({ data }: Props) {
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-slate-200">
        Skill Distribution
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              outerRadius={60}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.label}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

