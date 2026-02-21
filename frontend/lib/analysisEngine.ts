/**
 * Unified Analysis Engine - Production-Ready Resume-Job Analysis System
 * 
 * This module integrates all scoring, recommendation, and validation engines
 * to provide a comprehensive, consistent, and data-driven analysis system.
 */

import { 
  calculateUnifiedScore, 
  ScoringResults, 
  ScoringInputs 
} from './unifiedScoringEngine';

import { 
  generateSmartRecommendations, 
  SmartRecommendationsOutput, 
  RecommendationInput 
} from './smartRecommendationsEngine';

import { 
  calculateSkillImpacts, 
  ImpactCalculationInput, 
  ImpactCalculationOutput 
} from './impactCalculationEngine';

import { 
  detectSoftSkills, 
  SoftSkillDetectionResult 
} from './softSkillDetectionEngine';

import { 
  storeAnalysisResult, 
  getScoreTrend, 
  ScoreTrendInput, 
  TrendAnalysisResult 
} from './scoreTrendEngine';

import { 
  validateDataConsistency, 
  ConsistencyCheckInput, 
  ValidationResult 
} from './dataConsistencyValidator';

export interface AnalysisEngineInput {
  resumeId: string;
  jobId: string;
  resumeSkills: string[];
  jobSkills: string[];
  resumeText?: string;
  jobDescriptionText?: string;
  resumeExperienceYears?: number;
  requiredExperienceYears?: number;
}

export interface AnalysisEngineOutput {
  // Core scoring results
  scoring: ScoringResults;
  
  // Recommendations
  recommendations: SmartRecommendationsOutput;
  
  // Impact calculation
  impactCalculation: ImpactCalculationOutput;
  
  // Soft skills
  softSkills: SoftSkillDetectionResult;
  
  // Trend data
  trend: TrendAnalysisResult;
  
  // Validation
  validation: ValidationResult;
  
  // Metadata
  analysisId: string;
  timestamp: Date;
  version: string;
  processingTime: number;
}

/**
 * Main analysis engine - orchestrates all analysis components
 */
export async function runAnalysisEngine(input: AnalysisEngineInput): Promise<AnalysisEngineOutput> {
  const startTime = Date.now();
  
  try {
    // Phase 1: Unified Scoring
    const scoringInputs: ScoringInputs = {
      resumeSkills: input.resumeSkills,
      jobSkills: input.jobSkills,
      resumeExperienceYears: input.resumeExperienceYears,
      requiredExperienceYears: input.requiredExperienceYears,
      resumeText: input.resumeText,
      jobDescriptionText: input.jobDescriptionText,
    };
    
    const scoring = calculateUnifiedScore(scoringInputs);
    
    // Phase 2: Smart Recommendations
    const recommendationInput: RecommendationInput = {
      scoringResults: scoring,
      resumeSkills: input.resumeSkills,
      jobSkills: input.jobSkills,
      resumeText: input.resumeText,
      jobDescriptionText: input.jobDescriptionText,
    };
    
    const recommendations = generateSmartRecommendations(recommendationInput);
    
    // Phase 3: Impact Calculation
    const impactInput: ImpactCalculationInput = {
      resumeSkills: input.resumeSkills,
      jobSkills: input.jobSkills,
      currentScore: scoring.overallMatch,
      maxPossibleScore: 100,
    };
    
    const impactCalculation = calculateSkillImpacts(impactInput);
    
    // Phase 4: Soft Skill Detection
    const softSkills = detectSoftSkills(input.resumeText || '');
    
    // Phase 5: Store Analysis Result for Trend
    const storedRecord = storeAnalysisResult({
      resumeId: input.resumeId,
      jobId: input.jobId,
      overallMatch: scoring.overallMatch,
      technicalFit: scoring.technicalFit,
      experienceFit: scoring.experienceFit,
      atsScore: scoring.atsOptimization,
    });
    
    // Phase 6: Get Trend Data
    const trendInput: ScoreTrendInput = {
      resumeId: input.resumeId,
      jobId: input.jobId,
      maxDataPoints: 5,
    };
    
    const trend = getScoreTrend(trendInput);
    
    // Phase 7: Data Consistency Validation
    const consistencyInput: ConsistencyCheckInput = {
      scoringResults: scoring,
      recommendations,
      impactCalculation,
      softSkillDetection: softSkills,
      resumeSkills: input.resumeSkills,
      jobSkills: input.jobSkills,
      missingSkillsCount: impactCalculation.missingSkills.length,
      matchedSkillsCount: scoring.technicalBreakdown.totalMatchedSkills,
    };
    
    const validation = validateDataConsistency(consistencyInput);
    
    // Log validation issues if any
    if (!validation.isValid) {
      console.warn('Analysis validation issues detected:', validation.issues);
    }
    
    if (validation.warnings.length > 0) {
      console.info('Analysis validation warnings:', validation.warnings);
    }
    
    const processingTime = Date.now() - startTime;
    
    return {
      scoring,
      recommendations,
      impactCalculation,
      softSkills,
      trend,
      validation,
      analysisId: storedRecord.id,
      timestamp: new Date(),
      version: '2.0.0',
      processingTime,
    };
    
  } catch (error) {
    console.error('Analysis engine error:', error);
    throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Quick analysis for real-time feedback (less comprehensive)
 */
export function runQuickAnalysis(input: AnalysisEngineInput): {
  scoring: ScoringResults;
  recommendations: SmartRecommendationsOutput;
  validation: ValidationResult;
} {
  // Only run core scoring and recommendations for quick feedback
  const scoringInputs: ScoringInputs = {
    resumeSkills: input.resumeSkills,
    jobSkills: input.jobSkills,
    resumeExperienceYears: input.resumeExperienceYears,
    requiredExperienceYears: input.requiredExperienceYears,
    resumeText: input.resumeText,
    jobDescriptionText: input.jobDescriptionText,
  };
  
  const scoring = calculateUnifiedScore(scoringInputs);
  
  const recommendationInput: RecommendationInput = {
    scoringResults: scoring,
    resumeSkills: input.resumeSkills,
    jobSkills: input.jobSkills,
    resumeText: input.resumeText,
    jobDescriptionText: input.jobDescriptionText,
  };
  
  const recommendations = generateSmartRecommendations(recommendationInput);
  
  // Basic validation
  const consistencyInput: ConsistencyCheckInput = {
    scoringResults: scoring,
    recommendations,
    impactCalculation: {
      missingSkills: [],
      totalPotentialIncrease: 0,
      potentialScore: scoring.overallMatch,
      impactDistribution: { critical: [], high: [], medium: [], low: [] },
    },
    softSkillDetection: { matchedSkills: [], missingSkills: [], confidence: 0, totalSkills: 0 },
    resumeSkills: input.resumeSkills,
    jobSkills: input.jobSkills,
    missingSkillsCount: 0,
    matchedSkillsCount: scoring.technicalBreakdown.totalMatchedSkills,
  };
  
  const validation = validateDataConsistency(consistencyInput);
  
  return {
    scoring,
    recommendations,
    validation,
  };
}

/**
 * Get analysis history for a resume
 */
export function getAnalysisHistory(resumeId: string, maxResults: number = 10): TrendAnalysisResult {
  const trendInput: ScoreTrendInput = {
    resumeId,
    jobId: '', // Empty to get all jobs
    maxDataPoints: maxResults,
  };
  
  // This would need to be implemented in the score trend engine
  // For now, return empty result
  return {
    dataPoints: [],
    trendDirection: 'stable',
    averageScore: 0,
    scoreVariation: 0,
    improvementRate: 0,
    confidence: 'low',
  };
}

/**
 * Validate analysis input data
 */
export function validateAnalysisInput(input: AnalysisEngineInput): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required fields
  if (!input.resumeId || input.resumeId.trim().length === 0) {
    errors.push('Resume ID is required');
  }
  
  if (!input.jobId || input.jobId.trim().length === 0) {
    errors.push('Job ID is required');
  }
  
  if (!input.resumeSkills || input.resumeSkills.length === 0) {
    errors.push('Resume skills are required');
  }
  
  if (!input.jobSkills || input.jobSkills.length === 0) {
    errors.push('Job skills are required');
  }
  
  // Optional fields with warnings
  if (!input.resumeText || input.resumeText.trim().length < 50) {
    warnings.push('Resume text is missing or very short - analysis may be less accurate');
  }
  
  if (!input.jobDescriptionText || input.jobDescriptionText.trim().length < 50) {
    warnings.push('Job description text is missing or very short - analysis may be less accurate');
  }
  
  if (input.resumeExperienceYears !== undefined && (input.resumeExperienceYears < 0 || input.resumeExperienceYears > 50)) {
    errors.push('Resume experience years must be between 0 and 50');
  }
  
  if (input.requiredExperienceYears !== undefined && (input.requiredExperienceYears < 0 || input.requiredExperienceYears > 30)) {
    errors.push('Required experience years must be between 0 and 30');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get analysis engine version and capabilities
 */
export function getEngineInfo() {
  return {
    version: '2.0.0',
    capabilities: {
      unifiedScoring: true,
      smartRecommendations: true,
      impactCalculation: true,
      softSkillDetection: true,
      scoreTrends: true,
      dataValidation: true,
      consistencyChecks: true,
    },
    supportedFormats: {
      resumeText: ['plain text', 'markdown', 'structured'],
      jobDescription: ['plain text', 'markdown', 'structured'],
      skills: ['array', 'comma-separated', 'natural language'],
    },
    limits: {
      maxSkills: 200,
      maxTextLength: 50000,
      maxHistoryRecords: 50,
    },
  };
}

/**
 * Export all engine components for individual use
 */
export {
  // Scoring
  calculateUnifiedScore,
  
  // Recommendations
  generateSmartRecommendations,
  
  // Impact Calculation
  calculateSkillImpacts,
  
  // Soft Skills
  detectSoftSkills,
  
  // Trends
  storeAnalysisResult,
  getScoreTrend,
  
  // Validation
  validateDataConsistency,
};
