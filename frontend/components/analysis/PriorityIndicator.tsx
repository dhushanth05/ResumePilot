"use client";

import { useState } from "react";
import { AlertTriangle, Info, CheckCircle, Star } from "lucide-react";

interface PriorityIndicatorProps {
  priority: 'critical' | 'important' | 'nice_to_have';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const priorityConfig = {
  critical: {
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
    icon: AlertTriangle,
    label: 'Critical',
    description: 'Must-have skill for this position'
  },
  important: {
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    icon: Star,
    label: 'Important',
    description: 'Significantly improves candidacy'
  },
  nice_to_have: {
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/20',
    icon: Info,
    label: 'Nice to Have',
    description: 'Bonus skill that sets you apart'
  }
};

const sizeConfig = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
};

export function PriorityIndicator({ priority, showLabel = false, size = 'md' }: PriorityIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const config = priorityConfig[priority];
  const Icon = config.icon;
  const iconSize = sizeConfig[size];

  return (
    <div className="relative inline-block">
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border ${config.bgColor} ${config.borderColor} cursor-help`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Icon className={`${iconSize} ${config.color}`} />
        {showLabel && (
          <span className={`text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
        )}
      </div>
      
      {showTooltip && (
        <div className="absolute z-50 px-3 py-1.5 text-xs text-slate-100 bg-slate-900 border border-slate-700 rounded-md shadow-lg whitespace-nowrap bottom-full left-1/2 transform -translate-x-1/2 mb-2">
          {config.description}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}
