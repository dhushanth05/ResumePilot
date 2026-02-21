"use client";

import { useState, useEffect } from "react";
import { Copy, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { listJobDescriptions } from "@/services/jobs";
import { getProfile } from "@/services/profile";
import type { JobDescription } from "@/types/job";
import type { FullProfile } from "@/types/profile";

export function ResumeGenerator() {
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadJobDescriptions = async () => {
      setLoading(true);
      try {
        const jobs = await listJobDescriptions();
        setJobDescriptions(jobs);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadJobDescriptions();
  }, []);

  const handleGenerate = async () => {
    if (!selectedJobId) {
      setError("Please select a job description");
      return;
    }

    setGenerating(true);
    setError(null);
    setGeneratedResume("");

    try {
      // Fetch profile data
      const profile = await getProfile();
      
      // Fetch selected job description
      const selectedJob = jobDescriptions.find(job => job.id === selectedJobId);
      
      if (!selectedJob) {
        setError("Selected job description not found");
        return;
      }

      // Call the backend API
      const response = await fetch("/api/generate-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: profile,
          jobDescription: selectedJob,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate resume: ${response.statusText}`);
      }

      const data = await response.json();
      setGeneratedResume(data.resume || "Resume generated successfully!");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedResume);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  return (
    <div className="space-y-6">
      {error && (
        <div
          className="rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Job Selection Card */}
      <Card className="bg-gradient-to-b from-slate-900/60 to-slate-950/80 ring-1 ring-slate-800/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-100">
            ResumePilot Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Select Job Description</Label>
            {loading ? (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading job descriptions...</span>
              </div>
            ) : (
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Choose a job description...</option>
                {jobDescriptions.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} {job.company && `- ${job.company}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating || !selectedJobId || loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-xl px-6 py-2.5 shadow-lg shadow-blue-500/20 hover:scale-105 transition-all duration-200"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating Resume...
              </>
            ) : (
              "Generate Tailored Resume"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resume Preview Card */}
      {generatedResume && (
        <Card className="bg-gradient-to-b from-slate-900/60 to-slate-950/80 ring-1 ring-slate-800/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-100">
                Generated Resume
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="border-slate-700 bg-transparent text-slate-100 hover:bg-slate-900"
                >
                  {copied ? (
                    <>
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleRegenerate}
                  variant="outline"
                  size="sm"
                  disabled={generating}
                  className="border-slate-700 bg-transparent text-slate-100 hover:bg-slate-900"
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Regenerate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-700 bg-slate-950/50 p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm text-slate-300 leading-relaxed">
                {generatedResume}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
