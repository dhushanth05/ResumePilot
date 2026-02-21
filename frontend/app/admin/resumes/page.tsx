"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AdminResumeRow = {
  id: string;
  title: string;
  owner_email: string;
  created_at: string;
};

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export default function AdminResumesPage() {
  const [items, setItems] = useState<AdminResumeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.owner_email.toLowerCase().includes(q)
    );
  }, [items, query]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/resumes", { cache: "no-store" });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { message?: string } | null;
          throw new Error(data?.message ?? "Failed to load resumes");
        }
        const data = (await res.json()) as AdminResumeRow[];
        if (!cancelled) setItems(data);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AdminProtectedRoute>
      <AdminLayout title="Resumes" subtitle="Platform-wide resume overview">
        <Card className="border-slate-800 bg-slate-900/40">
          <CardHeader className="mb-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">All resumes</CardTitle>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by owner or title..."
                className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 placeholder:text-slate-500 sm:w-72"
              />
            </div>
          </CardHeader>
          <CardContent>
            {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}
            {loading ? (
              <p className="text-sm text-slate-400">Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="py-3 pr-4">Title</th>
                      <th className="py-3 pr-4">Owner</th>
                      <th className="py-3 pr-4">Uploaded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-slate-800/60 text-sm text-slate-200 hover:bg-slate-900/40"
                      >
                        <td className="py-3 pr-4">{r.title}</td>
                        <td className="py-3 pr-4 text-slate-300">{r.owner_email}</td>
                        <td className="py-3 pr-4 text-slate-400">
                          {formatDate(r.created_at)}
                        </td>
                      </tr>
                    ))}

                    {filtered.length === 0 ? (
                      <tr>
                        <td className="py-6 text-sm text-slate-400" colSpan={3}>
                          No resumes found.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
