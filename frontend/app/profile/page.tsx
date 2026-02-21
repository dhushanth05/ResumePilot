"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2, X } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SkillsList } from "@/components/profile/SkillInput";
import { TechnologyInput } from "@/components/profile/TechnologyInput";
import {
  getProfile,
  updateProfile,
} from "@/services/profile";
import type {
  Education,
  Experience,
  FullProfile,
  Project,
  ProfileUpdatePayload,
  Skill,
} from "@/types/profile";

function emptyProfile(): {
  full_name: string;
  email: string;
  phone: string;
  summary: string;
  location: string;
  linkedin_url: string;
  github_url: string;
} {
  return { 
    full_name: "", 
    email: "", 
    phone: "", 
    summary: "",
    location: "",
    linkedin_url: "",
    github_url: ""
  };
}

function emptyEducation(): NonNullable<ProfileUpdatePayload["education"]>[0] {
  return {
    institution: "",
    degree: "",
    field_of_study: "",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
  };
}

function emptyExperience(): NonNullable<ProfileUpdatePayload["experience"]>[0] {
  return {
    company: "",
    job_title: "",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
  };
}

function emptyProject(): NonNullable<ProfileUpdatePayload["projects"]>[0] {
  return { project_name: "", description: "", technologies: [] };
}

export default function ProfilePage() {
  const [data, setData] = useState<FullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [personal, setPersonal] = useState(emptyProfile());
  const [skills, setSkills] = useState<{ skill_name: string; category: string | null }[]>([]);
  const [education, setEducation] = useState<
    ProfileUpdatePayload["education"]
  >([]);
  const [experience, setExperience] = useState<
    ProfileUpdatePayload["experience"]
  >([]);
  const [projects, setProjects] = useState<
    ProfileUpdatePayload["projects"]
  >([]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await getProfile();
      setData(p);
      setPersonal({
        full_name: p.profile?.full_name ?? "",
        email: p.profile?.email ?? "",
        phone: p.profile?.phone ?? "",
        summary: p.profile?.summary ?? "",
        location: p.profile?.location ?? "",
        linkedin_url: p.profile?.linkedin_url ?? "",
        github_url: p.profile?.github_url ?? "",
      });
      setSkills(
        p.skills.map((s) => ({ skill_name: s.skill_name, category: s.category ?? null }))
      );
      setEducation(
        p.education?.length
          ? p.education.map((e) => ({
              institution: e.institution ?? "",
              degree: e.degree ?? "",
              field_of_study: e.field_of_study ?? "",
              start_date: e.start_date ?? "",
              end_date: e.end_date ?? "",
              is_current: e.is_current ?? false,
              description: e.description ?? "",
            }))
          : [emptyEducation()]
      );
      setExperience(
        p.experience?.length
          ? p.experience.map((e) => ({
              company: e.company ?? "",
              job_title: e.job_title ?? "",
              start_date: e.start_date ?? "",
              end_date: e.end_date ?? "",
              is_current: e.is_current ?? false,
              description: e.description ?? "",
            }))
          : [emptyExperience()]
      );
      setProjects(
        p.projects?.length
          ? p.projects.map((pr) => ({
              project_name: pr.project_name ?? "",
              description: pr.description ?? "",
              technologies: pr.technologies ?? [],
            }))
          : [emptyProject()]
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);
  

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload: ProfileUpdatePayload = {
        profile: {
          full_name: personal.full_name || null,
          email: personal.email || null,
          phone: personal.phone || null,
          summary: personal.summary || null,
          location: personal.location || null,
          linkedin_url: personal.linkedin_url || null,
          github_url: personal.github_url || null,
        },
        skills: skills.filter((s) => s.skill_name.trim()),
        education: (education || [])
          .filter(
            (e) =>
              e.institution?.trim() ||
              e.degree?.trim() ||
              e.field_of_study?.trim() ||
              e.description?.trim()
          )
          .map((e) => ({
            institution: e.institution?.trim() || null,
            degree: e.degree?.trim() || null,
            field_of_study: e.field_of_study?.trim() || null,
            start_date: e.start_date?.trim() || null,
            end_date: e.is_current ? null : e.end_date?.trim() || null,
            is_current: e.is_current,
            description: e.description?.trim() || null,
          }))
          .sort((a, b) => {
            // Sort by start_date descending (latest first)
            const dateA = a.start_date || "";
            const dateB = b.start_date || "";
            return dateB.localeCompare(dateA);
          }),
        experience: (experience || [])
          .filter(
            (e) =>
              e.company?.trim() ||
              e.job_title?.trim() ||
              e.start_date?.trim() ||
              e.end_date?.trim() ||
              e.description?.trim()
          )
          .map((e) => ({
            company: e.company?.trim() || null,
            job_title: e.job_title?.trim() || null,
            start_date: e.start_date?.trim() || null,
            end_date: e.is_current ? null : e.end_date?.trim() || null,
            is_current: e.is_current,
            description: e.description?.trim() || null,
          }))
          .sort((a, b) => {
            // Sort by start_date descending (latest first)
            const dateA = a.start_date || "";
            const dateB = b.start_date || "";
            return dateB.localeCompare(dateA);
          }),
        projects: (projects || [])
          .filter(
            (p) =>
              p.project_name?.trim() ||
              p.description?.trim() ||
              (p.technologies && p.technologies.length > 0)
          )
          .map((p) => ({
            project_name: p.project_name?.trim() || null,
            description: p.description?.trim() || null,
            technologies:
              p.technologies?.filter(Boolean).length ?? 0 > 0 ? p.technologies! : null,
          })),
      };
      const updated = await updateProfile(payload);
      setData(updated);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => setSkills((prev) => [...prev, { skill_name: "", category: null }]);
  const removeSkill = (i: number) =>
    setSkills((prev) => prev.filter((_, idx) => idx !== i));
  const updateSkill = (i: number, field: "skill_name" | "category", value: string) =>
    setSkills((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s))
    );

  const addEducation = () => setEducation((prev) => [...(prev || []), emptyEducation()]);
  const removeEducation = (i: number) =>
    setEducation((prev) => (prev || []).filter((_, idx) => idx !== i));
  const updateEducation = (
    i: number,
    field: keyof ReturnType<typeof emptyEducation>,
    value: string | boolean
  ) =>
    setEducation((prev) =>
      (prev || []).map((e, idx) => (idx === i ? { ...e, [field]: value } : e))
    );

  const addExperience = () => setExperience((prev) => [...(prev || []), emptyExperience()]);
  const removeExperience = (i: number) =>
    setExperience((prev) => (prev || []).filter((_, idx) => idx !== i));
  const updateExperience = (
    i: number,
    field: keyof ReturnType<typeof emptyExperience>,
    value: string | boolean
  ) =>
    setExperience((prev) =>
      (prev || []).map((e, idx) => (idx === i ? { ...e, [field]: value } : e))
    );

  const addProject = () => setProjects((prev) => [...(prev || []), emptyProject()]);
  const removeProject = (i: number) =>
    setProjects((prev) => (prev || []).filter((_, idx) => idx !== i));
  const updateProject = (
    i: number,
    field: "project_name" | "description" | "technologies",
    value: string | string[]
  ) =>
    setProjects((prev) =>
      (prev || []).map((p, idx) =>
        idx === i
          ? {
              ...p,
              [field]: field === "technologies" 
                ? (Array.isArray(value) ? value : value.split(",").map((s) => s.trim()).filter(Boolean))
                : value,
            }
          : p
      )
    );

  if (loading) {
    return (
      <DashboardLayout title="Profile" subtitle="Your structured resume profile.">
        <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Profile" subtitle="View and edit your auto-generated or manual profile.">
      <div className="grid gap-6">
        {error && (
          <div
            className="rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* PHASE 1 - Premium Profile Header Card */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-900/70 to-slate-950/90 ring-1 ring-slate-800/50 p-6 flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xl font-bold text-white">
              {personal.full_name.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-100">
                {personal.full_name || "Your Name"}
              </div>
              <div className="text-sm text-slate-400">
                {personal.email || "email@example.com"}
              </div>
            </div>
          </div>
          <div className="rounded-full px-3 py-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Profile 80% Complete
          </div>
        </div>

        {/* PHASE 2 - Personal Info Section */}
        <div className="rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 ring-1 ring-slate-800/50 shadow-lg shadow-black/20 p-6 space-y-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
          <h2 className="text-lg font-semibold text-slate-100">Personal info</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-slate-300">Full name</Label>
              <Input
                value={personal.full_name}
                onChange={(e) => setPersonal((p) => ({ ...p, full_name: e.target.value }))}
                placeholder="Your name"
                className="border-slate-700 bg-slate-900"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Email</Label>
              <Input
                type="email"
                value={personal.email}
                onChange={(e) => setPersonal((p) => ({ ...p, email: e.target.value }))}
                placeholder="email@example.com"
                className="border-slate-700 bg-slate-900"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-slate-300">Phone</Label>
              <Input
                value={personal.phone}
                onChange={(e) => setPersonal((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+1 234 567 8900"
                className="border-slate-700 bg-slate-900"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-slate-300">Summary</Label>
              <textarea
                value={personal.summary}
                onChange={(e) => setPersonal((p) => ({ ...p, summary: e.target.value }))}
                placeholder="Brief professional summary"
                rows={3}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Location</Label>
              <Input
                value={personal.location}
                onChange={(e) => setPersonal((p) => ({ ...p, location: e.target.value }))}
                placeholder="City, Country"
                className="border-slate-700 bg-slate-900"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">LinkedIn URL</Label>
              <Input
                type="url"
                value={personal.linkedin_url}
                onChange={(e) => setPersonal((p) => ({ ...p, linkedin_url: e.target.value }))}
                placeholder="https://linkedin.com/in/yourprofile"
                className="border-slate-700 bg-slate-900"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">GitHub URL</Label>
              <Input
                type="url"
                value={personal.github_url}
                onChange={(e) => setPersonal((p) => ({ ...p, github_url: e.target.value }))}
                placeholder="https://github.com/yourusername"
                className="border-slate-700 bg-slate-900"
              />
            </div>
          </div>
        </div>

        {/* PHASE 2 - Skills Section with Categories */}
        <div className="rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 ring-1 ring-slate-800/50 shadow-lg shadow-black/20 p-6 space-y-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Skills</h2>
            <Button type="button" variant="outline" size="sm" onClick={addSkill}>
              <Plus className="h-4 w-4" />
              <span className="ml-1">Add</span>
            </Button>
          </div>
          <SkillsList
            skills={skills}
            onUpdate={updateSkill}
            onRemove={removeSkill}
            onAdd={addSkill}
          />
        </div>

        {/* PHASE 2 - Education Section */}
        <div className="rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 ring-1 ring-slate-800/50 shadow-lg shadow-black/20 p-6 space-y-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Education</h2>
            <Button type="button" variant="outline" size="sm" onClick={addEducation}>
              <Plus className="h-4 w-4" />
              <span className="ml-1">Add</span>
            </Button>
          </div>
          <div className="space-y-6">
            {(education || []).map((e, i) => (
              <div
                key={i}
                className="rounded-xl bg-slate-900/50 ring-1 ring-slate-800/40 p-5 space-y-4"
              >
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-400"
                    onClick={() => removeEducation(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-slate-400">Institution</Label>
                    <Input
                      value={e.institution ?? ""}
                      onChange={(ev) => updateEducation(i, "institution", ev.target.value)}
                      className="border-slate-700 bg-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-400">Degree</Label>
                    <Input
                      value={e.degree ?? ""}
                      onChange={(ev) => updateEducation(i, "degree", ev.target.value)}
                      className="border-slate-700 bg-slate-900"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-slate-400">Field of study</Label>
                    <Input
                      value={e.field_of_study ?? ""}
                      onChange={(ev) => updateEducation(i, "field_of_study", ev.target.value)}
                      className="border-slate-700 bg-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-400">Start date</Label>
                    <Input
                      type="month"
                      value={e.start_date ?? ""}
                      onChange={(ev) => updateEducation(i, "start_date", ev.target.value)}
                      className="border-slate-700 bg-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-400">End date</Label>
                    <div className="space-y-2">
                      <Input
                        type="month"
                        value={e.is_current ? "" : e.end_date ?? ""}
                        onChange={(ev) => updateEducation(i, "end_date", ev.target.value)}
                        disabled={e.is_current}
                        placeholder="e.g. 2022"
                        className="border-slate-700 bg-slate-900 disabled:opacity-50"
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`edu-current-${i}`}
                          checked={e.is_current}
                          onChange={(ev) => {
                            updateEducation(i, "is_current", ev.target.checked);
                            if (ev.target.checked) {
                              updateEducation(i, "end_date", "");
                            }
                          }}
                          className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                        />
                        <Label htmlFor={`edu-current-${i}`} className="text-xs text-slate-400">
                          Currently studying
                        </Label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-slate-400">Description</Label>
                    <textarea
                      value={e.description ?? ""}
                      onChange={(ev) => updateEducation(i, "description", ev.target.value)}
                      rows={2}
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PHASE 2 - Experience Section */}
        <div className="rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 ring-1 ring-slate-800/50 shadow-lg shadow-black/20 p-6 space-y-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Experience</h2>
            <Button type="button" variant="outline" size="sm" onClick={addExperience}>
              <Plus className="h-4 w-4" />
              <span className="ml-1">Add</span>
            </Button>
          </div>
          <div className="space-y-6">
            {(experience || []).map((e, i) => (
              <div
                key={i}
                className="rounded-xl bg-slate-900/50 ring-1 ring-slate-800/40 p-5 space-y-4"
              >
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-400"
                    onClick={() => removeExperience(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-slate-400">Company</Label>
                    <Input
                      value={e.company ?? ""}
                      onChange={(ev) => updateExperience(i, "company", ev.target.value)}
                      className="border-slate-700 bg-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-400">Job title</Label>
                    <Input
                      value={e.job_title ?? ""}
                      onChange={(ev) => updateExperience(i, "job_title", ev.target.value)}
                      className="border-slate-700 bg-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-400">Start date</Label>
                    <Input
                      type="month"
                      value={e.start_date ?? ""}
                      onChange={(ev) => updateExperience(i, "start_date", ev.target.value)}
                      className="border-slate-700 bg-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-400">End date</Label>
                    <div className="space-y-2">
                      <Input
                        type="month"
                        value={e.is_current ? "" : e.end_date ?? ""}
                        onChange={(ev) => updateExperience(i, "end_date", ev.target.value)}
                        disabled={e.is_current}
                        placeholder="e.g. 2022"
                        className="border-slate-700 bg-slate-900 disabled:opacity-50"
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`exp-current-${i}`}
                          checked={e.is_current}
                          onChange={(ev) => {
                            updateExperience(i, "is_current", ev.target.checked);
                            if (ev.target.checked) {
                              updateExperience(i, "end_date", "");
                            }
                          }}
                          className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                        />
                        <Label htmlFor={`exp-current-${i}`} className="text-xs text-slate-400">
                          Currently working
                        </Label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-slate-400">Description</Label>
                    <textarea
                      value={e.description ?? ""}
                      onChange={(ev) => updateExperience(i, "description", ev.target.value)}
                      rows={3}
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PHASE 2 - Projects Section */}
        <div className="rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 ring-1 ring-slate-800/50 shadow-lg shadow-black/20 p-6 space-y-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Projects</h2>
            <Button type="button" variant="outline" size="sm" onClick={addProject}>
              <Plus className="h-4 w-4" />
              <span className="ml-1">Add</span>
            </Button>
          </div>
          <div className="space-y-6">
            {(projects || []).map((p, i) => (
              <div
                key={i}
                className="rounded-xl bg-slate-900/50 ring-1 ring-slate-800/40 p-5 space-y-4"
              >
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-400"
                    onClick={() => removeProject(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-slate-400">Project name</Label>
                    <Input
                      value={p.project_name ?? ""}
                      onChange={(ev) => updateProject(i, "project_name", ev.target.value)}
                      className="border-slate-700 bg-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-400">Description</Label>
                    <textarea
                      value={p.description ?? ""}
                      onChange={(ev) => updateProject(i, "description", ev.target.value)}
                      rows={2}
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-400">Technologies</Label>
                    <TechnologyInput
                      technologies={p.technologies || []}
                      onChange={(techs) => updateProject(i, "technologies", techs)}
                      placeholder="Add technology..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PHASE 5 - Premium Save Button */}
        <div className="sticky bottom-6 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-xl px-6 py-2.5 shadow-lg shadow-blue-500/20 hover:scale-105 transition-all duration-200"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="ml-2">{saving ? "Saving..." : "Save changes"}</span>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
