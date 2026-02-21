"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ResumeUploadSection } from "@/components/resumes/ResumeUploadSection";

export default function ResumesPage() {
  return (
    <DashboardLayout
      title="Resumes"
      subtitle="Upload resumes and keep everything organized."
    >
      <div className="space-y-8">
        <div className="border-b border-slate-800/40 pb-6">
        </div>
        <ResumeUploadSection />
      </div>
    </DashboardLayout>
  );
}
