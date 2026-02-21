"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Info, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface WeightedScoreCardProps {
  title: string;
  score: number;
  categoryScores: Record<string, number>;
  breakdown: Record<string, { matched: number; total: number; weightedScore: number }>;
  confidence: number;
  priority?: 'critical' | 'important' | 'nice_to_have';
  showDetails?: boolean;
}

function scoreToColor(score: number) {
  const pct = score * 100;
  if (pct >= 80) return "text-emerald-400";
  if (pct >= 60) return "text-amber-400";
  return "text-rose-400";
}

function scoreToBgColor(score: number) {
  const pct = score * 100;
  if (pct >= 80) return "bg-emerald-500/20 border-emerald-500/30";
  if (pct >= 60) return "bg-amber-500/20 border-amber-500/30";
  return "bg-rose-500/20 border-rose-500/30";
}

function priorityColor(priority?: string) {
  switch (priority) {
    case 'critical': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    case 'important': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    case 'nice_to_have': return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
    default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  }
}

function confidenceIcon(confidence: number) {
  if (confidence >= 0.8) return <CheckCircle className="h-4 w-4 text-emerald-400" />;
  if (confidence >= 0.6) return <TrendingUp className="h-4 w-4 text-amber-400" />;
  return <AlertTriangle className="h-4 w-4 text-rose-400" />;
}

export function WeightedScoreCard({ 
  title, 
  score, 
  categoryScores, 
  breakdown, 
  confidence,
  priority,
  showDetails = false 
}: WeightedScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const scorePercentage = Math.round(score * 100);
  const confidencePercentage = Math.round(confidence * 100);

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-200 hover:shadow-lg ${scoreToBgColor(score)}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
            {priority && (
              <span className={`px-2 py-1 text-xs rounded-full border ${priorityColor(priority)}`}>
                {priority}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${scoreToColor(score)}`}>
                {scorePercentage}%
              </span>
              <span className="text-xs text-slate-400">match</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-slate-400">
              {confidenceIcon(confidence)}
              <span>{confidencePercentage}% confidence</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
        >
          <Info className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
          <motion.div
            className={`h-full transition-all duration-1000 ease-out ${
              scorePercentage >= 80 ? 'bg-emerald-500' : 
              scorePercentage >= 60 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${scorePercentage}%` }}
          />
        </div>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3 pt-3 border-t border-slate-700"
          >
            <div className="text-sm text-slate-300">
              <h4 className="font-medium mb-2">Category Breakdown:</h4>
              <div className="space-y-2">
                {Object.entries(categoryScores).map(([category, categoryScore]) => {
                  const breakdownData = breakdown[category];
                  const categoryPercentage = Math.round(categoryScore * 100);
                  
                  return (
                    <div key={category} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="capitalize text-slate-400">
                          {category.replace('_', ' ')}:
                        </span>
                        {breakdownData && (
                          <span className="text-slate-500">
                            ({breakdownData.matched}/{breakdownData.total})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              categoryPercentage >= 80 ? 'bg-emerald-500' : 
                              categoryPercentage >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${categoryPercentage}%` }}
                          />
                        </div>
                        <span className={`font-medium ${scoreToColor(categoryScore)}`}>
                          {categoryPercentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
