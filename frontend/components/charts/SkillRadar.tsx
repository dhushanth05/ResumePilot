"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Props {
  data: { label: string; value: number }[];
}

export function SkillRadar({ data }: Props) {
  // For now we treat each label as a "category" axis.
  const chartData = data.map((item) => ({
    category: item.label,
    value: item.value,
  }));

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-slate-200">
        Skill Match Radar
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis dataKey="category" tick={{ fill: "#cbd5f5" }} />
            <PolarRadiusAxis tick={{ fill: "#cbd5f5" }} />
            <Tooltip />
            <Radar
              name="Skills"
              dataKey="value"
              stroke="#0ea5e9"
              fill="#0ea5e9"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

