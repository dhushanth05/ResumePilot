"use client";

import { ResumeGenerator } from "@/components/profile/ResumeGenerator";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function ResumeBuilderPage() {
  return (
    <DashboardLayout 
      title="Smart Resume Builder" 
      subtitle="Generate a tailored resume based on your profile and selected job."
    >
      <ResumeGenerator />
    </DashboardLayout>
  );
}
