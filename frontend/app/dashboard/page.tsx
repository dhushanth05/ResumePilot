"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart3, FileText, TrendingUp, Users, Upload, ArrowRight, User, LogOut, Settings, Home, Search, Bell } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Route guard - redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
      setLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Show loading or redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <DashboardLayout title="Loading" subtitle="Authenticating...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white/60">Redirecting to login...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle={`Welcome back, ${user?.fullName || "User"} 👋`}
    >
      <div className="space-y-8">
        {/* KPI Stats Row */}
        <motion.div 
          initial={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, translateY: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {/* Total Resumes Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/5 border-white/10 rounded-xl p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">12</div>
                <div className="text-xs text-white/60">Total Resumes</div>
              </div>
              <FileText className="h-8 w-8 text-white/40" />
            </div>
          </motion.div>

          {/* Job Descriptions Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/5 border-white/10 rounded-xl p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">8</div>
                <div className="text-xs text-white/60">Job Descriptions</div>
              </div>
              <BarChart3 className="h-8 w-8 text-white/40" />
            </div>
          </motion.div>

          {/* Analyses Run Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/5 border-white/10 rounded-xl p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">24</div>
                <div className="text-xs text-white/60">Analyses Run</div>
              </div>
              <TrendingUp className="h-8 w-8 text-white/40" />
            </div>
          </motion.div>

          {/* Average Match % Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/5 border-white/10 rounded-xl p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">78%</div>
                <div className="text-xs text-white/60">Average Match %</div>
              </div>
              <Users className="h-8 w-8 text-white/40" />
            </div>
          </motion.div>
        </motion.div>

        {/* AI Insights Overview Card */}
        <motion.div
          initial={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, translateY: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white/5 border-white/10 rounded-xl p-8 hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
        >
          <CardHeader>
            <CardTitle>AI Insights Overview</CardTitle>
            <CardDescription>
              Overall resume performance and optimization recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Overall Resume Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-200">Overall Resume Score</span>
                  <span className="text-2xl font-bold text-white">85%</span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* ATS Compatibility Status */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-200">ATS Compatibility</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-lg font-semibold text-emerald-300">Excellent</span>
                </div>
              </div>

              {/* Skill Gaps Count */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-200">Skill Gaps Identified</span>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-amber-300">3</div>
                  <span className="text-sm text-amber-400">critical gaps</span>
                </div>
              </div>

              {/* Last Analysis Date */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">Last Analysis</span>
                <span className="text-sm text-slate-300">2 days ago</span>
              </div>
            </div>
          </CardContent>
        </motion.div>

        {/* Quick Actions Grid */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, translateY: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white/5 border-white/10 rounded-xl p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Upload Resume</h3>
              <ArrowRight className="h-5 w-5 text-white/60 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-sm text-white/70 mb-4">Add a new resume to start tracking your job match performance.</p>
            <Link
              href="/resumes"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium rounded-lg hover:brightness-110 hover:scale-105 transition-all transform"
            >
              <Upload className="h-4 w-4" />
              Upload New Resume
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, translateY: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-white/5 border-white/10 rounded-xl p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Run Analysis</h3>
              <ArrowRight className="h-5 w-5 text-white/60 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-sm text-white/70 mb-4">Analyze your resume against job descriptions for ATS optimization.</p>
            <Link
              href="/analysis"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium rounded-lg hover:brightness-110 hover:scale-105 transition-all transform"
            >
              <TrendingUp className="h-4 w-4" />
              Run New Analysis
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, translateY: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white/5 border-white/10 rounded-xl p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">View Profile</h3>
              <ArrowRight className="h-5 w-5 text-white/60 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-sm text-white/70 mb-4">Update your personal information and work experience.</p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium rounded-lg hover:brightness-110 hover:scale-105 transition-all transform"
            >
              <User className="h-4 w-4" />
              Edit Profile
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, translateY: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="bg-white/5 border-white/10 rounded-xl p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Add Jobs</h3>
              <ArrowRight className="h-5 w-5 text-white/60 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-sm text-white/70 mb-4">Save job descriptions to analyze against your resumes.</p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium rounded-lg hover:brightness-110 hover:scale-105 transition-all transform"
            >
              <BarChart3 className="h-4 w-4" />
              Add Job Description
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, translateY: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="bg-white/5 border-white/10 rounded-xl p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">View Analytics</h3>
              <ArrowRight className="h-5 w-5 text-white/60 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-sm text-white/70 mb-4">Explore detailed analytics and performance trends.</p>
            <Link
              href="/analytics"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium rounded-lg hover:brightness-110 hover:scale-105 transition-all transform"
            >
              <TrendingUp className="h-4 w-4" />
              View Analytics
            </Link>
          </motion.div>
        </section>
      </div>
    </DashboardLayout>
  );
}
