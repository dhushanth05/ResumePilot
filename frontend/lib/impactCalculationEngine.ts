/**
 * Impact Calculation Engine - Dynamic Skill Impact Assessment
 * 
 * This module provides a data-driven system for calculating the potential
 * impact of missing skills on overall match scores, replacing static values.
 */

import { categorizeSkill, normalizeSkill, CategorizedSkill, SkillCategory } from './skillCategorization';

export interface MissingSkill {
  skill: string;
  category: SkillCategory;
  priority: 'critical' | 'important' | 'nice_to_have';
  currentImpact: number;
  potentialImpact: number;
  scoreIncrease: number;
  weight: number;
}

export interface ImpactCalculationInput {
  resumeSkills: string[];
  jobSkills: string[];
  currentScore: number;
  maxPossibleScore: number;
}

export interface ImpactCalculationOutput {
  missingSkills: MissingSkill[];
  totalPotentialIncrease: number;
  potentialScore: number;
  impactDistribution: {
    critical: MissingSkill[];
    high: MissingSkill[];
    medium: MissingSkill[];
    low: MissingSkill[];
  };
}

/**
 * Skill category weights for impact calculation
 * These weights determine how much each skill category contributes to the overall score
 */
export const CATEGORY_WEIGHTS: Record<SkillCategory, number> = {
  'core_technical': 3.0,
  'backend': 2.5,
  'frontend': 2.5,
  'database': 2.0,
  'devops': 2.0,
  'ai_ml': 1.5,
  'soft_skills': 1.0,
  'bonus_skills': 0.5,
};

/**
 * Priority multipliers for impact calculation
 */
export const PRIORITY_MULTIPLIERS: Record<string, number> = {
  'critical': 1.2,
  'important': 1.0,
  'nice_to_have': 0.7,
};

/**
 * Calculate dynamic impact for missing skills
 */
export function calculateSkillImpacts(input: ImpactCalculationInput): ImpactCalculationOutput {
  const { resumeSkills, jobSkills, currentScore, maxPossibleScore } = input;
  
  // Categorize all job skills
  const categorizedJobSkills = jobSkills.map(skill => categorizeSkill(skill));
  const resumeSkillSet = new Set(resumeSkills.map(normalizeSkill));
  
  // Identify missing skills
  const missingSkills = categorizedJobSkills
    .filter(jobSkill => !resumeSkillSet.has(normalizeSkill(jobSkill.skill)))
    .map(jobSkill => calculateIndividualSkillImpact(jobSkill, jobSkills.length));
  
  // Calculate total potential increase
  const totalPotentialIncrease = calculateTotalPotentialIncrease(missingSkills, jobSkills.length);
  const potentialScore = Math.min(maxPossibleScore, currentScore + totalPotentialIncrease);
  
  // Distribute missing skills by impact level
  const impactDistribution = distributeSkillsByImpact(missingSkills);
  
  return {
    missingSkills,
    totalPotentialIncrease,
    potentialScore,
    impactDistribution,
  };
}

/**
 * Calculate individual skill impact
 */
function calculateIndividualSkillImpact(
  categorizedSkill: CategorizedSkill,
  totalJobSkills: number
): MissingSkill {
  const { skill, category, priority } = categorizedSkill;
  
  // Base weight from category
  const categoryWeight = CATEGORY_WEIGHTS[category] || 1.0;
  
  // Priority multiplier
  const priorityMultiplier = PRIORITY_MULTIPLIERS[priority] || 1.0;
  
  // Calculate normalized weight (0-1)
  const normalizedWeight = (categoryWeight * priorityMultiplier) / (3.0 * 1.2); // Normalize by max possible
  
  // Calculate potential impact as percentage of total score
  const maxImpactPerSkill = 100 / totalJobSkills; // Equal distribution baseline
  const weightedImpact = maxImpactPerSkill * normalizedWeight * 100;
  
  // Calculate score increase (capped at reasonable values)
  const scoreIncrease = Math.min(25, Math.max(2, weightedImpact * 0.15)); // 2-25% range
  
  return {
    skill,
    category,
    priority,
    currentImpact: 0, // Currently missing, so 0 impact
    potentialImpact: Math.min(100, weightedImpact),
    scoreIncrease,
    weight: normalizedWeight,
  };
}

/**
 * Calculate total potential increase from all missing skills
 */
function calculateTotalPotentialIncrease(missingSkills: MissingSkill[], totalJobSkills: number): number {
  if (missingSkills.length === 0) return 0;
  
  // Apply diminishing returns for multiple missing skills
  const diminishingReturnsFactor = calculateDiminishingReturnsFactor(missingSkills.length);
  
  // Sum individual impacts with diminishing returns
  const totalRawImpact = missingSkills.reduce((sum, skill) => sum + skill.scoreIncrease, 0);
  
  // Apply diminishing returns and cap at reasonable maximum
  const adjustedImpact = totalRawImpact * diminishingReturnsFactor;
  
  return Math.min(40, adjustedImpact); // Cap at 40% total increase
}

/**
 * Calculate diminishing returns factor for multiple skills
 */
function calculateDiminishingReturnsFactor(missingSkillsCount: number): number {
  // First few skills have full impact, subsequent skills have reduced impact
  if (missingSkillsCount <= 3) return 1.0;
  if (missingSkillsCount <= 6) return 0.8;
  if (missingSkillsCount <= 10) return 0.6;
  if (missingSkillsCount <= 15) return 0.4;
  return 0.3; // Many missing skills have diminishing individual impact
}

/**
 * Distribute missing skills by impact level
 */
function distributeSkillsByImpact(missingSkills: MissingSkill[]) {
  const distribution = {
    critical: [] as MissingSkill[],
    high: [] as MissingSkill[],
    medium: [] as MissingSkill[],
    low: [] as MissingSkill[],
  };
  
  missingSkills.forEach(skill => {
    // Determine impact level based on score increase
    if (skill.scoreIncrease >= 15) {
      distribution.critical.push(skill);
    } else if (skill.scoreIncrease >= 10) {
      distribution.high.push(skill);
    } else if (skill.scoreIncrease >= 5) {
      distribution.medium.push(skill);
    } else {
      distribution.low.push(skill);
    }
  });
  
  // Sort each category by impact (highest first)
  Object.keys(distribution).forEach(key => {
    distribution[key as keyof typeof distribution].sort((a, b) => b.scoreIncrease - a.scoreIncrease);
  });
  
  return distribution;
}

/**
 * Calculate impact for a specific skill
 */
export function calculateSkillImpact(skillName: string, jobSkills: string[]): MissingSkill {
  const categorizedSkill = categorizeSkill(skillName);
  return calculateIndividualSkillImpact(categorizedSkill, jobSkills.length);
}

/**
 * Get impact category for a given impact percentage
 */
export function getImpactCategory(impactPercentage: number): 'critical' | 'high' | 'medium' | 'low' {
  if (impactPercentage >= 15) return 'critical';
  if (impactPercentage >= 10) return 'high';
  if (impactPercentage >= 5) return 'medium';
  return 'low';
}

/**
 * Validate impact calculation consistency
 */
export function validateImpactCalculation(
  input: ImpactCalculationInput,
  output: ImpactCalculationOutput
): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check that potential score doesn't exceed maximum
  if (output.potentialScore > input.maxPossibleScore) {
    issues.push('Potential score exceeds maximum possible score');
  }
  
  // Check that total increase is reasonable
  if (output.totalPotentialIncrease > 40) {
    issues.push('Total potential increase exceeds reasonable maximum (40%)');
  }
  
  // Check that individual impacts are within bounds
  output.missingSkills.forEach(skill => {
    if (skill.scoreIncrease > 25 || skill.scoreIncrease < 0) {
      issues.push(`Invalid score increase for skill ${skill.skill}: ${skill.scoreIncrease}`);
    }
  });
  
  // Check that impacts are properly categorized
  const totalSkills = output.impactDistribution.critical.length + 
                     output.impactDistribution.high.length + 
                     output.impactDistribution.medium.length + 
                     output.impactDistribution.low.length;
  
  if (totalSkills !== output.missingSkills.length) {
    issues.push('Impact distribution does not match total missing skills');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Export utility functions for testing
 */
