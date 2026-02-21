"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import Link from 'next/link';

import { useAuth } from "@/hooks/useAuth";
import Logo from '@/components/ui/Logo';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      setError("Please enter a valid email and password.");
      return;
    }
    try {
      await login(parsed.data);
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
          <div className="absolute w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center w-full px-12">
          <div className="space-y-6 text-center max-w-md">
            <h1 className="text-4xl font-bold text-white">
              Welcome Back to ResumePilot
            </h1>
            <p className="text-white/70 text-lg">
              Your ResumePilot dashboard is waiting.
            </p>
            
            <div className="space-y-3 pt-4">
              <div className="flex items-center space-x-3 text-white/80 text-sm">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
                <span>Track match scores</span>
              </div>
              <div className="flex items-center space-x-3 text-white/80 text-sm">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
                <span>Identify skill gaps</span>
              </div>
              <div className="flex items-center space-x-3 text-white/80 text-sm">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
                <span>Optimize for ATS systems</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="absolute right-0 top-0 h-full w-[1px] bg-white/5 hidden lg:block"></div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 bg-slate-950 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          {/* Login Card */}
          <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-10 transition-all duration-300 ease-out ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white">Sign In</h2>
                <p className="text-white/70">
                  Access your ResumePilot analytics dashboard
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Email</label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white/80">Password</label>
                    <Link 
                      href="/forgot-password" 
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 pr-12"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                    role="alert"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${error ? 'animate-shake' : ''}`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 bg-white/5 rounded-lg animate-pulse"></div>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="space-y-4 pt-4">
                <p className="text-white/50 text-xs text-center">
                  Protected with industry-standard encryption.
                </p>
                <p className="text-white/70 text-sm text-center">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                    Create one
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

