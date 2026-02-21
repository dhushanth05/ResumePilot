"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AdminProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch("/api/admin/session", { cache: "no-store" });
        if (!res.ok) throw new Error("Unauthorized");
        const data = (await res.json()) as { authenticated: boolean };
        if (cancelled) return;
        setOk(Boolean(data.authenticated));
        if (!data.authenticated) router.replace("/admin/login");
      } catch {
        if (cancelled) return;
        setOk(false);
        router.replace("/admin/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-slate-300">Loading...</p>
      </main>
    );
  }

  if (!ok) return null;

  return <>{children}</>;
}
