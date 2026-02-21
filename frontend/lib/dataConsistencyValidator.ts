/**
 * Data Consistency Validator - Production-Ready Validation System
 * 
 * This module provides comprehensive validation to ensure all displayed metrics
 * and recommendations are logically consistent and data-driven.
 */

import { ScoringResults } from './unifiedScoringEngine';
import { SmartRecommendationsOutput, MatchStatus } from './smartRecommendationsEngine';
import { ImpactCalculationOutput } from './impactCalculationEngine';
import { SoftSkillDetectionResult } from './softSkillDetectionEngine';

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100 consistency score
  issues: ValidationIssue[];
  warnings: ValidationWarning[];
  summary: string;
}

export interface ValidationIssue {
  type: 'critical' | 'error';
  component: string;
  description: string;
  expected: any;
  actual: any;
  impact: 'high' | 'medium' | 'low';
}

export interface ValidationWarning {
  component: string;
  description: string;
  suggestion: string;
}

export interface ConsistencyCheckInput {
  scoringResults: ScoringResults;
  recommendations: SmartRecommendationsOutput;
  impactCalculation: ImpactCalculationOutput;
  softSkillDetection: SoftSkillDetectionResult;
  resumeSkills: string[];
  jobSkills: string[];
  missingSkillsCount: number;
  matchedSkillsCount: number;
}

/**
 * Main validation function - checks all data consistency
 */
export function validateDataConsistency(input: ConsistencyCheckInput): ValidationResult {
  const issues: ValidationIssue[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Run all consistency checks
  checkScoreConsistency(input, issues, warnings);
  checkRecommendationConsistency(input, issues, warnings);
  checkSkillConsistency(input, issues, warnings);
  checkImpactConsistency(input, issues, warnings);
  checkSoftSkillConsistency(input, issues, warnings);
  checkLogicalConsistency(input, issues, warnings);
  
  // Calculate overall consistency score
  const score = calculateConsistencyScore(issues, warnings);
  
  // Generate summary
  const summary = generateValidationSummary(issues, warnings, score);
  
  return {
    isValid: issues.filter(i => i.type === 'critical').length === 0,
    score,
    issues,
    warnings,
    summary,
  };
}

/**
 * Check score consistency across components
 */
function checkScoreConsistency(
  input: ConsistencyCheckInput,
  issues: ValidationIssue[],
  warnings: ValidationWarning[]
): void {
  const { scoringResults } = input;
  
  // Check that overall match is within reasonable bounds
  if (scoringResults.overallMatch < 0 || scoringResults.overallMatch > 100) {
    issues.push({
      type: 'critical',
      component: 'ScoringEngine',
      description: 'Overall match score out of bounds',
      expected: '0-100',
      actual: scoringResults.overallMatch,
      impact: 'high',
    });
  }
  
  // Check component score consistency
  const componentScores = [
    scoringResults.technicalFit,
    scoringResults.experienceFit,
    scoringResults.atsOptimization,
  ];
  
  componentScores.forEach((score, index) => {
    if (score < 0 || score > 100) {
      const components = ['TechnicalFit', 'ExperienceFit', 'ATSOptimization'];
      issues.push({
        type: 'error',
        component: components[index],
        description: 'Component score out of bounds',
        expected: '0-100',
        actual: score,
        impact: 'medium',
      });
    }
  });
  
  // Check that overall match is reasonable average of components
  const expectedOverall = 
    scoringResults.technicalFit * 0.4 +
    scoringResults.experienceFit * 0.3 +
    scoringResults.atsOptimization * 0.3;
  
  const difference = Math.abs(scoringResults.overallMatch - expectedOverall);
  if (difference > 5) {
    issues.push({
      type: 'error',
      component: 'ScoringEngine',
      description: 'Overall match does not match weighted component scores',
      expected: `${expectedOverall.toFixed(1)} (±5)`,
      actual: scoringResults.overallMatch,
      impact: 'medium',
    });
  }
  
  // Check confidence score
  if (scoringResults.confidenceScore < 0 || scoringResults.confidenceScore > 100) {
    issues.push({
      type: 'error',
      component: 'ScoringEngine',
      description: 'Confidence score out of bounds',
      expected: '0-100',
      actual: scoringResults.confidenceScore,
      impact: 'low',
    });
  }
}

/**
 * Check recommendation consistency with scores
 */
function checkRecommendationConsistency(
  input: ConsistencyCheckInput,
  issues: ValidationIssue[],
  warnings: ValidationWarning[]
): void {
  const { scoringResults, recommendations } = input;
  
  // Check that recommendation status aligns with overall score
  const expectedStatus = determineExpectedStatus(scoringResults.overallMatch);
  if (recommendations.status !== expectedStatus) {
    issues.push({
      type: 'error',
      component: 'SmartRecommendations',
      description: 'Recommendation status does not match overall score',
      expected: expectedStatus,
      actual: recommendations.status,
      impact: 'high',
    });
  }
  
  // Check that total impact is reasonable
  if (recommendations.totalImpactPercentage < 0 || recommendations.totalImpactPercentage > 100) {
    issues.push({
      type: 'error',
      component: 'SmartRecommendations',
      description: 'Total impact percentage out of bounds',
      expected: '0-100',
      actual: recommendations.totalImpactPercentage,
      impact: 'medium',
    });
  }
  
  // Check that recommendation counts match actual recommendations
  const actualCritical = recommendations.recommendations.filter(r => r.priority === 'critical').length;
  const actualHigh = recommendations.recommendations.filter(r => r.priority === 'high').length;
  const actualMedium = recommendations.recommendations.filter(r => r.priority === 'medium').length;
  const actualLow = recommendations.recommendations.filter(r => r.priority === 'low').length;
  
  if (actualCritical !== recommendations.criticalCount) {
    issues.push({
      type: 'error',
      component: 'SmartRecommendations',
      description: 'Critical recommendation count mismatch',
      expected: recommendations.criticalCount,
      actual: actualCritical,
      impact: 'medium',
    });
  }
  
  if (actualHigh !== recommendations.highPriorityCount) {
    issues.push({
      type: 'error',
      component: 'SmartRecommendations',
      description: 'High priority recommendation count mismatch',
      expected: recommendations.highPriorityCount,
      actual: actualHigh,
      impact: 'medium',
    });
  }
  
  // Check for conflicting messages
  if (recommendations.status === 'excellent_match' && recommendations.criticalCount > 0) {
    issues.push({
      type: 'error',
      component: 'SmartRecommendations',
      description: 'Conflicting message: excellent match with critical issues',
      expected: 'No critical issues for excellent match',
      actual: `${recommendations.criticalCount} critical issues`,
      impact: 'high',
    });
  }
  
  if (recommendations.status === 'low_match_significant_gaps' && recommendations.criticalCount === 0) {
    warnings.push({
      component: 'SmartRecommendations',
      description: 'Low match status but no critical issues detected',
      suggestion: 'Review scoring logic or recommendation thresholds',
    });
  }
}

/**
 * Check skill consistency across components
 */
function checkSkillConsistency(
  input: ConsistencyCheckInput,
  issues: ValidationIssue[],
  warnings: ValidationWarning[]
): void {
  const { scoringResults, resumeSkills, jobSkills, missingSkillsCount, matchedSkillsCount } = input;
  
  // Check that skill counts are consistent
  const calculatedMissing = jobSkills.length - matchedSkillsCount;
  if (calculatedMissing !== missingSkillsCount) {
    issues.push({
      type: 'error',
      component: 'SkillsRatio',
      description: 'Missing skills count mismatch',
      expected: calculatedMissing,
      actual: missingSkillsCount,
      impact: 'medium',
    });
  }
  
  // Check that technical fit reflects actual skill matching
  const technicalSkills = jobSkills.filter(skill => 
    ['JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js', 'SQL'].some(tech => 
      skill.toLowerCase().includes(tech.toLowerCase())
    )
  );
  
  const matchedTechnical = technicalSkills.filter(skill => 
    resumeSkills.some(resume => resume.toLowerCase().includes(skill.toLowerCase()))
  ).length;
  
  const expectedTechnicalFit = technicalSkills.length > 0 
    ? (matchedTechnical / technicalSkills.length) * 100
    : 100;
  
  const technicalDifference = Math.abs(scoringResults.technicalFit - expectedTechnicalFit);
  if (technicalDifference > 20) {
    warnings.push({
      component: 'TechnicalFit',
      description: 'Technical fit may not accurately reflect skill matching',
      suggestion: 'Review skill categorization and matching logic',
    });
  }
}

/**
 * Check impact calculation consistency
 */
function checkImpactConsistency(
  input: ConsistencyCheckInput,
  issues: ValidationIssue[],
  warnings: ValidationWarning[]
): void {
  const { impactCalculation, scoringResults } = input;
  
  // Check that potential score doesn't exceed maximum
  if (impactCalculation.potentialScore > 100) {
    issues.push({
      type: 'error',
      component: 'ImpactCalculation',
      description: 'Potential score exceeds maximum',
      expected: '≤100',
      actual: impactCalculation.potentialScore,
      impact: 'medium',
    });
  }
  
  // Check that total increase is reasonable
  if (impactCalculation.totalPotentialIncrease > 40) {
    issues.push({
      type: 'error',
      component: 'ImpactCalculation',
      description: 'Total potential increase too high',
      expected: '≤40',
      actual: impactCalculation.totalPotentialIncrease,
      impact: 'medium',
    });
  }
  
  // Check that missing skills count aligns with impact calculation
  if (impactCalculation.missingSkills.length !== input.missingSkillsCount) {
    warnings.push({
      component: 'ImpactCalculation',
      description: 'Missing skills count may not align with other components',
      suggestion: 'Ensure consistent skill matching across all components',
    });
  }
  
  // Check that individual impacts are reasonable
  impactCalculation.missingSkills.forEach((skill, index) => {
    if (skill.scoreIncrease > 25) {
      issues.push({
        type: 'error',
        component: 'ImpactCalculation',
        description: `Individual skill impact too high for ${skill.skill}`,
        expected: '≤25',
        actual: skill.scoreIncrease,
        impact: 'low',
      });
    }
  });
}

/**
 * Check soft skill detection consistency
 */
function checkSoftSkillConsistency(
  input: ConsistencyCheckInput,
  issues: ValidationIssue[],
  warnings: ValidationWarning[]
): void {
  const { softSkillDetection } = input;
  
  // Check confidence score bounds
  if (softSkillDetection.confidence < 0 || softSkillDetection.confidence > 100) {
    issues.push({
      type: 'error',
      component: 'SoftSkillDetection',
      description: 'Soft skill confidence out of bounds',
      expected: '0-100',
      actual: softSkillDetection.confidence,
      impact: 'low',
    });
  }
  
  // Check that matched skills don't exceed reasonable count
  if (softSkillDetection.matchedSkills.length > 15) {
    warnings.push({
      component: 'SoftSkillDetection',
      description: 'Unusually high number of soft skills detected',
      suggestion: 'Review detection thresholds and confidence levels',
    });
  }
  
  // Check for duplicate categories
  const categories = new Set(softSkillDetection.matchedSkills.map(m => m.category));
  if (categories.size !== softSkillDetection.matchedSkills.length) {
    issues.push({
      type: 'error',
      component: 'SoftSkillDetection',
      description: 'Duplicate soft skill categories detected',
      expected: 'Unique categories',
      actual: `${softSkillDetection.matchedSkills.length} skills, ${categories.size} categories`,
      impact: 'medium',
    });
  }
}

/**
 * Check overall logical consistency
 */
function checkLogicalConsistency(
  input: ConsistencyCheckInput,
  issues: ValidationIssue[],
  warnings: ValidationWarning[]
): void {
  const { scoringResults, recommendations, impactCalculation } = input;
  
  // Check that high scores don't have many critical recommendations
  if (scoringResults.overallMatch >= 80 && recommendations.criticalCount > 3) {
    warnings.push({
      component: 'OverallLogic',
      description: 'High score with many critical recommendations seems inconsistent',
      suggestion: 'Review recommendation thresholds or scoring logic',
    });
  }
  
  // Check that low scores have appropriate recommendations
  if (scoringResults.overallMatch < 50 && recommendations.criticalCount === 0) {
    warnings.push({
      component: 'OverallLogic',
      description: 'Low score with no critical recommendations may indicate missing issues',
      suggestion: 'Review recommendation generation logic',
    });
  }
  
  // Check that impact potential aligns with current score
  if (scoringResults.overallMatch < 30 && impactCalculation.totalPotentialIncrease < 10) {
    warnings.push({
      component: 'OverallLogic',
      description: 'Low score with minimal improvement potential seems inconsistent',
      suggestion: 'Review impact calculation logic',
    });
  }
  
  // Check that experience fit makes sense with technical fit
  if (scoringResults.technicalFit > 80 && scoringResults.experienceFit < 30) {
    warnings.push({
      component: 'OverallLogic',
      description: 'High technical fit but low experience fit may indicate data issues',
      suggestion: 'Review experience extraction and calculation',
    });
  }
}

/**
 * Determine expected recommendation status based on score
 */
function determineExpectedStatus(overallMatch: number): MatchStatus {
  if (overallMatch >= 85) return 'excellent_match';
  if (overallMatch >= 70) return 'strong_match_minor_improvements';
  if (overallMatch >= 50) return 'moderate_match_improvements_needed';
  return 'low_match_significant_gaps';
}

/**
 * Calculate overall consistency score
 */
function calculateConsistencyScore(issues: ValidationIssue[], warnings: ValidationWarning[]): number {
  let score = 100;
  
  // Deduct points for issues
  issues.forEach(issue => {
    switch (issue.impact) {
      case 'high': score -= 20; break;
      case 'medium': score -= 10; break;
      case 'low': score -= 5; break;
    }
  });
  
  // Deduct points for warnings
  score -= warnings.length * 2;
  
  return Math.max(0, score);
}

/**
 * Generate validation summary
 */
function generateValidationSummary(issues: ValidationIssue[], warnings: ValidationWarning[], score: number): string {
  const criticalIssues = issues.filter(i => i.type === 'critical').length;
  const errorIssues = issues.filter(i => i.type === 'error').length;
  
  if (criticalIssues > 0) {
    return `CRITICAL: ${criticalIssues} critical consistency issues found. Data validation failed (Score: ${score}/100).`;
  }
  
  if (errorIssues > 0) {
    return `ERROR: ${errorIssues} consistency errors detected. Review required (Score: ${score}/100).`;
  }
  
  if (warnings.length > 0) {
    return `WARNING: ${warnings.length} potential inconsistencies detected. Review recommended (Score: ${score}/100).`;
  }
  
  return `SUCCESS: All data consistency checks passed (Score: ${score}/100).`;
}

/**
 * Quick validation for production use
 */
export function quickValidation(input: ConsistencyCheckInput): boolean {
  const result = validateDataConsistency(input);
  return result.isValid && result.score >= 80;
}

/**
 * Export validation utilities for testing
 */
export { determineExpectedStatus, calculateConsistencyScore };
