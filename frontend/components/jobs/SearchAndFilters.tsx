"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  experienceFilter: string;
  onExperienceFilterChange: (level: string) => void;
  workModeFilter: string;
  onWorkModeFilterChange: (mode: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

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

export function SearchAndFilters({
  searchTerm,
  onSearchChange,
  experienceFilter,
  onExperienceFilterChange,
  workModeFilter,
  onWorkModeFilterChange,
  sortBy,
  onSortByChange,
  onClearFilters,
  hasActiveFilters
}: SearchAndFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by title or company..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
        />
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Filters */}
        <div className="flex-1 flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-400">Filters:</span>
          </div>
          
          {/* Experience Level Filter */}
          <select
            value={experienceFilter}
            onChange={(e) => onExperienceFilterChange(e.target.value)}
            className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-md text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Experience Levels</option>
            {EXPERIENCE_LEVELS.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>

          {/* Work Mode Filter */}
          <select
            value={workModeFilter}
            onChange={(e) => onWorkModeFilterChange(e.target.value)}
            className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-md text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Work Modes</option>
            {WORK_MODES.map(mode => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="text-slate-400 border-slate-600 hover:bg-slate-800"
            >
              <X className="h-3 w-3 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-md text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title (A-Z)</option>
            <option value="company">Company (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{searchTerm}"
              <button
                onClick={() => onSearchChange("")}
                className="ml-1 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {experienceFilter && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Experience: {experienceFilter}
              <button
                onClick={() => onExperienceFilterChange("")}
                className="ml-1 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {workModeFilter && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Work Mode: {workModeFilter}
              <button
                onClick={() => onWorkModeFilterChange("")}
                className="ml-1 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
