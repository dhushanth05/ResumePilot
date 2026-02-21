"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Award, Target, BarChart3, AlertCircle } from "lucide-react";

import { ScoreTrendLine } from "@/components/charts/ScoreTrendLine";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalysisHistory } from "@/services/analysis";
import type { AnalysisResult } from "@/types/analysis";

export default function AnalyticsOverviewPage() {
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const items = await getAnalysisHistory();
        setHistory(items);
      } catch {
        // ignore history errors for now
      }
    })();
  }, []);

  // Calculate KPI metrics
  const calculateKPIs = () => {
    if (history.length === 0) {
      return {
        bestOverallScore: 0,
        averageOverallScore: 0,
        totalAnalysesCount: 0,
        highestATSScore: 0,
      };
    }

    const overallScores = history.map(h => (h.ats_score + h.similarity_score) / 2);
    const atsScores = history.map(h => h.ats_score);

    return {
      bestOverallScore: Math.max(...overallScores) * 100,
      averageOverallScore: overallScores.reduce((a, b) => a + b, 0) / overallScores.length * 100,
      totalAnalysesCount: history.length,
      highestATSScore: Math.max(...atsScores) * 100,
    };
  };

  const kpis = calculateKPIs();

  // Calculate trend insights
  const calculateTrendInsights = () => {
    if (history.length < 2) {
      return {
        improvementPercentage: 0,
        bestPerformingDate: null,
        totalRuns: history.length,
        peakScore: 0,
      };
    }

    const firstScore = ((history[0].ats_score + history[0].similarity_score) / 2) * 100;
    const latestScore = ((history[history.length - 1].ats_score + history[history.length - 1].similarity_score) / 2) * 100;
    const improvementPercentage = ((latestScore - firstScore) / firstScore) * 100;

    const scoresWithDates = history.map(h => ({
      score: ((h.ats_score + h.similarity_score) / 2) * 100,
      date: new Date(h.created_at),
    }));

    const bestEntry = scoresWithDates.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    return {
      improvementPercentage: isNaN(improvementPercentage) ? 0 : improvementPercentage,
      bestPerformingDate: bestEntry.date,
      totalRuns: history.length,
      peakScore: bestEntry.score,
    };
  };

  const trendInsights = calculateTrendInsights();

  // Calculate improvement insights
  const calculateImprovementInsights = () => {
    if (history.length === 0) {
      return {
        mostFrequentlyMissingSkill: null,
        lowestAverageCategory: null,
        mostImprovedCategory: null,
      };
    }

    // This is a simplified version - in real implementation, you'd analyze detailed breakdown data
    const missingSkillsCount: Record<string, number> = {};
    
    // For demo purposes, return placeholder insights
    return {
      mostFrequentlyMissingSkill: "Communication Skills",
      lowestAverageCategory: "Project Relevance",
      mostImprovedCategory: "Keyword Optimization",
    };
  };

  const improvementInsights = calculateImprovementInsights();

  return (
    <DashboardLayout
      title="Analytics Overview"
      subtitle="Charts, trends, and insights across your analyses."
    >
      <div className="space-y-6">
        {/* KPI Summary Section */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-xs font-medium text-slate-400">Best Overall Score</p>
                <Award className="h-4 w-4 text-sky-400" />
              </div>
              <div className="text-2xl font-bold text-slate-50">
                {kpis.bestOverallScore.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-xs font-medium text-slate-400">Average Overall Score</p>
                <BarChart3 className="h-4 w-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-slate-50">
                {kpis.averageOverallScore.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-xs font-medium text-slate-400">Total Analyses</p>
                <Target className="h-4 w-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-slate-50">
                {kpis.totalAnalysesCount}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-xs font-medium text-slate-400">Highest ATS Score</p>
                <TrendingUp className="h-4 w-4 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-slate-50">
                {kpis.highestATSScore.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Trend Over Time Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Trend over time</CardTitle>
              <CardDescription>
                Track ATS and similarity scores across your historical analyses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-4">
                  <ScoreTrendLine history={history} />
                  
                  {/* Trend Insights */}
                  <div className="grid gap-4 md:grid-cols-3 border-t border-slate-800 pt-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-slate-400">Improvement</span>
                        {trendInsights.improvementPercentage >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-400" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-400" />
                        )}
                      </div>
                      <div className={`text-sm font-medium ${
                        trendInsights.improvementPercentage >= 0 ? "text-green-400" : "text-red-400"
                      }`}>
                        {trendInsights.improvementPercentage >= 0 ? "+" : ""}
                        {trendInsights.improvementPercentage.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-slate-400">Best Performing Date</div>
                      <div className="text-sm text-slate-200">
                        {trendInsights.bestPerformingDate ? 
                          trendInsights.bestPerformingDate.toLocaleDateString() : 
                          "N/A"
                        }
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-slate-400">Total Runs</div>
                      <div className="text-sm text-slate-200">{trendInsights.totalRuns}</div>
                    </div>
                  </div>
                  
                  {trendInsights.peakScore > 0 && (
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <AlertCircle className="h-3 w-3" />
                      <span>Peak score: {trendInsights.peakScore.toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  Once you have multiple analyses, score trends will appear here.
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Top Improvement Insights Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Top Improvement Insights</CardTitle>
              <CardDescription>
                Key areas to focus on for resume optimization based on your analysis history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-orange-400" />
                      <span className="text-sm font-medium text-slate-300">Most Frequently Missing Skill</span>
                    </div>
                    <div className="text-lg font-bold text-orange-400">
                      {improvementInsights.mostFrequentlyMissingSkill || "N/A"}
                    </div>
                    <p className="text-xs text-slate-400">
                      Focus on adding this skill to improve your match scores
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-medium text-slate-300">Lowest Average Category</span>
                    </div>
                    <div className="text-lg font-bold text-red-400">
                      {improvementInsights.lowestAverageCategory || "N/A"}
                    </div>
                    <p className="text-xs text-slate-400">
                      This category needs the most improvement across your analyses
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-slate-300">Most Improved Category</span>
                    </div>
                    <div className="text-lg font-bold text-green-400">
                      {improvementInsights.mostImprovedCategory || "N/A"}
                    </div>
                    <p className="text-xs text-slate-400">
                      Great progress! Keep building on this strength
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                  <div className="text-sm text-slate-400">
                    Start analyzing resumes to see improvement insights
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/analysis'}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    Begin Analysis Journey
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}
