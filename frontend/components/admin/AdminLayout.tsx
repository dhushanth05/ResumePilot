"use client";

import { useRouter } from "next/navigation";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AdminLayout({ title, subtitle, children }: AdminLayoutProps) {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-slate-800 bg-slate-950/60 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-50">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
              ) : null}
            </div>

            <Button
              variant="outline"
              className="border-slate-700 bg-transparent text-slate-100 hover:bg-slate-900"
              onClick={() => logout()}
            >
              Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 px-6 py-6">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
