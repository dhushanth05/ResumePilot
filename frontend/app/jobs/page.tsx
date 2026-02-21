"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { JobDescriptionSection } from "@/components/jobs/JobDescriptionSection";

export default function JobsPage() {
  return (
    <DashboardLayout
      title="Job Descriptions"
      subtitle="Save job descriptions you want to target in your analyses."
    >
      <div className="grid gap-6">
        <JobDescriptionSection />
      </div>
    </DashboardLayout>
  );
}
