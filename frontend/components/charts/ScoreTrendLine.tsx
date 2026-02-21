"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AnalysisResult } from "@/types/analysis";

interface Props {
  history: AnalysisResult[];
}

export function ScoreTrendLine({ history }: Props) {
  const data = history.map((item) => ({
    created_at: new Date(item.created_at).toLocaleDateString(),
    ats: Math.round(item.ats_score * 100),
    similarity: Math.round(item.similarity_score * 100),
  }));

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-slate-200">
        Resume Score Trend Over Time
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="created_at" tick={{ fill: "#cbd5f5" }} />
            <YAxis tick={{ fill: "#cbd5f5" }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="ats"
              stroke="#0ea5e9"
              name="ATS %"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="similarity"
              stroke="#a855f7"
              name="Similarity %"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

