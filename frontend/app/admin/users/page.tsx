"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AdminUserRow = {
  id: number;
  email: string;
  created_at: string;
  resumes_count: number;
  is_active: boolean;
};

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled">(
    "all"
  );
  const [actionUserId, setActionUserId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmUser, setConfirmUser] = useState<AdminUserRow | null>(null);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return users.filter((u) => {
      const matchesQuery = !q || u.email.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && u.is_active) ||
        (statusFilter === "disabled" && !u.is_active);
      return matchesQuery && matchesStatus;
    });
  }, [users, debouncedQuery, statusFilter]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "Failed to load users");
      }
      const data = (await res.json()) as AdminUserRow[];
      setUsers(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteUser = async (userId: number) => {
    const ok = confirm("Delete this user? This will delete their resumes and analyses.");
    if (!ok) return;

    setActionUserId(userId);
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      alert(data?.message ?? "Delete failed");
      setActionUserId(null);
      return;
    }

    await load();
    setActionUserId(null);
  };

  const toggleUser = async (user: AdminUserRow) => {
    setActionUserId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "Update failed");
      }

      toast.success(user.is_active ? "User disabled" : "User enabled");
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setActionUserId(null);
    }
  };

  const openToggleConfirm = (user: AdminUserRow) => {
    setConfirmUser(user);
    setConfirmOpen(true);
  };

  const confirmToggle = async () => {
    if (!confirmUser) return;
    await toggleUser(confirmUser);
    setConfirmOpen(false);
    setConfirmUser(null);
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout title="Users" subtitle="View and manage registered users">
        <Card className="border-slate-800 bg-slate-900/40">
          <CardHeader className="mb-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base">All users</CardTitle>
                <p className="text-sm text-slate-400">
                  Search and filter users. Disable prevents login without deleting data.
                </p>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by email..."
                  className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 placeholder:text-slate-500 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:w-72"
                />

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as "all" | "active" | "disabled")
                  }
                  className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:w-40"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}
            {loading ? (
              <p className="text-sm text-slate-400">Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="py-3 pr-4">Email</th>
                      <th className="py-3 pr-4">Created</th>
                      <th className="py-3 pr-4">Resumes</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-slate-800/60 text-sm text-slate-200 transition hover:bg-slate-900/50"
                      >
                        <td className="py-3 pr-4">{u.email}</td>
                        <td className="py-3 pr-4 text-slate-400">
                          {formatDate(u.created_at)}
                        </td>
                        <td className="py-3 pr-4">{u.resumes_count}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={
                              u.is_active
                                ? "inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200"
                                : "inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-200"
                            }
                          >
                            {u.is_active ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              className={
                                u.is_active
                                  ? "border-slate-700 bg-transparent text-slate-100 hover:bg-slate-900"
                                  : "border-teal-500/40 bg-transparent text-teal-100 hover:bg-teal-500/10"
                              }
                              onClick={() => openToggleConfirm(u)}
                              disabled={actionUserId === u.id}
                            >
                              {actionUserId === u.id ? (
                                <span className="inline-flex items-center gap-2">
                                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-400/40 border-t-slate-200" />
                                  Working
                                </span>
                              ) : u.is_active ? (
                                "Disable"
                              ) : (
                                "Enable"
                              )}
                            </Button>

                            <Button
                              variant="outline"
                              className="border-red-500/40 bg-transparent text-red-200 hover:bg-red-500/10"
                              onClick={() => deleteUser(u.id)}
                              disabled={actionUserId === u.id}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filtered.length === 0 ? (
                      <tr>
                        <td className="py-6 text-sm text-slate-400" colSpan={5}>
                          No users found.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <ConfirmModal
          open={confirmOpen}
          title={
            confirmUser?.is_active
              ? "Disable this user?"
              : "Enable this user?"
          }
          description={
            confirmUser?.is_active
              ? "Are you sure you want to disable this user? They will no longer be able to log in."
              : "Are you sure you want to enable this user?"
          }
          cancelText="Cancel"
          confirmText={confirmUser?.is_active ? "Disable" : "Enable"}
          confirmLoading={
            Boolean(confirmUser) && actionUserId === (confirmUser?.id ?? -1)
          }
          onCancel={() => {
            setConfirmOpen(false);
            setConfirmUser(null);
          }}
          onConfirm={() => void confirmToggle()}
        />
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
