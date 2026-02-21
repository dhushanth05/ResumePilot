/**
 * Smart Recommendations Engine - Dynamic Rule-Based Recommendation System
 * 
 * This module provides a data-driven recommendation engine that generates
 * contextual, priority-based improvement suggestions based on scoring results.
 */

import { ScoringResults, TechnicalBreakdown } from './unifiedScoringEngine';
import { categorizeSkill, categorizeSkills, normalizeSkill } from './skillCategorization';

export interface RecommendationInput {
  scoringResults: ScoringResults;
  resumeSkills: string[];
  jobSkills: string[];
  resumeText?: string;
  jobDescriptionText?: string;
}

export interface Recommendation {
  id: string;
  type: 'missing_critical_skill' | 'missing_preferred_skill' | 'experience_gap' | 'ats_optimization' | 'formatting_issue';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionable: string;
  impactScore: number; // 0-100
  category: string;
}

export interface SmartRecommendationsOutput {
  status: MatchStatus;
  criticalCount: number;
  highPriorityCount: number;
  mediumCount: number;
  lowCount: number;
  totalImpactPercentage: number;
  summaryMessage: string;
  recommendations: Recommendation[];
  confidenceScore: number;
}

export type MatchStatus = 
  | 'excellent_match'
  | 'strong_match_minor_improvements'
  | 'moderate_match_improvements_needed'
  | 'low_match_significant_gaps';

/**
 * Status thresholds based on overall match score
 */
const STATUS_THRESHOLDS = {
  excellent: 85,
  strong: 70,
  moderate: 50,
};

/**
 * Generate smart recommendations based on scoring results
 */
export function generateSmartRecommendations(input: RecommendationInput): SmartRecommendationsOutput {
  const { scoringResults, resumeSkills, jobSkills } = input;
  
  // Determine match status
  const status = determineMatchStatus(scoringResults.overallMatch);
  
  // Generate recommendations for each area
  const recommendations = [
    ...generateTechnicalSkillRecommendations(scoringResults.technicalBreakdown, resumeSkills, jobSkills),
    ...generateExperienceRecommendations(scoringResults.experienceBreakdown),
    ...generateATSRecommendations(scoringResults.atsBreakdown, input.resumeText),
  ];
  
  // Sort by priority and impact
  recommendations.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.impactScore - a.impactScore;
  });
  
  // Count recommendations by priority
  const counts = countRecommendationsByPriority(recommendations);
  
  // Calculate total impact
  const totalImpactPercentage = calculateTotalImpact(recommendations);
  
  // Generate summary message
  const summaryMessage = generateSummaryMessage(status, counts, totalImpactPercentage);
  
  return {
    status,
    criticalCount: counts.critical,
    highPriorityCount: counts.high,
    mediumCount: counts.medium,
    lowCount: counts.low,
    totalImpactPercentage,
    summaryMessage,
    recommendations,
    confidenceScore: scoringResults.confidenceScore,
  };
}

/**
 * Determine match status based on overall score
 */
function determineMatchStatus(overallMatch: number): MatchStatus {
  if (overallMatch >= STATUS_THRESHOLDS.excellent) {
    return 'excellent_match';
  } else if (overallMatch >= STATUS_THRESHOLDS.strong) {
    return 'strong_match_minor_improvements';
  } else if (overallMatch >= STATUS_THRESHOLDS.moderate) {
    return 'moderate_match_improvements_needed';
  } else {
    return 'low_match_significant_gaps';
  }
}

/**
 * Generate technical skill recommendations
 */
function generateTechnicalSkillRecommendations(
  technicalBreakdown: TechnicalBreakdown,
  resumeSkills: string[],
  jobSkills: string[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // Critical missing skills
  technicalBreakdown.missingCriticalSkills.forEach((skill, index) => {
    recommendations.push({
      id: `critical_skill_${index}`,
      type: 'missing_critical_skill',
      priority: 'critical',
      title: `Add ${skill} to technical skills`,
      description: `${skill} is a core technical requirement for this position and is currently missing from your resume.`,
      actionable: `Add "${skill}" to your technical skills section and highlight relevant experience using this technology.`,
      impactScore: calculateSkillImpact(skill, 'critical'),
      category: 'technical_skills',
    });
  });
  
  // Preferred missing skills
  technicalBreakdown.missingPreferredSkills.forEach((skill, index) => {
    recommendations.push({
      id: `preferred_skill_${index}`,
      type: 'missing_preferred_skill',
      priority: 'high',
      title: `Consider adding ${skill}`,
      description: `${skill} is frequently used in this role and including it would strengthen your candidacy.`,
      actionable: `If you have experience with ${skill}, add it to your skills section and provide examples in your work experience.`,
      impactScore: calculateSkillImpact(skill, 'important'),
      category: 'technical_skills',
    });
  });
  
  return recommendations;
}

/**
 * Generate experience recommendations
 */
function generateExperienceRecommendations(experienceBreakdown: any): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  if (!experienceBreakdown.meetsRequirement && experienceBreakdown.gap > 0) {
    const gap = experienceBreakdown.gap;
    
    recommendations.push({
      id: 'experience_gap',
      type: 'experience_gap',
      priority: gap > 3 ? 'critical' : gap > 1 ? 'high' : 'medium',
      title: `Address experience gap (${gap} years)`,
      description: `The position requires ${experienceBreakdown.requiredYears} years of experience, but your resume shows ${experienceBreakdown.resumeYears} years.`,
      actionable: gap > 2 
        ? `Highlight relevant projects, freelance work, or leadership roles that demonstrate equivalent experience. Consider a skills-based summary.`
        : `Emphasize relevant achievements and quantify your impact to demonstrate equivalent experience.`,
      impactScore: Math.min(80, gap * 15),
      category: 'experience',
    });
  }
  
  return recommendations;
}

/**
 * Generate ATS optimization recommendations
 */
function generateATSRecommendations(atsBreakdown: any, resumeText?: string): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // Keyword alignment issues
  if (atsBreakdown.keywordAlignment < 70) {
    recommendations.push({
      id: 'keyword_alignment',
      type: 'ats_optimization',
      priority: 'high',
      title: 'Improve keyword alignment',
      description: `Your resume could better align with key terms from the job description (${atsBreakdown.keywordAlignment}% match).`,
      actionable: `Review the job description and incorporate relevant keywords naturally throughout your resume, especially in the skills and experience sections.`,
      impactScore: Math.round((100 - atsBreakdown.keywordAlignment) * 0.8),
      category: 'ats_optimization',
    });
  }
  
  // Formatting issues
  if (atsBreakdown.formattingScore < 80) {
    recommendations.push({
      id: 'formatting_improvement',
      type: 'formatting_issue',
      priority: 'medium',
      title: 'Optimize resume formatting',
      description: `Resume formatting could be improved for better ATS readability (${atsBreakdown.formattingScore}% score).`,
      actionable: `Use standard section headers (Experience, Education, Skills), bullet points for achievements, and avoid complex formatting like tables or columns.`,
      impactScore: Math.round((100 - atsBreakdown.formattingScore) * 0.6),
      category: 'ats_optimization',
    });
  }
  
  // Section completeness
  if (atsBreakdown.sectionCompleteness < 90) {
    recommendations.push({
      id: 'section_completeness',
      type: 'formatting_issue',
      priority: 'medium',
      title: 'Complete missing sections',
      description: `Your resume appears to be missing key sections (${atsBreakdown.sectionCompleteness}% complete).`,
      actionable: `Ensure your resume includes sections for Experience, Education, and Skills. Consider adding Projects or Certifications if relevant.`,
      impactScore: Math.round((100 - atsBreakdown.sectionCompleteness) * 0.5),
      category: 'ats_optimization',
    });
  }
  
  return recommendations;
}

/**
 * Calculate skill impact based on category and priority
 */
function calculateSkillImpact(skill: string, priority: string): number {
  const categorizedSkill = categorizeSkill(skill);
  
  // Base impact by category
  let baseImpact = 50; // Default impact
  
  switch (categorizedSkill.category) {
    case 'core_technical':
      baseImpact = 85;
      break;
    case 'backend':
    case 'frontend':
    case 'database':
      baseImpact = 70;
      break;
    case 'devops':
    case 'ai_ml':
      baseImpact = 60;
      break;
    case 'soft_skills':
      baseImpact = 40;
      break;
    case 'bonus_skills':
      baseImpact = 25;
      break;
  }
  
  // Adjust by priority
  switch (priority) {
    case 'critical':
      return Math.min(95, baseImpact + 15);
    case 'important':
      return Math.min(85, baseImpact + 10);
    case 'nice_to_have':
      return Math.min(75, baseImpact + 5);
    default:
      return baseImpact;
  }
}

/**
 * Count recommendations by priority level
 */
function countRecommendationsByPriority(recommendations: Recommendation[]) {
  const counts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };
  
  recommendations.forEach(rec => {
    counts[rec.priority]++;
  });
  
  return counts;
}

/**
 * Calculate total impact percentage of all recommendations
 */
function calculateTotalImpact(recommendations: Recommendation[]): number {
  if (recommendations.length === 0) return 0;
  
  // Weight impact by priority
  const weightedImpacts = recommendations.map(rec => {
    const priorityWeight = {
      critical: 1.0,
      high: 0.8,
      medium: 0.6,
      low: 0.4,
    }[rec.priority];
    
    return rec.impactScore * priorityWeight;
  });
  
  // Calculate average weighted impact
  const totalWeightedImpact = weightedImpacts.reduce((sum, impact) => sum + impact, 0);
  const totalWeight = recommendations.reduce((sum, rec) => {
    return sum + {
      critical: 1.0,
      high: 0.8,
      medium: 0.6,
      low: 0.4,
    }[rec.priority];
  }, 0);
  
  const averageImpact = totalWeight > 0 ? totalWeightedImpact / totalWeight : 0;
  
  // Cap at 100% and normalize
  return Math.min(100, Math.round(averageImpact));
}

/**
 * Generate summary message based on status and recommendations
 */
function generateSummaryMessage(
  status: MatchStatus,
  counts: { critical: number; high: number; medium: number; low: number },
  totalImpact: number
): string {
  const totalIssues = counts.critical + counts.high + counts.medium + counts.low;
  
  switch (status) {
    case 'excellent_match':
      return totalIssues === 0 
        ? "Excellent match! Your resume aligns perfectly with the job requirements."
        : "Excellent match with minor enhancements possible. Consider the few improvements suggested to further strengthen your application.";
    
    case 'strong_match_minor_improvements':
      return `Strong match with ${totalIssues} improvement${totalIssues !== 1 ? 's' : ''} recommended. Addressing these could increase your match by up to ${totalImpact}%.`;
    
    case 'moderate_match_improvements_needed':
      return `Moderate match requiring ${totalIssues} key improvement${totalIssues !== 1 ? 's' : ''}. Focus on ${counts.critical > 0 ? `${counts.critical} critical issue${counts.critical !== 1 ? 's' : ''}` : 'the highlighted areas'} to significantly improve your match quality.`;
    
    case 'low_match_significant_gaps':
      return `Low match with ${totalIssues} significant gap${totalIssues !== 1 ? 's' : ''} identified. Priority should be given to the ${counts.critical} critical issue${counts.critical !== 1 ? 's' : ''} to make your application competitive.`;
    
    default:
      return "Review the recommendations to improve your match quality.";
  }
}

/**
 * Export utility functions for testing and validation
 */
export { determineMatchStatus, calculateSkillImpact };
