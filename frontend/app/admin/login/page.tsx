"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = adminLoginSchema.safeParse(form);
    if (!parsed.success) {
      setError("Please enter a valid email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        setError(data?.message ?? "Invalid credentials");
        return;
      }

      router.replace("/admin");
    } catch {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-slate-50">Admin sign in</CardTitle>
          <CardDescription className="text-slate-400">
            Use your admin credentials to access the admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Email</label>
              <Input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Password</label>
              <Input
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full bg-teal-600 text-white hover:bg-teal-500"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 border-t border-slate-800 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              How to log in
            </p>
            <div className="mt-3 space-y-2 text-sm text-slate-400">
              <p>
                Set your admin credentials in <code className="text-slate-200">frontend/.env.local</code>:
              </p>
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300">
                <div><code>ADMIN_EMAIL=&lt;your_admin_email&gt;</code></div>
                <div><code>ADMIN_PASSWORD=&lt;your_admin_password&gt;</code></div>
                <div><code>ADMIN_SESSION_SECRET=&lt;long_random_secret&gt;</code></div>
                <div><code>ADMIN_API_KEY=&lt;must_match_backend&gt;</code></div>
              </div>
              <p>
                Ensure <code className="text-slate-200">backend/.env</code> contains the same <code className="text-slate-200">ADMIN_API_KEY</code>.
              </p>
              <p>
                Start backend: <code className="text-slate-200">uvicorn app.main:app --reload</code>
              </p>
              <p>
                Start frontend: <code className="text-slate-200">npm run dev</code>
              </p>
              <p>
                Visit <code className="text-slate-200">http://localhost:3000/admin/login</code> and sign in using
                the values from <code className="text-slate-200">ADMIN_EMAIL</code> and <code className="text-slate-200">ADMIN_PASSWORD</code>. On success you’ll be redirected to <code className="text-slate-200">/admin</code>.
              </p>
              <p>
                If the cookie is missing/invalid, middleware will redirect you back to <code className="text-slate-200">/admin/login</code>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
