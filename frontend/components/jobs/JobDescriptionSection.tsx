"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobForm } from "./JobForm";
import { JobCard } from "./JobCard";
import { SearchAndFilters } from "./SearchAndFilters";
import { createJobDescription, listJobDescriptions, deleteJobDescription } from "@/services/jobs";
import type { JobDescription, JobDescriptionCreate } from "@/types/job";

export function JobDescriptionSection() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobDescription | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [workModeFilter, setWorkModeFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await listJobDescriptions();
      setJobs(data);
    } catch {
      // ignore for now
    }
  };

  const handleSubmit = async (formData: JobDescriptionCreate) => {
    setError(null);
    setSubmitting(true);
    try {
      if (editingJob) {
        // TODO: Implement update functionality
        await createJobDescription(formData);
      } else {
        await createJobDescription(formData);
      }
      setShowForm(false);
      setEditingJob(null);
      await loadJobs();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (job: JobDescription) => {
    setEditingJob(job);
    setShowForm(true);
  };

  const handleDelete = async (jobId: string) => {
    if (confirm("Are you sure you want to delete this job description?")) {
      try {
        await deleteJobDescription(jobId);
        await loadJobs();
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  const handleUseInAnalysis = (jobId: string) => {
    router.push(`/analysis?jobId=${jobId}`);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setExperienceFilter("");
    setWorkModeFilter("");
    setSortBy("newest");
  };

  // Filter and sort jobs
  const filteredAndSortedJobs = jobs
    .filter(job => {
      const matchesSearch = !searchTerm || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.company && job.company.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesExperience = !experienceFilter || job.experience_level === experienceFilter;
      const matchesWorkMode = !workModeFilter || job.work_mode === workModeFilter;
      
      return matchesSearch && matchesExperience && matchesWorkMode;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "company":
          return (a.company || "").localeCompare(b.company || "");
        default:
          return 0;
      }
    });

  const hasActiveFilters = searchTerm || experienceFilter || workModeFilter;

  return (
    <div className="space-y-6">
      {/* Add Job Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Job Storage</h2>
          <p className="text-slate-400">Save and manage job descriptions for analysis</p>
        </div>
        <Button
          onClick={() => {
            setEditingJob(null);
            setShowForm(true);
          }}
          className="bg-sky-600 hover:bg-sky-700"
        >
          Add Job Description
        </Button>
      </div>

      {/* Job Form Modal/Card */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingJob ? "Edit Job Description" : "Add New Job Description"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <JobForm
              onSubmit={handleSubmit}
              submitting={submitting}
              initialData={editingJob}
            />
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingJob(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      {jobs.length > 0 && (
        <SearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          experienceFilter={experienceFilter}
          onExperienceFilterChange={setExperienceFilter}
          workModeFilter={workModeFilter}
          onWorkModeFilterChange={setWorkModeFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onClearFilters={handleClearFilters}
          hasActiveFilters={!!hasActiveFilters}
        />
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-900 bg-red-950/20">
          <CardContent className="pt-6">
            <p className="text-red-400 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredAndSortedJobs.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-slate-400">
                {jobs.length === 0 ? (
                  <div>
                    <p className="text-lg font-medium mb-2">No job descriptions yet</p>
                    <p className="text-sm">Create your first job description to use in analyses.</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium mb-2">No jobs found</p>
                    <p className="text-sm">Try adjusting your search or filters.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredAndSortedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onUseInAnalysis={handleUseInAnalysis}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

