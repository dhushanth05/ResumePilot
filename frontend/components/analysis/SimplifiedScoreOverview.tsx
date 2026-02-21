"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Target, Brain, CheckCircle } from "lucide-react";

interface SimplifiedScoreOverviewProps {
  overallMatch: number;
  technicalFit: number;
  experienceFit: number;
  atsOptimization: number;
  confidenceScore: number;
  breakdown?: {
    category_scores: Record<string, number>;
    preferredSkillImpact: number;
    bonusSkillDifferentiator: number;
  };
}

function scoreToColor(score: number) {
  const pct = score * 100;
  if (pct >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  if (pct >= 60) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  return "text-rose-400 bg-rose-500/10 border-rose-500/20";
}

function scoreToProgressColor(score: number) {
  const pct = score * 100;
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 60) return "bg-amber-500";
  return "bg-rose-500";
}

export function SimplifiedScoreOverview({ 
  overallMatch, 
  technicalFit, 
  experienceFit, 
  atsOptimization, 
  confidenceScore,
  breakdown
}: SimplifiedScoreOverviewProps) {
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  const metrics = [
    {
      id: 'overall',
      label: 'Overall Match',
      value: overallMatch,
      icon: Target,
      description: 'Combined score of all factors',
      details: breakdown ? `Technical: ${Math.round(technicalFit * 100)}%, Experience: ${Math.round(experienceFit * 100)}%` : ''
    },
    {
      id: 'technical',
      label: 'Technical Fit',
      value: technicalFit,
      icon: Brain,
      description: 'Core and preferred technical skills alignment',
      details: breakdown ? `Core skills: ${Math.round((breakdown.category_scores?.core_technical || 0) * 100)}%, Preferred impact: ${breakdown.preferredSkillImpact}%` : ''
    },
    {
      id: 'experience',
      label: 'Experience Fit',
      value: experienceFit,
      icon: TrendingUp,
      description: 'Project and role alignment',
      details: 'Based on stack overlap, project relevance, and internship alignment'
    },
    {
      id: 'ats',
      label: 'ATS Optimization',
      value: atsOptimization,
      icon: CheckCircle,
      description: 'Resume formatting and keyword optimization',
      details: 'Includes formatting, keyword coverage, and ATS compatibility'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const percentage = Math.round(metric.value * 100);
          
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div 
                className={`p-4 rounded-xl border ${scoreToColor(metric.value)} cursor-pointer transition-all duration-200 hover:shadow-lg`}
                onClick={() => setExpandedMetric(expandedMetric === metric.id ? null : metric.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <span className="font-semibold text-slate-100">{metric.label}</span>
                  </div>
                  <span className="text-2xl font-bold">{percentage}%</span>
                </div>
                
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className={`h-full ${scoreToProgressColor(metric.value)} transition-all duration-1000 ease-out`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="mt-2 text-xs text-slate-400">
                  {metric.description}
                </div>
              </div>
              
              {/* Expanded Details */}
              {expandedMetric === metric.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="absolute z-10 top-full left-0 right-0 mt-2 p-4 bg-slate-900 border border-slate-700 rounded-xl shadow-xl"
                >
                  <h4 className="font-semibold text-slate-100 mb-2">{metric.label} Details</h4>
                  <p className="text-sm text-slate-300">{metric.details}</p>
                  
                  {metric.id === 'technical' && breakdown && (
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Bonus Skills:</span>
                        <span className="text-slate-200">{breakdown.bonusSkillDifferentiator}%</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Confidence Score */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-1">Analysis Confidence</h3>
            <p className="text-sm text-slate-400">
              Reliability of this analysis based on data quality
            </p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${scoreToColor(confidenceScore)}`}>
              {Math.round(confidenceScore * 100)}%
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {confidenceScore >= 0.8 ? 'High' : confidenceScore >= 0.6 ? 'Medium' : 'Low'} Confidence
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
