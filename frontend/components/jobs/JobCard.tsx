"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ArrowRight, Calendar, FileText } from "lucide-react";
import type { JobDescription } from "@/types/job";

interface JobCardProps {
  job: JobDescription;
  onEdit: (job: JobDescription) => void;
  onDelete: (jobId: string) => void;
  onUseInAnalysis: (jobId: string) => void;
}

export function JobCard({ job, onEdit, onDelete, onUseInAnalysis }: JobCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getVariantForBadge = (value: string | null) => {
    if (!value) return "outline";
    return "secondary";
  };

  return (
    <Card className="bg-slate-900 border-slate-700 hover:border-slate-600 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-100 mb-1">
              {job.title}
            </h3>
            <div className="text-sm text-slate-400">
              {job.company && <span>{job.company}</span>}
              {job.company && job.location && <span> • </span>}
              {job.location && <span>{job.location}</span>}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(job)}
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(job.id)}
              className="text-slate-400 hover:text-red-400 hover:bg-slate-800"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {job.employment_type && (
            <Badge variant={getVariantForBadge(job.employment_type)}>
              {job.employment_type}
            </Badge>
          )}
          {job.experience_level && (
            <Badge variant={getVariantForBadge(job.experience_level)}>
              {job.experience_level}
            </Badge>
          )}
          {job.work_mode && (
            <Badge variant={getVariantForBadge(job.work_mode)}>
              {job.work_mode}
            </Badge>
          )}
        </div>

        {job.salary_range && (
          <div className="text-sm text-slate-300">
            <span className="font-medium">Salary:</span> {job.salary_range}
          </div>
        )}

        {job.tech_stack && job.tech_stack.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-400">Tech Stack:</div>
            <div className="flex flex-wrap gap-1">
              {job.tech_stack.slice(0, 5).map((tech: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {job.tech_stack.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{job.tech_stack.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{job.word_count || 0} words</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(job.created_at)}</span>
            </div>
          </div>
          
          <Button
            size="sm"
            onClick={() => onUseInAnalysis(job.id)}
            className="bg-sky-600 hover:bg-sky-700 text-white"
          >
            Use in Analysis
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
