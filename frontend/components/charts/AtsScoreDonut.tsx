"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Props {
  score: number; // 0..1
}

const COLORS = ["#0ea5e9", "#1e293b"];

export function AtsScoreDonut({ score }: Props) {
  const pct = Math.round(score * 100);
  const data = [
    { name: "ATS Match", value: pct },
    { name: "Remaining", value: 100 - pct },
  ];

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-slate-200">
        ATS Compatibility Score
      </div>
      <div className="flex items-center gap-4">
        <div className="text-4xl font-semibold text-sky-400">{pct}%</div>
        <div className="h-32 w-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={30}
                outerRadius={40}
                dataKey="value"
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

