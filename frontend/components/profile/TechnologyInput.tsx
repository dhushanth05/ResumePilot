"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TechnologyInputProps {
  technologies: string[];
  onChange: (technologies: string[]) => void;
  placeholder?: string;
}

export function TechnologyInput({ 
  technologies, 
  onChange, 
  placeholder = "Add technology..." 
}: TechnologyInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTechnology = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !technologies.includes(trimmed)) {
      onChange([...technologies, trimmed]);
      setInputValue("");
    }
  };

  const removeTechnology = (tech: string) => {
    onChange(technologies.filter((t) => t !== tech));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTechnology();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {technologies.map((tech) => (
          <div
            key={tech}
            className="rounded-full px-3 py-1 text-sm bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-2"
          >
            <span>{tech}</span>
            <button
              type="button"
              className="text-purple-400 hover:text-red-400 transition-colors"
              onClick={() => removeTechnology(tech)}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        
        <div className="flex items-center gap-1">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="border-slate-700 bg-slate-900 text-sm text-slate-100 placeholder:text-slate-500 h-8 w-32"
          />
          <button
            type="button"
            onClick={addTechnology}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {technologies.length === 0 && (
        <p className="text-xs text-slate-500">Add at least one technology</p>
      )}
    </div>
  );
}
