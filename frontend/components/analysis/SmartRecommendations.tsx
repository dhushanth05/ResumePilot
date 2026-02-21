"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Star, Info, TrendingUp, Target, Lightbulb } from "lucide-react";
import { PriorityIndicator } from "./PriorityIndicator";

interface SmartRecommendation {
  type: string;
  priority: string;
  title: string;
  description: string;
  actionable: string;
  impact_score: number;
}

interface SmartRecommendationsProps {
  recommendations: SmartRecommendation[];
  summary: {
    critical_issues: number;
    high_priority_issues: number;
    medium_priority_issues: number;
    low_priority_issues: number;
    total_impact_score: number;
  };
}

const recommendationIcons = {
  missing_critical_skill: AlertTriangle,
  missing_important_skill: Star,
  missing_bonus_skill: Info,
  formatting: Target,
  impact_metric: TrendingUp,
  experience_gap: Lightbulb,
};

const priorityOrder = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function SmartRecommendations({ recommendations, summary }: SmartRecommendationsProps) {
  const getPriorityLevel = (priority: string): 'critical' | 'important' | 'nice_to_have' => {
    switch (priority) {
      case 'critical': return 'critical';
      case 'high': return 'important';
      case 'medium': return 'nice_to_have';
      case 'low': return 'nice_to_have';
      default: return 'nice_to_have';
    }
  };

  const getImpactColor = (impact: number) => {
    if (impact >= 0.7) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (impact >= 0.5) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  };

  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityDiff = priorityOrder[b.priority as keyof typeof priorityOrder] - 
                        priorityOrder[a.priority as keyof typeof priorityOrder];
    if (priorityDiff !== 0) return priorityDiff;
    return b.impact_score - a.impact_score;
  });

  return (
    <div className="space-y-4">
      {/* Compact Summary and Status */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Summary Stats - Left */}
        <div className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                <span className="text-xs font-medium text-rose-400">Critical</span>
              </div>
              <div className="text-lg font-bold text-rose-300">{summary.critical_issues}</div>
            </div>
            
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Star className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs font-medium text-amber-400">High</span>
              </div>
              <div className="text-lg font-bold text-amber-300">{summary.high_priority_issues}</div>
            </div>
            
            <div className="rounded-lg bg-sky-500/10 border border-sky-500/20 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Info className="h-3.5 w-3.5 text-sky-400" />
                <span className="text-xs font-medium text-sky-400">Medium</span>
              </div>
              <div className="text-lg font-bold text-sky-300">{summary.medium_priority_issues}</div>
            </div>
            
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">Impact</span>
              </div>
              <div className="text-lg font-bold text-emerald-300">
                {Math.round(summary.total_impact_score * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Status Message - Right */}
        <div className="lg:w-80">
          <div className="rounded-lg border border-slate-800/50 bg-slate-950/40 p-4 h-full">
            {recommendations.length === 0 ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500/10 rounded-full mb-3">
                  <TrendingUp className="h-6 w-6 text-emerald-400" />
                </div>
                <h4 className="text-sm font-semibold text-slate-100 mb-1">Excellent match!</h4>
                <p className="text-xs text-slate-400">
                  Your resume aligns well with the job requirements.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-slate-400" />
                  <h4 className="text-sm font-medium text-slate-300">Improvement Path</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''} available to increase your match quality by up to <span className="text-emerald-400 font-medium">{Math.round(summary.total_impact_score * 100)}%</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        {sortedRecommendations.slice(0, 5).map((recommendation, index) => {
          const Icon = recommendationIcons[recommendation.type as keyof typeof recommendationIcons] || Info;
          const priorityLevel = getPriorityLevel(recommendation.priority);
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="rounded-lg border border-slate-800 bg-slate-900/30 p-4 hover:bg-slate-900/50 transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-slate-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-semibold text-slate-100 truncate">
                      {recommendation.title}
                    </h4>
                    <PriorityIndicator priority={priorityLevel} size="sm" />
                    <div className={`px-1.5 py-0.5 text-xs rounded-full border ${getImpactColor(recommendation.impact_score)}`}>
                      {Math.round(recommendation.impact_score * 100)}%
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                    {recommendation.description}
                  </p>
                  
                  <div className="rounded-md bg-slate-950/50 border border-slate-800 p-2">
                    <p className="text-xs text-slate-400">
                      <span className="font-medium">Action:</span> {recommendation.actionable}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {recommendations.length > 5 && (
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Showing top 5 recommendations of {recommendations.length} total
          </p>
        </div>
      )}
    </div>
  );
}
