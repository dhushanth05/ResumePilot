"use client";

import { useEffect, useState } from "react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AdminStats = {
  totalUsers: number;
  totalResumes: number;
  totalJobs: number;
  totalAnalyses: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setError(null);
      try {
        const res = await fetch("/api/admin/stats", { cache: "no-store" });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { message?: string } | null;
          throw new Error(data?.message ?? "Failed to load stats");
        }
        const data = (await res.json()) as AdminStats;
        if (!cancelled) setStats(data);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    { label: "Total Users", value: stats?.totalUsers ?? "—" },
    { label: "Total Resumes", value: stats?.totalResumes ?? "—" },
    { label: "Total Job Descriptions", value: stats?.totalJobs ?? "—" },
    { label: "Total Analyses Run", value: stats?.totalAnalyses ?? "—" },
  ];

  return (
    <AdminProtectedRoute>
      <AdminLayout title="Admin Dashboard" subtitle="Overview of platform usage">
        {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <Card key={c.label} className="border-slate-800 bg-slate-900/50">
              <CardHeader className="mb-0 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-300">
                  {c.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-3xl font-semibold tracking-tight text-teal-200">
                  {c.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6">
          <Card className="border-slate-800 bg-slate-900/30">
            <CardContent>
              <p className="text-sm text-slate-400">
                Tip: Use the sidebar to manage users and review resumes.
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
