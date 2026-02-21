"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/resumes", label: "Resumes" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950/70 px-4 py-6">
      <div className="px-2">
        <div className="text-sm font-semibold text-slate-50">Admin Panel</div>
        <div className="mt-1 text-xs text-slate-400">ResumePilot SaaS</div>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-slate-50",
                active && "bg-slate-900 text-teal-200"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-slate-800 pt-4">
        <div className="rounded-lg bg-slate-900/50 px-3 py-2 text-xs text-slate-400">
          Protected area
        </div>
      </div>
    </aside>
  );
}
