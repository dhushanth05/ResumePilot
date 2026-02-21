import type { AnalysisDashboardResponse } from '@/types/analysis';
import { enhanceAnalysisResponse } from './analysisEnhancer';

export const createDemoAnalysis = (): AnalysisDashboardResponse => {
  const baseAnalysis: AnalysisDashboardResponse = {
    result: {
      id: "demo-1",
      user_id: 1,
      resume_id: "resume-1",
      job_description_id: "job-1",
      similarity_score: 0.75,
      ats_score: 0.82,
      missing_skills: null,
      details: null,
      notes: null,
      created_at: new Date().toISOString(),
    },
    charts: {
      ats_score: 0.82,
      similarity_score: 0.75,
      missing_skills: ["Docker", "Kubernetes", "GraphQL"],
      matched_skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
      skill_gap: [],
      skill_distribution: [],
    },
    ats_score: 0.82,
    skill_match: 0.75,
    breakdown: {
      formatting: 0.85,
      keyword_optimization: 0.78,
      experience_relevance: 0.72,
      project_relevance: 0.68,
      weighted_skill_score: 0,
      category_scores: {},
      confidence_score: 0,
      preferredSkillImpact: 0,
      bonusSkillDifferentiator: 0,
    },
    resume_skills: [
      "JavaScript", "TypeScript", "React", "Node.js", "Express.js",
      "PostgreSQL", "MongoDB", "Git", "REST APIs", "HTML", "CSS"
    ],
    job_skills: [
      "React", "Node.js", "TypeScript", "PostgreSQL", "Docker", 
      "Kubernetes", "GraphQL", "REST APIs", "AWS", "Git"
    ],
    matched_skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "REST APIs", "Git"],
    missing_skills: ["Docker", "Kubernetes", "GraphQL", "AWS"],
    extra_skills: ["Express.js", "MongoDB", "HTML", "CSS"],
    categorized_skills: {},
    weighted_scores: {},
    keyword_gap: [
      {
        keyword: "React",
        found_in_resume: true,
        importance: "High",
        impact_score: 0.9,
        category: "frontend",
        priority: "critical"
      },
      {
        keyword: "Node.js",
        found_in_resume: true,
        importance: "High",
        impact_score: 0.85,
        category: "backend",
        priority: "critical"
      },
      {
        keyword: "Docker",
        found_in_resume: false,
        importance: "High",
        impact_score: 0.8,
        category: "devops",
        priority: "important"
      },
      {
        keyword: "Kubernetes",
        found_in_resume: false,
        importance: "Medium",
        impact_score: 0.7,
        category: "devops",
        priority: "important"
      },
      {
        keyword: "GraphQL",
        found_in_resume: false,
        importance: "Medium",
        impact_score: 0.6,
        category: "backend",
        priority: "nice_to_have"
      },
      {
        keyword: "AWS",
        found_in_resume: false,
        importance: "Medium",
        impact_score: 0.65,
        category: "devops",
        priority: "important"
      }
    ],
    experience_analysis: {
      required_years: 3,
      resume_years: 4,
      gap: -1,
    },
    project_analysis: [
      {
        project_name: "E-commerce Platform",
        relevance_score: 0.85,
        matched_technologies: ["React", "Node.js", "PostgreSQL"]
      },
      {
        project_name: "API Gateway",
        relevance_score: 0.72,
        matched_technologies: ["Node.js", "REST APIs"]
      }
    ],
    soft_skills: {
      matched: ["Communication", "Teamwork", "Problem Solving"],
      missing: ["Leadership", "Time Management"]
    },
    ai_recommendations: [
      "Add Docker and Kubernetes experience to your resume",
      "Include more quantifiable achievements in your project descriptions",
      "Highlight leadership experience in your work history"
    ],
    smart_recommendations: {
      recommendations: [],
      summary: {
        critical_issues: 0,
        high_priority_issues: 0,
        medium_priority_issues: 0,
        low_priority_issues: 0,
        total_impact_score: 0,
      }
    }
  };

  // Enhance with weighted scoring and smart recommendations
  const demoResumeText = `
    Senior Software Developer with 4+ years of experience building web applications.
    Led development of e-commerce platform using React, Node.js, and PostgreSQL.
    Implemented REST APIs and improved system performance by 40%.
    Worked in agile teams and mentored junior developers.
  `;

  return enhanceAnalysisResponse(baseAnalysis, demoResumeText);
};
