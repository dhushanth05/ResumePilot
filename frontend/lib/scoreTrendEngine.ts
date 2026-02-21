/**
 * Score Trend Engine - Historical Data Management and Authentic Trend Analysis
 * 
 * This module provides production-ready functionality for storing, retrieving,
 * and analyzing real historical analysis data for score trend visualization.
 */

export interface AnalysisRecord {
  id: string;
  resumeId: string;
  jobId: string;
  overallMatch: number;
  technicalFit: number;
  experienceFit: number;
  atsScore: number;
  timestamp: Date;
  version: string;
}

export interface TrendDataPoint {
  date: string;
  overallMatch: number;
  technicalFit: number;
  experienceFit: number;
  atsScore: number;
}

export interface TrendAnalysisResult {
  dataPoints: TrendDataPoint[];
  trendDirection: 'improving' | 'declining' | 'stable';
  averageScore: number;
  scoreVariation: number;
  improvementRate: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface ScoreTrendInput {
  resumeId: string;
  jobId: string;
  maxDataPoints?: number; // Default: 5
}

/**
 * Mock database for storing analysis records
 * In production, this would be replaced with actual database calls
 */
class AnalysisRecordStore {
  private records: Map<string, AnalysisRecord[]> = new Map();
  
  /**
   * Store a new analysis record
   */
  storeRecord(record: AnalysisRecord): void {
    const key = this.generateKey(record.resumeId, record.jobId);
    const records = this.records.get(key) || [];
    
    // Add new record
    records.push(record);
    
    // Keep only the most recent 10 records per resume-job combination
    const sortedRecords = records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    this.records.set(key, sortedRecords.slice(0, 10));
  }
  
  /**
   * Retrieve records for a specific resume-job combination
   */
  getRecords(resumeId: string, jobId: string, limit?: number): AnalysisRecord[] {
    const key = this.generateKey(resumeId, jobId);
    const records = this.records.get(key) || [];
    
    const sortedRecords = records.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    return limit ? sortedRecords.slice(-limit) : sortedRecords;
  }
  
  /**
   * Get all records for a resume across different jobs
   */
  getResumeHistory(resumeId: string, limit?: number): AnalysisRecord[] {
    const allRecords: AnalysisRecord[] = [];
    
    this.records.forEach((records, key) => {
      if (key.startsWith(resumeId + ':')) {
        allRecords.push(...records);
      }
    });
    
    const sortedRecords = allRecords.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    return limit ? sortedRecords.slice(-limit) : sortedRecords;
  }
  
  /**
   * Clear all records (for testing)
   */
  clearAll(): void {
    this.records.clear();
  }
  
  private generateKey(resumeId: string, jobId: string): string {
    return `${resumeId}:${jobId}`;
  }
}

// Global store instance
const recordStore = new AnalysisRecordStore();

/**
 * Store analysis result in the database
 */
export function storeAnalysisResult(input: {
  resumeId: string;
  jobId: string;
  overallMatch: number;
  technicalFit: number;
  experienceFit: number;
  atsScore: number;
}): AnalysisRecord {
  const record: AnalysisRecord = {
    id: generateRecordId(),
    resumeId: input.resumeId,
    jobId: input.jobId,
    overallMatch: input.overallMatch,
    technicalFit: input.technicalFit,
    experienceFit: input.experienceFit,
    atsScore: input.atsScore,
    timestamp: new Date(),
    version: '1.0.0',
  };
  
  recordStore.storeRecord(record);
  return record;
}

/**
 * Retrieve historical trend data for a specific resume-job combination
 */
export function getScoreTrend(input: ScoreTrendInput): TrendAnalysisResult {
  const { resumeId, jobId, maxDataPoints = 5 } = input;
  
  const records = recordStore.getRecords(resumeId, jobId, maxDataPoints);
  
  if (records.length === 0) {
    return createEmptyTrendResult();
  }
  
  const dataPoints = records.map(record => ({
    date: formatDate(record.timestamp),
    overallMatch: record.overallMatch,
    technicalFit: record.technicalFit,
    experienceFit: record.experienceFit,
    atsScore: record.atsScore,
  }));
  
  return analyzeTrend(dataPoints);
}

/**
 * Get broader resume history across all jobs
 */
export function getResumeTrendHistory(resumeId: string, maxDataPoints: number = 10): TrendAnalysisResult {
  const records = recordStore.getResumeHistory(resumeId, maxDataPoints);
  
  if (records.length === 0) {
    return createEmptyTrendResult();
  }
  
  // Group by date and average scores for multiple jobs on same day
  const groupedData = groupRecordsByDate(records);
  
  const dataPoints = Object.entries(groupedData)
    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
    .slice(-maxDataPoints)
    .map(([date, recordGroup]) => ({
      date,
      overallMatch: average(recordGroup.map(r => r.overallMatch)),
      technicalFit: average(recordGroup.map(r => r.technicalFit)),
      experienceFit: average(recordGroup.map(r => r.experienceFit)),
      atsScore: average(recordGroup.map(r => r.atsScore)),
    }));
  
  return analyzeTrend(dataPoints);
}

/**
 * Analyze trend data to determine direction and statistics
 */
function analyzeTrend(dataPoints: TrendDataPoint[]): TrendAnalysisResult {
  if (dataPoints.length === 0) {
    return createEmptyTrendResult();
  }
  
  if (dataPoints.length === 1) {
    return {
      dataPoints,
      trendDirection: 'stable',
      averageScore: dataPoints[0].overallMatch,
      scoreVariation: 0,
      improvementRate: 0,
      confidence: 'low',
    };
  }
  
  // Calculate trend direction
  const firstScore = dataPoints[0].overallMatch;
  const lastScore = dataPoints[dataPoints.length - 1].overallMatch;
  const scoreDifference = lastScore - firstScore;
  
  let trendDirection: 'improving' | 'declining' | 'stable';
  if (scoreDifference > 5) {
    trendDirection = 'improving';
  } else if (scoreDifference < -5) {
    trendDirection = 'declining';
  } else {
    trendDirection = 'stable';
  }
  
  // Calculate statistics
  const scores = dataPoints.map(dp => dp.overallMatch);
  const averageScore = average(scores);
  const scoreVariation = calculateVariation(scores);
  const improvementRate = calculateImprovementRate(dataPoints);
  
  // Determine confidence based on data points and variation
  let confidence: 'high' | 'medium' | 'low';
  if (dataPoints.length >= 5 && scoreVariation < 15) {
    confidence = 'high';
  } else if (dataPoints.length >= 3 && scoreVariation < 25) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }
  
  return {
    dataPoints,
    trendDirection,
    averageScore,
    scoreVariation,
    improvementRate,
    confidence,
  };
}

/**
 * Create empty trend result for cases with no data
 */
function createEmptyTrendResult(): TrendAnalysisResult {
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
 * Group records by date for averaging multiple analyses on the same day
 */
function groupRecordsByDate(records: AnalysisRecord[]): Record<string, AnalysisRecord[]> {
  const grouped: Record<string, AnalysisRecord[]> = {};
  
  records.forEach(record => {
    const date = formatDate(record.timestamp);
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(record);
  });
  
  return grouped;
}

/**
 * Calculate average of numbers
 */
function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

/**
 * Calculate variation (standard deviation approximation)
 */
function calculateVariation(scores: number[]): number {
  if (scores.length <= 1) return 0;
  
  const avg = average(scores);
  const squaredDiffs = scores.map(score => Math.pow(score - avg, 2));
  const variance = average(squaredDiffs);
  
  return Math.sqrt(variance);
}

/**
 * Calculate improvement rate (percentage change per time period)
 */
function calculateImprovementRate(dataPoints: TrendDataPoint[]): number {
  if (dataPoints.length <= 1) return 0;
  
  const firstScore = dataPoints[0].overallMatch;
  const lastScore = dataPoints[dataPoints.length - 1].overallMatch;
  
  if (firstScore === 0) return 0;
  
  return ((lastScore - firstScore) / firstScore) * 100;
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
  });
}

/**
 * Generate unique record ID
 */
function generateRecordId(): string {
  return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate trend data consistency
 */
export function validateTrendData(result: TrendAnalysisResult): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check data points consistency
  result.dataPoints.forEach((point, index) => {
    if (point.overallMatch < 0 || point.overallMatch > 100) {
      issues.push(`Invalid overall match at index ${index}: ${point.overallMatch}`);
    }
    
    if (point.technicalFit < 0 || point.technicalFit > 100) {
      issues.push(`Invalid technical fit at index ${index}: ${point.technicalFit}`);
    }
    
    if (point.experienceFit < 0 || point.experienceFit > 100) {
      issues.push(`Invalid experience fit at index ${index}: ${point.experienceFit}`);
    }
    
    if (point.atsScore < 0 || point.atsScore > 100) {
      issues.push(`Invalid ATS score at index ${index}: ${point.atsScore}`);
    }
  });
  
  // Check trend direction consistency
  if (result.dataPoints.length > 1) {
    const firstScore = result.dataPoints[0].overallMatch;
    const lastScore = result.dataPoints[result.dataPoints.length - 1].overallMatch;
    
    if (result.trendDirection === 'improving' && lastScore <= firstScore) {
      issues.push('Trend direction marked as improving but score decreased');
    }
    
    if (result.trendDirection === 'declining' && lastScore >= firstScore) {
      issues.push('Trend direction marked as declining but score increased');
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Clear all stored data (for testing purposes)
 */
export function clearAllTrendData(): void {
  recordStore.clearAll();
}

/**
 * Export store for testing
 */
export { recordStore as _recordStore };
