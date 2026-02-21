/**
 * Analysis Engine Test Suite - Production-Ready Validation Tests
 * 
 * This module provides comprehensive tests for all analysis engine components
 * to ensure data consistency, logical correctness, and production readiness.
 */

import { 
  runAnalysisEngine, 
  runQuickAnalysis, 
  validateAnalysisInput,
  getEngineInfo 
} from './analysisEngine';

import { 
  validateDataConsistency 
} from './dataConsistencyValidator';

// Test data fixtures
const TEST_INPUTS = {
  valid: {
    resumeId: 'test-resume-1',
    jobId: 'test-job-1',
    resumeSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python'],
    jobSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker'],
    resumeText: 'Experienced software engineer with 5 years of experience in JavaScript, React, and Node.js. Strong background in TypeScript and Python. Led development of multiple web applications.',
    jobDescriptionText: 'We are looking for a senior software engineer with experience in JavaScript, React, Node.js, TypeScript, and Python. AWS and Docker experience is a plus.',
    resumeExperienceYears: 5,
    requiredExperienceYears: 3,
  },
  
  lowMatch: {
    resumeId: 'test-resume-2',
    jobId: 'test-job-2',
    resumeSkills: ['HTML', 'CSS', 'Basic JavaScript'],
    jobSkills: ['Python', 'Java', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'MongoDB'],
    resumeText: 'Junior developer with basic HTML, CSS, and JavaScript skills.',
    jobDescriptionText: 'Senior full-stack engineer position requiring expertise in Python, Java, React, Node.js, cloud technologies, and databases.',
    resumeExperienceYears: 1,
    requiredExperienceYears: 5,
  },
  
  excellentMatch: {
    resumeId: 'test-resume-3',
    jobId: 'test-job-3',
    resumeSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker'],
    jobSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python'],
    resumeText: 'Senior full-stack developer with 8 years of experience. Expert in JavaScript, React, Node.js, TypeScript, and Python. AWS certified with Docker experience.',
    jobDescriptionText: 'Looking for a senior developer with JavaScript, React, Node.js, TypeScript, and Python experience.',
    resumeExperienceYears: 8,
    requiredExperienceYears: 5,
  },
  
  invalid: {
    resumeId: '',
    jobId: '',
    resumeSkills: [],
    jobSkills: [],
    resumeText: '',
    jobDescriptionText: '',
    resumeExperienceYears: -1,
    requiredExperienceYears: -1,
  },
};

/**
 * Test suite runner
 */
export class AnalysisEngineTestSuite {
  private results = {
    passed: 0,
    failed: 0,
    errors: [] as string[],
    warnings: [] as string[],
  };

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Analysis Engine Test Suite...\n');
    
    // Input validation tests
    await this.testInputValidation();
    
    // Scoring engine tests
    await this.testScoringEngine();
    
    // Recommendation engine tests
    await this.testRecommendationEngine();
    
    // Impact calculation tests
    await this.testImpactCalculation();
    
    // Soft skill detection tests
    await this.testSoftSkillDetection();
    
    // Data consistency tests
    await this.testDataConsistency();
    
    // Integration tests
    await this.testIntegration();
    
    // Performance tests
    await this.testPerformance();
    
    // Edge case tests
    await this.testEdgeCases();
    
    this.printResults();
  }

  /**
   * Test input validation
   */
  private async testInputValidation(): Promise<void> {
    console.log('📝 Testing Input Validation...');
    
    try {
      // Valid input
      const validResult = validateAnalysisInput(TEST_INPUTS.valid);
      this.assert(validResult.isValid, 'Valid input should pass validation');
      this.assert(validResult.errors.length === 0, 'Valid input should have no errors');
      
      // Invalid input
      const invalidResult = validateAnalysisInput(TEST_INPUTS.invalid);
      this.assert(!invalidResult.isValid, 'Invalid input should fail validation');
      this.assert(invalidResult.errors.length > 0, 'Invalid input should have errors');
      
      // Missing optional fields
      const minimalInput = { ...TEST_INPUTS.valid, resumeText: '', jobDescriptionText: '' };
      const minimalResult = validateAnalysisInput(minimalInput);
      this.assert(minimalResult.isValid, 'Minimal input should pass validation');
      this.assert(minimalResult.warnings.length > 0, 'Minimal input should have warnings');
      
      this.results.passed++;
      console.log('✅ Input validation tests passed\n');
    } catch (error) {
      this.results.failed++;
      this.results.errors.push(`Input validation: ${error}`);
      console.log('❌ Input validation tests failed\n');
    }
  }

  /**
   * Test scoring engine
   */
  private async testScoringEngine(): Promise<void> {
    console.log('📊 Testing Scoring Engine...');
    
    try {
      // Excellent match scenario
      const excellentResult = await runQuickAnalysis(TEST_INPUTS.excellentMatch);
      this.assert(excellentResult.scoring.overallMatch >= 80, 'Excellent match should have high score');
      this.assert(excellentResult.scoring.technicalFit >= 80, 'Excellent match should have high technical fit');
      this.assert(excellentResult.scoring.experienceFit >= 80, 'Excellent match should have high experience fit');
      
      // Low match scenario
      const lowResult = await runQuickAnalysis(TEST_INPUTS.lowMatch);
      this.assert(lowResult.scoring.overallMatch < 50, 'Low match should have low score');
      this.assert(lowResult.recommendations.status === 'low_match_significant_gaps', 'Low match should have appropriate status');
      
      // Score bounds
      this.assert(excellentResult.scoring.overallMatch <= 100, 'Score should not exceed 100');
      this.assert(excellentResult.scoring.overallMatch >= 0, 'Score should not be negative');
      this.assert(lowResult.scoring.overallMatch <= 100, 'Low score should not exceed 100');
      this.assert(lowResult.scoring.overallMatch >= 0, 'Low score should not be negative');
      
      this.results.passed++;
      console.log('✅ Scoring engine tests passed\n');
    } catch (error) {
      this.results.failed++;
      this.results.errors.push(`Scoring engine: ${error}`);
      console.log('❌ Scoring engine tests failed\n');
    }
  }

  /**
   * Test recommendation engine
   */
  private async testRecommendationEngine(): Promise<void> {
    console.log('💡 Testing Recommendation Engine...');
    
    try {
      // Excellent match recommendations
      const excellentResult = await runQuickAnalysis(TEST_INPUTS.excellentMatch);
      this.assert(excellentResult.recommendations.status === 'excellent_match', 'Excellent match should have excellent status');
      this.assert(excellentResult.recommendations.criticalCount === 0, 'Excellent match should have no critical issues');
      
      // Low match recommendations
      const lowResult = await runQuickAnalysis(TEST_INPUTS.lowMatch);
      this.assert(lowResult.recommendations.status === 'low_match_significant_gaps', 'Low match should have low status');
      this.assert(lowResult.recommendations.criticalCount > 0, 'Low match should have critical issues');
      
      // Recommendation counts consistency
      const totalRecommendations = lowResult.recommendations.recommendations.length;
      const countedTotal = lowResult.recommendations.criticalCount + 
                          lowResult.recommendations.highPriorityCount + 
                          lowResult.recommendations.mediumCount + 
                          lowResult.recommendations.lowCount;
      this.assert(totalRecommendations === countedTotal, 'Recommendation counts should be consistent');
      
      // Impact percentage bounds
      this.assert(lowResult.recommendations.totalImpactPercentage >= 0, 'Impact should not be negative');
      this.assert(lowResult.recommendations.totalImpactPercentage <= 100, 'Impact should not exceed 100');
      
      this.results.passed++;
      console.log('✅ Recommendation engine tests passed\n');
    } catch (error) {
      this.results.failed++;
      this.results.errors.push(`Recommendation engine: ${error}`);
      console.log('❌ Recommendation engine tests failed\n');
    }
  }

  /**
   * Test impact calculation
   */
  private async testImpactCalculation(): Promise<void> {
    console.log('🎯 Testing Impact Calculation...');
    
    try {
      // Import impact calculation engine
      const { calculateSkillImpacts } = await import('./impactCalculationEngine');
      
      // Test with missing skills
      const impactInput = {
        resumeSkills: ['JavaScript', 'React'],
        jobSkills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
        currentScore: 60,
        maxPossibleScore: 100,
      };
      
      const impactResult = calculateSkillImpacts(impactInput);
      
      // Should detect missing skills
      this.assert(impactResult.missingSkills.length > 0, 'Should detect missing skills');
      this.assert(impactResult.totalPotentialIncrease > 0, 'Should have potential increase');
      this.assert(impactResult.potentialScore > impactInput.currentScore, 'Potential score should be higher than current');
      this.assert(impactResult.totalPotentialIncrease <= 40, 'Total increase should be reasonable');
      
      // Test bounds
      this.assert(impactResult.potentialScore <= 100, 'Potential score should not exceed 100');
      this.assert(impactResult.totalPotentialIncrease <= 40, 'Total increase should be reasonable');
      
      // Test impact distribution
      const distribution = impactResult.impactDistribution;
      this.assert(distribution.critical?.length > 0 || distribution.high?.length > 0 || distribution.medium?.length > 0 || distribution.low?.length > 0, 'Should have impact distribution');
      
      this.results.passed++;
      console.log('✅ Impact calculation tests passed\n');
    } catch (error) {
      this.results.failed++;
      this.results.errors.push(`Impact calculation: ${error}`);
      console.log('❌ Impact calculation tests failed\n');
    }
  }

  /**
   * Test soft skill detection
   */
  private async testSoftSkillDetection(): Promise<void> {
    console.log('🗣️ Testing Soft Skill Detection...');
    
    try {
      // Import soft skill detection engine
      const { detectSoftSkills } = await import('./softSkillDetectionEngine');
      
      // Test with rich text
      const richText = 'Experienced team leader with excellent communication skills. Managed multiple projects and collaborated effectively with cross-functional teams. Strong problem-solving abilities and adaptable to new technologies.';
      const softSkillResult = detectSoftSkills(richText);
      
      // Should detect soft skills
      this.assert(softSkillResult.matchedSkills.length > 0, 'Should detect soft skills');
      this.assert(softSkillResult.confidence > 0, 'Should have confidence score');
      
      // Test confidence bounds
      this.assert(softSkillResult.confidence <= 100, 'Confidence should not exceed 100');
      this.assert(softSkillResult.confidence >= 0, 'Confidence should not be negative');
      
      // Test with empty text
      const emptyResult = detectSoftSkills('');
      this.assert(emptyResult.matchedSkills.length === 0, 'Empty text should have no matches');
      this.assert(emptyResult.confidence === 0, 'Empty text should have zero confidence');
      
      // Test categories
      const detectedCategories = new Set(softSkillResult.matchedSkills.map(m => m.category));
      this.assert(detectedCategories.size === softSkillResult.matchedSkills.length, 'No duplicate categories');
      
      this.results.passed++;
      console.log('✅ Soft skill detection tests passed\n');
    } catch (error) {
      this.results.failed++;
      this.results.errors.push(`Soft skill detection: ${error}`);
      console.log('❌ Soft skill detection tests failed\n');
    }
  }

  /**
   * Test data consistency
   */
  private async testDataConsistency(): Promise<void> {
    console.log('🔍 Testing Data Consistency...');
    
    try {
      // Test with valid data
      const validResult = await runQuickAnalysis(TEST_INPUTS.valid);
      
      // Should pass validation
      this.assert(validResult.validation.isValid, 'Valid data should pass consistency validation');
      this.assert(validResult.validation.score >= 80, 'Valid data should have high consistency score');
      
      // Test with inconsistent data (manually create inconsistency)
      const inconsistentResult = await runQuickAnalysis(TEST_INPUTS.valid);
      // Manually modify to create inconsistency
      inconsistentResult.scoring.overallMatch = 95; // High score
      inconsistentResult.recommendations.criticalCount = 5; // But many critical issues
      
      const validation = validateDataConsistency({
        scoringResults: inconsistentResult.scoring,
        recommendations: inconsistentResult.recommendations,
        impactCalculation: inconsistentResult.recommendations as any,
        softSkillDetection: { matchedSkills: [], missingSkills: [], confidence: 0, totalSkills: 0 },
        resumeSkills: TEST_INPUTS.valid.resumeSkills,
        jobSkills: TEST_INPUTS.valid.jobSkills,
        missingSkillsCount: 5,
        matchedSkillsCount: 3,
      });
      
      this.assert(!validation.isValid, 'Inconsistent data should fail validation');
      this.assert(validation.issues.length > 0, 'Inconsistent data should have issues');
      
      this.results.passed++;
      console.log('✅ Data consistency tests passed\n');
    } catch (error) {
      this.results.failed++;
      this.results.errors.push(`Data consistency: ${error}`);
      console.log('❌ Data consistency tests failed\n');
    }
  }

  /**
   * Test integration
   */
  private async testIntegration(): Promise<void> {
    console.log('🔗 Testing Integration...');
    
    try {
      // Full analysis integration
      const fullResult = await runAnalysisEngine(TEST_INPUTS.valid);
      
      // Should have all components
      this.assert(fullResult.scoring !== undefined, 'Should have scoring results');
      this.assert(fullResult.recommendations !== undefined, 'Should have recommendations');
      this.assert(fullResult.impactCalculation !== undefined, 'Should have impact calculation');
      this.assert(fullResult.softSkills !== undefined, 'Should have soft skills');
      this.assert(fullResult.trend !== undefined, 'Should have trend data');
      this.assert(fullResult.validation !== undefined, 'Should have validation');
      
      // Should have metadata
      this.assert(fullResult.analysisId !== undefined, 'Should have analysis ID');
      this.assert(fullResult.timestamp !== undefined, 'Should have timestamp');
      this.assert(fullResult.version !== undefined, 'Should have version');
      this.assert(fullResult.processingTime !== undefined, 'Should have processing time');
      
      // Processing time should be reasonable
      this.assert(fullResult.processingTime < 5000, 'Processing should complete within 5 seconds');
      
      // Validation should pass
      this.assert(fullResult.validation.isValid, 'Integration should pass validation');
      
      this.results.passed++;
      console.log('✅ Integration tests passed\n');
    } catch (error) {
      this.results.failed++;
      this.results.errors.push(`Integration: ${error}`);
      console.log('❌ Integration tests failed\n');
    }
  }

  /**
   * Test performance
   */
  private async testPerformance(): Promise<void> {
    console.log('⚡ Testing Performance...');
    
    try {
      const iterations = 10;
      const times: number[] = [];
      
      // Run multiple analyses
      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await runQuickAnalysis(TEST_INPUTS.valid);
        times.push(Date.now() - start);
      }
      
      // Calculate statistics
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);
      
      // Performance assertions
      this.assert(avgTime < 1000, `Average time should be under 1s (was ${avgTime}ms)`);
      this.assert(maxTime < 2000, `Max time should be under 2s (was ${maxTime}ms)`);
      
      console.log(`📊 Performance: Avg ${avgTime.toFixed(0)}ms, Min ${minTime}ms, Max ${maxTime}ms`);
      
      this.results.passed++;
      console.log('✅ Performance tests passed\n');
    } catch (error) {
      this.results.failed++;
      this.results.errors.push(`Performance: ${error}`);
      console.log('❌ Performance tests failed\n');
    }
  }

  /**
   * Test edge cases
   */
  private async testEdgeCases(): Promise<void> {
    console.log('🚨 Testing Edge Cases...');
    
    try {
      // Empty skills
      const emptySkillsResult = await runQuickAnalysis({
        ...TEST_INPUTS.valid,
        resumeSkills: [],
        jobSkills: [],
      });
      
      // Should handle gracefully
      this.assert(emptySkillsResult.scoring.technicalFit >= 0, 'Empty skills should not crash');
      this.assert(emptySkillsResult.scoring.technicalFit <= 100, 'Empty skills should be within bounds');
      
      // Very long text
      const longText = 'JavaScript '.repeat(1000);
      const longTextResult = await runQuickAnalysis({
        ...TEST_INPUTS.valid,
        resumeText: longText,
        jobDescriptionText: longText,
      });
      
      // Should handle gracefully
      this.assert(longTextResult.validation.isValid, 'Long text should pass validation');
      
      // Extreme experience values
      const extremeExperienceResult = await runQuickAnalysis({
        ...TEST_INPUTS.valid,
        resumeExperienceYears: 50,
        requiredExperienceYears: 0,
      });
      
      // Should handle gracefully
      this.assert(extremeExperienceResult.validation.isValid, 'Extreme experience should pass validation');
      
      this.results.passed++;
      console.log('✅ Edge case tests passed\n');
    } catch (error) {
      this.results.failed++;
      this.results.errors.push(`Edge cases: ${error}`);
      console.log('❌ Edge case tests failed\n');
    }
  }

  /**
   * Assertion helper
   */
  private assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(message);
    }
  }

  /**
   * Print test results
   */
  private printResults(): void {
    console.log('\n📋 Test Results Summary:');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings.length}`);
    
    if (this.results.errors.length > 0) {
      console.log('\n🚨 Errors:');
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.results.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }
    
    const successRate = (this.results.passed / (this.results.passed + this.results.failed)) * 100;
    console.log(`\n📈 Success Rate: ${successRate.toFixed(1)}%`);
    
    if (this.results.failed === 0) {
      console.log('🎉 All tests passed! Analysis engine is production-ready.');
    } else {
      console.log('⚠️  Some tests failed. Review and fix issues before production deployment.');
    }
  }
}

/**
 * Quick test runner for development
 */
export async function runQuickTests(): Promise<void> {
  const testSuite = new AnalysisEngineTestSuite();
  await testSuite.runAllTests();
}
