"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SKILL_CATEGORIES = [
  "Programming Languages",
  "Frameworks",
  "Tools",
  "Databases",
  "Soft Skills",
  "Other",
] as const;

type SkillCategory = typeof SKILL_CATEGORIES[number];

interface SkillInputProps {
  skill: { skill_name: string; category: string | null };
  index: number;
  onUpdate: (index: number, field: "skill_name" | "category", value: string) => void;
  onRemove: (index: number) => void;
}

export function SkillInput({ skill, index, onUpdate, onRemove }: SkillInputProps) {
  return (
    <div className="rounded-full px-3 py-1 text-sm bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center gap-2">
      <Input
        value={skill.skill_name}
        onChange={(e) => onUpdate(index, "skill_name", e.target.value)}
        placeholder="Skill name"
        className="border-none bg-transparent text-sm text-blue-300 placeholder:text-blue-400/50 p-0 h-auto w-24"
      />
      
      <select
        value={skill.category || ""}
        onChange={(e) => onUpdate(index, "category", e.target.value)}
        className="bg-transparent border-none text-xs text-blue-200 focus:outline-none cursor-pointer"
      >
        <option value="" className="bg-slate-900">No category</option>
        {SKILL_CATEGORIES.map((category) => (
          <option key={category} value={category} className="bg-slate-900">
            {category}
          </option>
        ))}
      </select>
      
      <button
        type="button"
        className="text-blue-400 hover:text-red-400 transition-colors"
        onClick={() => onRemove(index)}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

export function SkillsList({ 
  skills, 
  onUpdate, 
  onRemove, 
  onAdd 
}: { 
  skills: { skill_name: string; category: string | null }[];
  onUpdate: (index: number, field: "skill_name" | "category", value: string) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
}) {
  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedSkills).map(([category, categorySkills]) => (
        <div key={category} className="space-y-2">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {category}
          </div>
          <div className="flex flex-wrap gap-2">
            {categorySkills.map((skill, i) => {
              const globalIndex = skills.indexOf(skill);
              return (
                <SkillInput
                  key={globalIndex}
                  skill={skill}
                  index={globalIndex}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                />
              );
            })}
          </div>
        </div>
      ))}
      
      {skills.length === 0 && (
        <p className="text-sm text-slate-500">No skills added yet.</p>
      )}
    </div>
  );
}
