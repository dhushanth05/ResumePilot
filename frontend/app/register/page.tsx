"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import Logo from '@/components/ui/Logo';

const registerSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }
    try {
      await register(parsed.data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <main className="min-h-screen flex relative">
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-6 z-50">
        {/* Logo */}
        <Logo size="md" variant="dark" />
        
        {/* Back to Home */}
        <Link 
          href="/"
          className="text-sm text-white/60 hover:text-white transition duration-200 cursor-pointer"
        >
          Back to Home
        </Link>
      </div>

      {/* Left Panel - Branding */}
      <div className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 to-blue-950 relative overflow-hidden transition-opacity duration-300 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Background Glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center w-full px-12">
          <div className="space-y-6 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Join ResumePilot</h1>
            <p className="text-white/70 text-lg">Start optimizing your resume with AI-powered insights.</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-1/2 bg-slate-950 flex items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full">
          {/* Register Card */}
          <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-10 transition-all duration-300 ease-out ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white">Create Your Account</h2>
                <p className="text-white/70 text-lg">Access ResumePilot analytics and insights</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Full name</label>
                  <Input
                    type="text"
                    autoComplete="name"
                    value={form.full_name}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Email</label>
                  <Input
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    placeholder="email@example.com"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Password</label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    placeholder="Enter your password"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div
                    className="rounded-lg border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${error ? 'animate-shake' : ''}`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 bg-white/5 rounded-lg animate-pulse"></div>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              {/* Footer */}
              <div className="space-y-4 pt-4">
                <p className="text-white/50 text-xs text-center">
                  Protected with industry-standard encryption.
                </p>
                <p className="text-white/70 text-sm text-center">
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
