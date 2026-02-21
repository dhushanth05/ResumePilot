import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/hooks/useAuth";

export const metadata: Metadata = {
  title: "ResumePilot",
  description: "AI-powered resume intelligence and job match analytics platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster theme="dark" richColors />
      </body>
    </html>
  );
}

