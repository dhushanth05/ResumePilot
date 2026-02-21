/**
 * Unified Scoring Engine - Production-ready Resume-Job Analysis System
 * 
 * This module provides a single authoritative scoring engine that calculates
 * consistent, data-driven metrics for resume-job matching.
 */

import { categorizeSkill, categorizeSkills, normalizeSkill, CategorizedSkill, SkillCategory } from './skillCategorization';

export interface ScoringInputs {
  resumeSkills: string[];
  jobSkills: string[];
  resumeExperienceYears?: number;
  requiredExperienceYears?: number;
  resumeText?: string;
  jobDescriptionText?: string;
}

export interface ScoringResults {
  // Core metrics (0-100)
  technicalFit: number;
  experienceFit: number;
  atsOptimization: number;
  overallMatch: number;
  
  // Detailed breakdowns
  technicalBreakdown: TechnicalBreakdown;
  experienceBreakdown: ExperienceBreakdown;
  atsBreakdown: ATSBreakdown;
  
  // Metadata
  confidenceScore: number;
  analysisTimestamp: Date;
}

export interface TechnicalBreakdown {
  coreTechnicalScore: number;
  preferredSkillsScore: number;
  bonusSkillsScore: number;
  matchedSkills: string[];
  missingCriticalSkills: string[];
  missingPreferredSkills: string[];
  totalRequiredSkills: number;
  totalMatchedSkills: number;
}

export interface ExperienceBreakdown {
  resumeYears: number;
  requiredYears: number;
  gap: number;
  gapPenalty: number;
  hasExperience: boolean;
  meetsRequirement: boolean;
}

export interface ATSBreakdown {
  keywordAlignment: number;
  formattingScore: number;
  sectionCompleteness: number;
  keywordDensity: number;
}

/**
 * Skill category weights for impact calculation
 */
export const SKILL_IMPACT_WEIGHTS: Record<string, number> = {
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
 * Overall scoring weights
 */
export const OVERALL_SCORING_WEIGHTS = {
  technicalFit: 0.40,
  experienceFit: 0.30,
  atsOptimization: 0.30,
};

/**
 * Calculate technical fit score (0-100)
 * Based on matched core + preferred technical skills with weighted scoring
 */
export function calculateTechnicalFit(
  resumeSkills: string[],
  jobSkills: string[]
): TechnicalBreakdown {
  const categorizedJobSkills = categorizeSkills(jobSkills);
  const categorizedResumeSkills = categorizeSkills(resumeSkills);
  
  const resumeSkillSet = new Set(categorizedResumeSkills.map(s => normalizeSkill(s.skill)));
  
  // Separate skills by category
  const coreTechnicalSkills = categorizedJobSkills.filter(s => s.category === 'core_technical');
  const preferredSkills = categorizedJobSkills.filter(s => 
    ['backend', 'frontend', 'database', 'devops', 'ai_ml'].includes(s.category)
  );
  const bonusSkills = categorizedJobSkills.filter(s => s.category === 'bonus_skills');
  
  // Calculate matches
  const matchedCoreTechnical = coreTechnicalSkills.filter(s => 
    resumeSkillSet.has(normalizeSkill(s.skill))
  );
  const matchedPreferred = preferredSkills.filter(s => 
    resumeSkillSet.has(normalizeSkill(s.skill))
  );
  const matchedBonus = bonusSkills.filter(s => 
    resumeSkillSet.has(normalizeSkill(s.skill))
  );
  
  // Calculate weighted scores
  const coreTechnicalScore = coreTechnicalSkills.length > 0 
    ? (matchedCoreTechnical.length / coreTechnicalSkills.length) * 100
    : 100; // No core technical skills required = full score
    
  const preferredSkillsScore = preferredSkills.length > 0
    ? (matchedPreferred.length / preferredSkills.length) * 100
    : 100; // No preferred skills required = full score
    
  const bonusSkillsScore = bonusSkills.length > 0
    ? (matchedBonus.length / bonusSkills.length) * 100
    : 100; // No bonus skills required = full score
  
  // Calculate overall technical fit with weighted emphasis on core skills
  const totalRequiredSkills = coreTechnicalSkills.length + preferredSkills.length;
  const totalMatchedSkills = matchedCoreTechnical.length + matchedPreferred.length;
  
  // Weighted calculation: Core skills have higher impact
  const weightedScore = totalRequiredSkills > 0
    ? ((matchedCoreTechnical.length * 2 + matchedPreferred.length) / 
       (coreTechnicalSkills.length * 2 + preferredSkills.length)) * 100
    : 100;
    
  // Apply penalty for missing critical skills
  const missingCriticalSkills = coreTechnicalSkills
    .filter(s => !resumeSkillSet.has(normalizeSkill(s.skill)))
    .map(s => s.skill);
    
  const criticalPenalty = missingCriticalSkills.length > 0 
    ? (missingCriticalSkills.length / Math.max(coreTechnicalSkills.length, 1)) * 20
    : 0;
    
  const finalTechnicalScore = Math.max(0, Math.min(100, weightedScore - criticalPenalty));
  
  return {
    coreTechnicalScore: Math.round(coreTechnicalScore),
    preferredSkillsScore: Math.round(preferredSkillsScore),
    bonusSkillsScore: Math.round(bonusSkillsScore),
    matchedSkills: [...matchedCoreTechnical, ...matchedPreferred, ...matchedBonus].map(s => s.skill),
    missingCriticalSkills,
    missingPreferredSkills: preferredSkills
      .filter(s => !resumeSkillSet.has(normalizeSkill(s.skill)))
      .map(s => s.skill),
    totalRequiredSkills,
    totalMatchedSkills,
  };
}

/**
 * Calculate experience fit score (0-100)
 * Compare required experience vs resume experience with intelligent penalties
 */
export function calculateExperienceFit(
  resumeYears: number = 0,
  requiredYears: number = 0
): ExperienceBreakdown {
  const hasExperience = resumeYears > 0;
  const meetsRequirement = resumeYears >= requiredYears;
  const gap = requiredYears - resumeYears;
  
  let experienceScore = 100;
  let gapPenalty = 0;
  
  if (requiredYears > 0) {
    if (meetsRequirement) {
      // Bonus for exceeding requirements
      const excess = resumeYears - requiredYears;
      if (excess >= 5) {
        experienceScore = 100; // Cap at 100
      } else {
        experienceScore = 90 + (excess / 5) * 10; // 90-100 for small excess
      }
    } else {
      // Penalty for missing experience
      if (gap <= 1) {
        experienceScore = 85;
        gapPenalty = 15;
      } else if (gap <= 3) {
        experienceScore = 70;
        gapPenalty = 30;
      } else if (gap <= 5) {
        experienceScore = 50;
        gapPenalty = 50;
      } else {
        experienceScore = 25;
        gapPenalty = 75;
      }
    }
  } else {
    // No experience requirement specified
    experienceScore = hasExperience ? 90 : 80;
    gapPenalty = hasExperience ? 10 : 20;
  }
  
  return {
    resumeYears,
    requiredYears,
    gap,
    gapPenalty,
    hasExperience,
    meetsRequirement,
  };
}

/**
 * Calculate ATS optimization score (0-100)
 * Based on keyword density, formatting heuristics, and section completeness
 */
export function calculateATSOptimization(
  resumeText: string = '',
  jobDescriptionText: string = '',
  resumeSkills: string[] = []
): ATSBreakdown {
  // Extract keywords from job description
  const jobKeywords = extractKeywords(jobDescriptionText);
  const resumeKeywords = extractKeywords(resumeText);
  
  // Calculate keyword alignment
  const keywordAlignment = calculateKeywordAlignment(jobKeywords, resumeKeywords);
  
  // Calculate keyword density for technical skills
  const skillDensity = calculateSkillDensity(resumeText, resumeSkills);
  
  // Basic formatting heuristics
  const formattingScore = calculateFormattingHeuristics(resumeText);
  
  // Section completeness
  const sectionCompleteness = calculateSectionCompleteness(resumeText);
  
  // Overall ATS score
  const keywordDensity = Math.min(100, (keywordAlignment * 0.5 + skillDensity * 0.3 + sectionCompleteness * 0.2));
  
  return {
    keywordAlignment: Math.round(keywordAlignment),
    formattingScore: Math.round(formattingScore),
    sectionCompleteness: Math.round(sectionCompleteness),
    keywordDensity: Math.round(keywordDensity),
  };
}

/**
 * Main scoring engine - calculates all metrics and overall match
 */
export function calculateUnifiedScore(inputs: ScoringInputs): ScoringResults {
  const {
    resumeSkills,
    jobSkills,
    resumeExperienceYears,
    requiredExperienceYears,
    resumeText,
    jobDescriptionText,
  } = inputs;
  
  // Calculate individual components
  const technicalBreakdown = calculateTechnicalFit(resumeSkills, jobSkills);
  const experienceBreakdown = calculateExperienceFit(resumeExperienceYears, requiredExperienceYears);
  const atsBreakdown = calculateATSOptimization(resumeText, jobDescriptionText, resumeSkills);
  
  // Extract component scores
  const technicalFit = technicalBreakdown.coreTechnicalScore * 0.6 + 
                       technicalBreakdown.preferredSkillsScore * 0.3 + 
                       technicalBreakdown.bonusSkillsScore * 0.1;
  
  const experienceFit = experienceBreakdown.meetsRequirement ? 
    (experienceBreakdown.resumeYears >= experienceBreakdown.requiredYears * 2 ? 100 : 90) :
    (100 - experienceBreakdown.gapPenalty);
  
  const atsOptimization = atsBreakdown.keywordDensity;
  
  // Calculate overall match using weighted formula
  const overallMatch = 
    technicalFit * OVERALL_SCORING_WEIGHTS.technicalFit +
    experienceFit * OVERALL_SCORING_WEIGHTS.experienceFit +
    atsOptimization * OVERALL_SCORING_WEIGHTS.atsOptimization;
  
  // Calculate confidence score based on data quality
  const confidenceScore = calculateConfidenceScore(inputs);
  
  return {
    technicalFit: Math.round(technicalFit),
    experienceFit: Math.round(experienceFit),
    atsOptimization: Math.round(atsOptimization),
    overallMatch: Math.round(overallMatch),
    technicalBreakdown,
    experienceBreakdown,
    atsBreakdown,
    confidenceScore: Math.round(confidenceScore),
    analysisTimestamp: new Date(),
  };
}

/**
 * Helper functions
 */

function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  // Extract important keywords (simplified version)
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  // Remove common words and return unique keywords
  const commonWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'she', 'use', 'her', 'than', 'this', 'with']);
  
  return [...new Set(words.filter(word => !commonWords.has(word)))];
}

function calculateKeywordAlignment(jobKeywords: string[], resumeKeywords: string[]): number {
  if (jobKeywords.length === 0) return 100;
  
  const jobKeywordSet = new Set(jobKeywords);
  const resumeKeywordSet = new Set(resumeKeywords);
  
  const matches = [...jobKeywordSet].filter(keyword => resumeKeywordSet.has(keyword));
  
  return (matches.length / jobKeywords.length) * 100;
}

function calculateSkillDensity(resumeText: string, skills: string[]): number {
  if (!resumeText || skills.length === 0) return 50;
  
  const text = resumeText.toLowerCase();
  let totalMentions = 0;
  
  skills.forEach(skill => {
    const regex = new RegExp(skill.toLowerCase().replace(/\s+/g, '\\s+'), 'gi');
    const matches = text.match(regex);
    totalMentions += matches ? matches.length : 0;
  });
  
  // Ideal density: 2-5 mentions per skill
  const idealDensity = skills.length * 3;
  const density = Math.min(100, (totalMentions / idealDensity) * 100);
  
  return Math.max(20, density); // Minimum score if skills are mentioned
}

function calculateFormattingHeuristics(resumeText: string): number {
  if (!resumeText) return 0;
  
  let score = 50; // Base score
  
  // Check for sections
  const sections = ['experience', 'education', 'skills', 'projects'];
  sections.forEach(section => {
    if (resumeText.toLowerCase().includes(section)) {
      score += 10;
    }
  });
  
  // Check for bullet points
  if (resumeText.includes('•') || resumeText.includes('-') || resumeText.includes('*')) {
    score += 10;
  }
  
  // Check for reasonable length
  const wordCount = resumeText.split(/\s+/).length;
  if (wordCount >= 100 && wordCount <= 1000) {
    score += 10;
  }
  
  return Math.min(100, score);
}

function calculateSectionCompleteness(resumeText: string): number {
  if (!resumeText) return 0;
  
  const requiredSections = ['experience', 'education', 'skills'];
  const presentSections = requiredSections.filter(section => 
    resumeText.toLowerCase().includes(section)
  );
  
  return (presentSections.length / requiredSections.length) * 100;
}

function calculateConfidenceScore(inputs: ScoringInputs): number {
  let confidence = 100;
  
  // Reduce confidence based on missing data
  if (!inputs.resumeText || inputs.resumeText.length < 100) confidence -= 20;
  if (!inputs.jobDescriptionText || inputs.jobDescriptionText.length < 100) confidence -= 20;
  if (inputs.resumeSkills.length === 0) confidence -= 30;
  if (inputs.jobSkills.length === 0) confidence -= 30;
  if (inputs.resumeExperienceYears === undefined) confidence -= 10;
  if (inputs.requiredExperienceYears === undefined) confidence -= 10;
  
  return Math.max(0, confidence);
}
