"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Plus, Info } from "lucide-react";
import { PriorityIndicator } from "./PriorityIndicator";

interface MissingSkill {
  skill: string;
  category: string;
  priority: 'critical' | 'important' | 'nice_to_have';
  currentImpact: number;
  potentialImpact: number;
  scoreIncrease: number;
}

interface ImpactSimulatorProps {
  missingSkills: MissingSkill[];
  currentScore: number;
  maxPossibleScore: number;
}

export function ImpactSimulator({ missingSkills, currentScore, maxPossibleScore }: ImpactSimulatorProps) {
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [showDetails, setShowDetails] = useState(false);

  const calculatePotentialScore = () => {
    let totalIncrease = 0;
    selectedSkills.forEach(skillName => {
      const skill = missingSkills.find(s => s.skill === skillName);
      if (skill) {
        totalIncrease += skill.scoreIncrease;
      }
    });
    return Math.min(currentScore + totalIncrease, maxPossibleScore);
  };

  const potentialScore = calculatePotentialScore();
  const scoreIncrease = potentialScore - currentScore;
  const scoreIncreasePercentage = Math.round((scoreIncrease / (maxPossibleScore - currentScore)) * 100);

  const toggleSkill = (skillName: string) => {
    const newSelected = new Set(selectedSkills);
    if (newSelected.has(skillName)) {
      newSelected.delete(skillName);
    } else {
      newSelected.add(skillName);
    }
    setSelectedSkills(newSelected);
  };

  const getImpactColor = (impact: number) => {
    if (impact >= 0.8) return 'text-emerald-400';
    if (impact >= 0.6) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreIncreaseColor = (increase: number) => {
    if (increase >= 15) return 'text-emerald-400 bg-emerald-500/10';
    if (increase >= 8) return 'text-amber-400 bg-amber-500/10';
    return 'text-slate-400 bg-slate-500/10';
  };

  // Sort skills by potential impact and group by impact level
  const sortedSkills = [...missingSkills].sort((a, b) => b.scoreIncrease - a.scoreIncrease);
  
  const highImpactSkills = sortedSkills.filter(skill => skill.scoreIncrease >= 0.15);
  const mediumImpactSkills = sortedSkills.filter(skill => skill.scoreIncrease >= 0.08 && skill.scoreIncrease < 0.15);
  const lowImpactSkills = sortedSkills.filter(skill => skill.scoreIncrease < 0.08);

  return (
    <div className="space-y-6">
      {/* Score Impact Summary */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-1">Score Impact Simulator</h3>
            <p className="text-sm text-slate-400">
              See how adding missing skills could improve your match score
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400 mb-1">Potential Score</div>
            <div className="text-3xl font-bold text-emerald-400">
              {Math.round(potentialScore * 100)}%
            </div>
            {scoreIncrease > 0 && (
              <div className={`text-sm font-medium px-2 py-1 rounded-lg ${getScoreIncreaseColor(scoreIncreasePercentage)}`}>
                +{Math.round(scoreIncrease * 100)}% potential increase
              </div>
            )}
          </div>
        </div>

        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
          <div className="h-full bg-slate-600" style={{ width: `${currentScore * 100}%` }} />
          {scoreIncrease > 0 && (
            <motion.div
              className="h-full bg-emerald-500"
              initial={{ width: `${currentScore * 100}%` }}
              animate={{ width: `${potentialScore * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          )}
        </div>
      </div>

      {/* Missing Skills List */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-100">Missing Skills Analysis</h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
          >
            <Info className="h-4 w-4" />
            {showDetails ? 'Simple View' : 'Detailed View'}
          </button>
        </div>

        {/* High Impact Skills */}
        {highImpactSkills.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
              <h4 className="text-sm font-medium text-slate-300">High Impact</h4>
              <span className="text-xs text-slate-500">({highImpactSkills.length} skills)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {highImpactSkills.slice(0, 6).map((skill, index) => {
                const isSelected = selectedSkills.has(skill.skill);
                const scoreIncreasePct = Math.round(skill.scoreIncrease * 100);
                
                return (
                  <motion.div
                    key={skill.skill}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-500/10' 
                        : 'border-slate-700 bg-slate-950/50 hover:bg-slate-900/70'
                    }`}
                    onClick={() => toggleSkill(skill.skill)}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSkill(skill.skill)}
                        className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-100 truncate">{skill.skill}</span>
                          <PriorityIndicator priority={skill.priority} size="sm" />
                        </div>
                        <div className="text-xs text-slate-400 capitalize mb-2">{skill.category}</div>
                        <div className={`text-xs font-medium px-2 py-1 rounded ${getScoreIncreaseColor(scoreIncreasePct)}`}>
                          +{scoreIncreasePct}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Medium Impact Skills */}
        {mediumImpactSkills.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-amber-400"></div>
              <h4 className="text-sm font-medium text-slate-300">Medium Impact</h4>
              <span className="text-xs text-slate-500">({mediumImpactSkills.length} skills)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {mediumImpactSkills.slice(0, 6).map((skill, index) => {
                const isSelected = selectedSkills.has(skill.skill);
                const scoreIncreasePct = Math.round(skill.scoreIncrease * 100);
                
                return (
                  <motion.div
                    key={skill.skill}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (highImpactSkills.length + index) * 0.05 }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-500/10' 
                        : 'border-slate-700 bg-slate-950/50 hover:bg-slate-900/70'
                    }`}
                    onClick={() => toggleSkill(skill.skill)}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSkill(skill.skill)}
                        className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-100 truncate">{skill.skill}</span>
                          <PriorityIndicator priority={skill.priority} size="sm" />
                        </div>
                        <div className="text-xs text-slate-400 capitalize mb-2">{skill.category}</div>
                        <div className={`text-xs font-medium px-2 py-1 rounded ${getScoreIncreaseColor(scoreIncreasePct)}`}>
                          +{scoreIncreasePct}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Low Impact Skills */}
        {lowImpactSkills.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-slate-400"></div>
              <h4 className="text-sm font-medium text-slate-300">Low Impact</h4>
              <span className="text-xs text-slate-500">({lowImpactSkills.length} skills)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowImpactSkills.slice(0, 6).map((skill, index) => {
                const isSelected = selectedSkills.has(skill.skill);
                const scoreIncreasePct = Math.round(skill.scoreIncrease * 100);
                
                return (
                  <motion.div
                    key={skill.skill}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (highImpactSkills.length + mediumImpactSkills.length + index) * 0.05 }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-500/10' 
                        : 'border-slate-700 bg-slate-950/50 hover:bg-slate-900/70'
                    }`}
                    onClick={() => toggleSkill(skill.skill)}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSkill(skill.skill)}
                        className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-100 truncate">{skill.skill}</span>
                          <PriorityIndicator priority={skill.priority} size="sm" />
                        </div>
                        <div className="text-xs text-slate-400 capitalize mb-2">{skill.category}</div>
                        <div className={`text-xs font-medium px-2 py-1 rounded ${getScoreIncreaseColor(scoreIncreasePct)}`}>
                          +{scoreIncreasePct}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {missingSkills.length > 18 && (
          <div className="text-center mt-4 text-sm text-slate-400">
            Showing top 18 missing skills across all impact levels. Select skills to see potential score impact.
          </div>
        )}
      </div>

      {/* Action Recommendations */}
      {selectedSkills.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-emerald-300">Recommended Actions</h3>
          </div>
          <div className="space-y-2 text-sm text-slate-200">
            <p>• Add <strong>{Array.from(selectedSkills).join(', ')}</strong> to your technical skills section</p>
            <p>• Highlight projects using these technologies</p>
            <p>• Consider online courses or certifications for missing critical skills</p>
            <p>• Update your resume to reflect these additions</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
