"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface JobFormProps {
  onSubmit: (data: any) => void;
  submitting: boolean;
  initialData?: any;
}

const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Temporary",
  "Internship",
  "Freelance"
];

const EXPERIENCE_LEVELS = [
  "Entry Level",
  "Mid Level",
  "Senior Level",
  "Lead",
  "Manager",
  "Director",
  "Executive"
];

const WORK_MODES = [
  "Remote",
  "Hybrid",
  "On-site"
];

export function JobForm({ onSubmit, submitting, initialData }: JobFormProps) {
  const [form, setForm] = useState({
    title: initialData?.title || "",
    company: initialData?.company || "",
    location: initialData?.location || "",
    employment_type: initialData?.employment_type || "",
    experience_level: initialData?.experience_level || "",
    work_mode: initialData?.work_mode || "",
    salary_range: initialData?.salary_range || "",
    tech_stack: initialData?.tech_stack || [],
    description_text: initialData?.description_text || "",
  });

  const [techInput, setTechInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const addTechStack = () => {
    if (techInput.trim() && !form.tech_stack.includes(techInput.trim())) {
      setForm(prev => ({
        ...prev,
        tech_stack: [...prev.tech_stack, techInput.trim()]
      }));
      setTechInput("");
    }
  };

  const removeTechStack = (tech: string) => {
    setForm(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter((t: string) => t !== tech)
    }));
  };

  const handleTechInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTechStack();
    }
  };

  const characterCount = form.description_text.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Title *</label>
          <Input
            value={form.title}
            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Senior Backend Engineer"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Company</label>
          <Input
            value={form.company}
            onChange={(e) => setForm(prev => ({ ...prev, company: e.target.value }))}
            placeholder="Company name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Employment Type</label>
          <select
            value={form.employment_type}
            onChange={(e) => setForm(prev => ({ ...prev, employment_type: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">Select type</option>
            {EMPLOYMENT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Experience Level</label>
          <select
            value={form.experience_level}
            onChange={(e) => setForm(prev => ({ ...prev, experience_level: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">Select level</option>
            {EXPERIENCE_LEVELS.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Work Mode</label>
          <select
            value={form.work_mode}
            onChange={(e) => setForm(prev => ({ ...prev, work_mode: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">Select mode</option>
            {WORK_MODES.map(mode => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Location</label>
          <Input
            value={form.location}
            onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
            placeholder="e.g. San Francisco, CA"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Salary Range (Optional)</label>
          <Input
            value={form.salary_range}
            onChange={(e) => setForm(prev => ({ ...prev, salary_range: e.target.value }))}
            placeholder="e.g. $120k - $180k"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Tech Stack</label>
        <div className="flex gap-2">
          <Input
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyPress={handleTechInputKeyPress}
            placeholder="Add technology (e.g. React, Python)"
            className="flex-1"
          />
          <Button
            type="button"
            onClick={addTechStack}
            variant="outline"
            size="sm"
            className="px-3"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {form.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {form.tech_stack.map((tech: string, index: number) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {tech}
                <button
                  type="button"
                  onClick={() => removeTechStack(tech)}
                  className="ml-1 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Job Description *
          <span className="text-slate-500 ml-2 text-xs">({characterCount.toLocaleString()} characters)</span>
        </label>
        <textarea
          className="min-h-[200px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          value={form.description_text}
          onChange={(e) => setForm(prev => ({ ...prev, description_text: e.target.value }))}
          placeholder="Paste the full job description here..."
          required
        />
      </div>

      <Button 
        type="submit" 
        disabled={submitting || !form.title || !form.description_text} 
        className="w-full"
      >
        {submitting ? "Saving..." : "Save Job Description"}
      </Button>
    </form>
  );
}
