import { categorizeSkills, calculateWeightedScore, normalizeSkill, categorizeSkill, DEFAULT_CATEGORY_WEIGHTS } from './skillCategorization';
import { generateSmartRecommendations } from './smartRecommendations';
import { extractExperienceFromText, calculateExperienceRelevance } from './experienceRelevance';
import type { AnalysisDashboardResponse, KeywordGapItem } from '@/types/analysis';
import type { SmartRecommendationsResult } from './smartRecommendations';

export function enhanceAnalysisResponse(
  analysis: AnalysisDashboardResponse,
  resumeText?: string
): AnalysisDashboardResponse {
  // Categorize job skills
  const categorizedJobSkills = categorizeSkills(analysis.job_skills);
  const categorizedResumeSkills = categorizeSkills(analysis.resume_skills);
  
  // Group skills by category
  const skillsByCategory: Record<string, string[]> = {};
  categorizedJobSkills.forEach(skill => {
    if (!skillsByCategory[skill.category]) {
      skillsByCategory[skill.category] = [];
    }
    skillsByCategory[skill.category].push(skill.skill);
  });

  // Calculate weighted scores
  const weightedScoreResult = calculateWeightedScore(
    categorizedJobSkills,
    analysis.matched_skills,
    DEFAULT_CATEGORY_WEIGHTS
  );

  // Enhance keyword gap with categorization and priority
  const enhancedKeywordGap: KeywordGapItem[] = analysis.keyword_gap.map(keyword => {
    const categorizedSkill = categorizeSkill(keyword.keyword);
    return {
      ...keyword,
      category: categorizedSkill.category,
      priority: categorizedSkill.priority,
    };
  });

  // Calculate confidence score based on data quality
  const confidenceScore = calculateConfidenceScore(analysis, categorizedJobSkills.length);

  // Generate smart recommendations if we have resume text
  let smartRecommendations: SmartRecommendationsResult = {
    recommendations: [],
    summary: {
      critical_issues: 0,
      high_priority_issues: 0,
      medium_priority_issues: 0,
      low_priority_issues: 0,
      total_impact_score: 0,
    }
  };
  
  if (resumeText) {
    const experienceData = extractExperienceFromText(resumeText);
    const experienceRelevance = calculateExperienceRelevance(
      experienceData.workExperiences,
      experienceData.projects,
      analysis.job_skills,
      '' // job description would be passed here if available
    );

    smartRecommendations = generateSmartRecommendations(
      resumeText,
      analysis.resume_skills,
      analysis.job_skills,
      '',
      experienceRelevance,
      analysis.breakdown?.formatting || 0
    );
  }

  // Return enhanced analysis
  return {
    ...analysis,
    categorized_skills: skillsByCategory,
    weighted_scores: weightedScoreResult.categoryScores,
    keyword_gap: enhancedKeywordGap,
    breakdown: {
      ...analysis.breakdown,
      weighted_skill_score: weightedScoreResult.totalScore,
      category_scores: weightedScoreResult.categoryScores,
      confidence_score: confidenceScore,
      preferredSkillImpact: weightedScoreResult.preferredSkillImpact,
      bonusSkillDifferentiator: weightedScoreResult.bonusSkillDifferentiator,
    },
    smart_recommendations: smartRecommendations,
  };
}

function calculateConfidenceScore(
  analysis: AnalysisDashboardResponse,
  totalJobSkills: number
): number {
  let confidenceFactors = [];

  // Factor 1: Number of skills extracted (more skills = higher confidence)
  const skillCountScore = Math.min(analysis.job_skills.length / 10, 1); // Cap at 10 skills
  confidenceFactors.push(skillCountScore);

  // Factor 2: Match quality (higher match = higher confidence)
  confidenceFactors.push(analysis.skill_match);

  // Factor 3: ATS score consistency
  confidenceFactors.push(analysis.ats_score);

  // Factor 4: Data completeness
  const hasBreakdown = !!analysis.breakdown;
  const hasKeywordGap = analysis.keyword_gap.length > 0;
  const hasExperience = !!analysis.experience_analysis;
  const completenessScore = (hasBreakdown ? 0.3 : 0) + (hasKeywordGap ? 0.4 : 0) + (hasExperience ? 0.3 : 0);
  confidenceFactors.push(completenessScore);

  // Calculate weighted average
  const totalWeight = confidenceFactors.length;
  const weightedSum = confidenceFactors.reduce((sum, factor) => sum + factor, 0);
  
  return Math.min(weightedSum / totalWeight, 1);
}

export function createMockEnhancedAnalysis(
  baseAnalysis: AnalysisDashboardResponse,
  resumeText?: string
): AnalysisDashboardResponse {
  // This function can be used for testing/demo purposes
  // It creates mock enhanced data when the backend doesn't support it yet
  return enhanceAnalysisResponse(baseAnalysis, resumeText);
}
