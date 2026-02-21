import { categorizeSkill, normalizeSkill, type CategorizedSkill } from './skillCategorization';
import { calculateExperienceRelevance } from './experienceRelevance';

export interface Recommendation {
  type: 'missing_critical_skill' | 'missing_important_skill' | 'missing_bonus_skill' | 'formatting' | 'impact_metric' | 'experience_gap' | 'soft_skill_gap';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionable: string;
  impact_score: number;
}

function inferSoftSkillsFromText(text: string): string[] {
  const inferredSkills: string[] = [];
  
  // Action verb patterns for soft skills
  const verbPatterns = {
    'problem solving': /\b(improved|optimized|solved|resolved|fixed|debugged|troubleshoot|analyzed)\b/gi,
    'teamwork': /\b(collaborat|cooperat|work[ -]with|partner|team|joint|shared|assist|support|help|mentor|guid)\b/gi,
    'leadership': /\b(led|manag|supervis|direct|coordinat|organiz|head|chair|lead|mentor|train|guid|oversee)\b/gi,
    'communication': /\b(present|communicat|explain|document|report|writ|speak|discuss|negotiat|persuad|influenc)\b/gi
  };
  
  Object.entries(verbPatterns).forEach(([skill, pattern]) => {
    if (pattern.test(text)) {
      inferredSkills.push(skill);
    }
  });
  
  return [...new Set(inferredSkills)]; // Remove duplicates
}

export interface SmartRecommendationsResult {
  recommendations: Recommendation[];
  summary: {
    critical_issues: number;
    high_priority_issues: number;
    medium_priority_issues: number;
    low_priority_issues: number;
    total_impact_score: number;
  };
}

export function generateSmartRecommendations(
  resumeText: string,
  resumeSkills: string[],
  jobSkills: string[],
  jobDescription: string,
  experienceRelevance: any,
  formattingScore: number
): SmartRecommendationsResult {
  const recommendations: Recommendation[] = [];
  
  const normalizedResumeSkills = resumeSkills.map(normalizeSkill);
  const normalizedJobSkills = jobSkills.map(normalizeSkill);
  const resumeSkillSet = new Set(normalizedResumeSkills);
  const jobSkillSet = new Set(normalizedJobSkills);
  
  // Categorize job skills to identify missing critical ones
  const categorizedJobSkills = jobSkills.map(skill => categorizeSkill(skill));
  
  // 1. Check for missing core skills (Critical priority)
  const missingCoreSkills = categorizedJobSkills.filter(skill => 
    skill.category === 'core_technical' && 
    skill.priority === 'critical' && 
    !resumeSkillSet.has(normalizeSkill(skill.skill))
  );
  
  missingCoreSkills.forEach(skill => {
    recommendations.push({
      type: 'missing_critical_skill',
      priority: 'critical',
      title: `Missing Core Skill: ${skill.skill}`,
      description: `${skill.skill} is essential for this position and completely absent from your resume.`,
      actionable: `Add ${skill.skill} to your technical skills section. Highlight any projects or coursework using ${skill.skill}, even if basic.`,
      impact_score: 0.9
    });
  });
  
  // 2. Check for missing preferred skills (High priority)
  const missingPreferredSkills = categorizedJobSkills.filter(skill => 
    (skill.category === 'backend' || skill.category === 'frontend' || skill.category === 'database') && 
    skill.priority === 'important' && 
    !resumeSkillSet.has(normalizeSkill(skill.skill))
  );
  
  missingPreferredSkills.slice(0, 3).forEach(skill => {
    recommendations.push({
      type: 'missing_important_skill',
      priority: 'high',
      title: `Missing Preferred Skill: ${skill.skill}`,
      description: `${skill.skill} is strongly preferred for this role and would significantly improve your match.`,
      actionable: `If you have ${skill.skill} experience, add it prominently. Consider a small project to demonstrate ${skill.skill} proficiency if lacking.`,
      impact_score: 0.7
    });
  });
  
  // 3. Check for missing bonus skills (Medium priority)
  const missingBonusSkills = categorizedJobSkills.filter(skill => 
    skill.category === 'bonus_skills' && 
    !resumeSkillSet.has(normalizeSkill(skill.skill))
  );
  
  if (missingBonusSkills.length > 0 && missingCoreSkills.length === 0) {
    recommendations.push({
      type: 'missing_bonus_skill',
      priority: 'medium',
      title: `Bonus Skills Available`,
      description: `You could differentiate yourself with ${missingBonusSkills.length} bonus skills mentioned in the job.`,
      actionable: `Even basic familiarity with ${missingBonusSkills.slice(0, 2).map(s => s.skill).join(' and ')} could set you apart from other candidates.`,
      impact_score: 0.3
    });
  }
  
  // 4. Formatting issues (High priority if score is low)
  if (formattingScore < 0.6) {
    recommendations.push({
      type: 'formatting',
      priority: 'high',
      title: 'ATS Formatting Issues Detected',
      description: 'Your resume formatting may prevent proper parsing by Applicant Tracking Systems.',
      actionable: 'Use standard section headers, avoid tables/columns, ensure consistent formatting, and use ATS-friendly fonts like Arial or Calibri.',
      impact_score: 0.6
    });
  }
  
  // 5. Impact metric suggestions (High priority if none found)
  const hasQuantifiableImpact = /\d+%|\$\d+|\d+ [xX]|increased|decreased|reduced|improved|achieved/gi.test(resumeText);
  if (!hasQuantifiableImpact) {
    recommendations.push({
      type: 'impact_metric',
      priority: 'high',
      title: 'Add Quantifiable Achievements',
      description: 'Your resume lacks specific metrics that demonstrate impact.',
      actionable: 'Add numbers to show impact: "Increased efficiency by 25%", "Managed budget of $50K", "Led team of 5 developers", "Reduced bugs by 40%".',
      impact_score: 0.8
    });
  }
  
  // 6. Experience relevance gaps (Medium priority)
  if (experienceRelevance.score < 0.5) {
    recommendations.push({
      type: 'experience_gap',
      priority: 'medium',
      title: 'Improve Project-Role Alignment',
      description: 'Your projects don\'t strongly align with the core requirements of this role.',
      actionable: `Highlight projects using technologies from the job description. Consider creating a project that demonstrates ${missingPreferredSkills[0]?.skill || 'key technologies'} from the requirements.`,
      impact_score: 0.5
    });
  }
  
  // 7. Soft skills inference (Medium priority)
  const inferredSoftSkills = inferSoftSkillsFromText(resumeText);
  const requiredSoftSkills = ['communication', 'teamwork', 'leadership', 'problem solving'];
  const missingSoftSkills = requiredSoftSkills.filter(skill => !inferredSoftSkills.includes(skill));
  
  if (missingSoftSkills.length > 0 && missingCoreSkills.length <= 1) {
    recommendations.push({
      type: 'soft_skill_gap',
      priority: 'medium',
      title: 'Strengthen Soft Skills Evidence',
      description: `Your resume could better demonstrate ${missingSoftSkills.join(' and ')} skills.`,
      actionable: `Add examples of ${missingSoftSkills.join(' and ')} in your project descriptions. Use action verbs like "collaborated", "led", "mentored" to show these skills.`,
      impact_score: 0.4
    });
  }
  
  // Sort by impact score and priority
  recommendations.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.impact_score - a.impact_score;
  });
  
  // Calculate summary
  const summary = {
    critical_issues: recommendations.filter(r => r.priority === 'critical').length,
    high_priority_issues: recommendations.filter(r => r.priority === 'high').length,
    medium_priority_issues: recommendations.filter(r => r.priority === 'medium').length,
    low_priority_issues: recommendations.filter(r => r.priority === 'low').length,
    total_impact_score: recommendations.reduce((sum, r) => sum + r.impact_score, 0)
  };
  
  return {
    recommendations: recommendations.slice(0, 6), // Limit to top 6 recommendations
    summary
  };
}

export function formatRecommendationsForDisplay(recommendations: Recommendation[]): string[] {
  return recommendations.map(rec => {
    const priorityEmoji = {
      critical: '🔴',
      high: '🟠', 
      medium: '🟡',
      low: '🔵'
    };
    
    return `${priorityEmoji[rec.priority]} **${rec.title}**: ${rec.description} ${rec.actionable}`;
  });
}
