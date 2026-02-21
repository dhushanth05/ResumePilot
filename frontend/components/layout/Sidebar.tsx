"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Logo from '@/components/ui/Logo';
import { Home, FileText, Upload, BarChart3, User, LogOut, FileEdit, History } from "lucide-react";

const topNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/resumes", label: "Resumes", icon: FileText },
  { href: "/jobs", label: "Jobs", icon: Upload },
  { href: "/analysis", label: "Analysis", icon: BarChart3 },
];

const analyticsSubItems = [
  { href: "/analytics/overview", label: "Overview" },
  { href: "/analytics/compare", label: "Compare" },
];

const smartResumeSubItems = [
  { href: "/resume-builder", label: "Smart Resume Builder", icon: FileEdit },
  { href: "/resume-history", label: "Resume History", icon: History },
];

const bottomNavItems = [
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Get user initials for avatar
  const getUserInitials = (fullName?: string) => {
    if (!fullName) return "U";
    return fullName
      .split(" ")
      .map(word => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  // Check if main nav item is active
  const isMainNavActive = (href: string) => {
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
  };

  // Check if sub-item is active
  const isSubActive = (href: string) => pathname === href;

  return (
    <aside className="fixed left-0 top-0 z-10 flex h-screen w-60 flex-col bg-gradient-to-b from-slate-950 to-slate-900 px-4 py-6">
      {/* Logo Section */}
      <div className="mb-6">
        <Link href="/dashboard" className="block">
          <Logo size="md" variant="dark" showText={true} />
        </Link>
      </div>

      {/* User Profile Section */}
      <div className="px-2 mb-6">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center space-x-3 mb-4">
            {/* Avatar with initials */}
            <div className="w-10 h-10 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {getUserInitials(user?.fullName)}
              </span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">
                {user?.fullName || "User"}
              </div>
              <div className="text-xs text-slate-400">
                {user?.email || "user@example.com"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1">
        {/* Top Navigation Items */}
        {topNavItems.map((item) => {
          const active = isMainNavActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center space-x-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-all duration-200 hover:bg-white/5 hover:translate-x-1",
                active && "bg-white/5 text-white"
              )}
            >
              {/* Active state indicator */}
              {active && (
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-r"></div>
              )}
              
              {/* Icon */}
              <item.icon className="h-4 w-4" />
              
              {/* Label */}
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Analytics Section Header */}
        <div className="relative flex items-center space-x-3 rounded-lg px-3 py-2 text-sm text-slate-400 font-semibold">
          <BarChart3 className="h-4 w-4" />
          <span>Analytics</span>
        </div>

        {/* Analytics Sub-items */}
        {analyticsSubItems.map((item) => {
          const active = isSubActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center space-x-3 rounded-lg px-3 py-2 text-xs transition-all duration-200 hover:bg-white/5 hover:translate-x-1 pl-6",
                active
                  ? "bg-white/5 text-sky-400 font-medium"
                  : "text-slate-400 font-medium hover:text-slate-300"
              )}
            >
              {/* Active state indicator */}
              {active && (
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-sky-500 to-cyan-400 rounded-r"></div>
              )}
              
              {/* Label */}
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Bottom Navigation Items */}
        {bottomNavItems.map((item) => {
          const active = isMainNavActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center space-x-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-all duration-200 hover:bg-white/5 hover:translate-x-1",
                active && "bg-white/5 text-white"
              )}
            >
              {/* Active state indicator */}
              {active && (
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-r"></div>
              )}
              
              {/* Icon */}
              <item.icon className="h-4 w-4" />
              
              {/* Label */}
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Smart Resume Section Header */}
        <div className="relative flex items-center space-x-3 rounded-lg px-3 py-2 text-sm text-slate-400 font-semibold">
          <FileEdit className="h-4 w-4" />
          <span>Smart Resume</span>
        </div>

        {/* Smart Resume Sub-items */}
        {smartResumeSubItems.map((item) => {
          const active = isSubActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center space-x-3 rounded-lg px-3 py-2 text-xs transition-all duration-200 hover:bg-white/5 hover:translate-x-1 pl-6",
                active
                  ? "bg-white/5 text-sky-400 font-medium"
                  : "text-slate-400 font-medium hover:text-slate-300"
              )}
            >
              {/* Active state indicator */}
              {active && (
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-sky-500 to-cyan-400 rounded-r"></div>
              )}
              
              {/* Icon */}
              <item.icon className="h-4 w-4" />
              
              {/* Label */}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out Button */}
      <div className="border-t border-white/10 pt-4">
        <Button
          variant="outline"
          className="w-full bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
