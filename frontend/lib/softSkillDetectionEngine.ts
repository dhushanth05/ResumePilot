/**
 * Soft Skill Detection Engine - Advanced Soft Skill Identification
 * 
 * This module provides sophisticated soft skill detection with case-insensitive
 * matching, synonym mapping, partial phrase matching, and confidence scoring.
 */

export interface SoftSkillMatch {
  skill: string;
  confidence: number; // 0-100
  matchedText: string;
  category: 'communication' | 'leadership' | 'teamwork' | 'problem_solving' | 'adaptability' | 'creativity' | 'time_management' | 'critical_thinking';
  position: number; // Character position in text
}

export interface SoftSkillDetectionResult {
  matchedSkills: SoftSkillMatch[];
  missingSkills: string[];
  confidence: number; // Overall confidence in detection
  totalSkills: number;
}

/**
 * Comprehensive soft skill definitions with synonyms and patterns
 */
const SOFT_SKILL_DEFINITIONS = {
  communication: {
    terms: [
      'communication', 'communicating', 'communicated', 'communicate',
      'presented', 'presentation', 'presenting', 'public speaking',
      'articulate', 'articulated', 'articulation', 'verbal skills',
      'written communication', 'writing', 'wrote', 'written',
      'interpersonal skills', 'interpersonal', 'people skills',
      'client communication', 'stakeholder communication',
      'negotiation', 'negotiated', 'negotiating'
    ],
    patterns: [
      /\b(communicat|present|articulate|interpersonal)\w*\b/gi,
      /\b(public\s+speaking|verbal\s+skills|written\s+communication)\b/gi,
      /\b(client\s+communication|stakeholder\s+communication)\b/gi
    ],
    weight: 1.0
  },
  
  leadership: {
    terms: [
      'leadership', 'leading', 'led', 'lead', 'leader',
      'managed', 'managing', 'management', 'manager',
      'supervised', 'supervising', 'supervisor', 'oversight',
      'directed', 'directing', 'direction', 'team lead',
      'mentored', 'mentoring', 'mentor', 'guidance',
      'coordinated', 'coordinating', 'coordination',
      'delegated', 'delegating', 'delegation'
    ],
    patterns: [
      /\b(lead|manag|supervis|direct|mentor|coordinat)\w*\b/gi,
      /\b(team\s+lead|project\s+lead|technical\s+lead)\b/gi,
      /\b(oversight|guidance|delegation)\b/gi
    ],
    weight: 1.2
  },
  
  teamwork: {
    terms: [
      'teamwork', 'team work', 'collaboration', 'collaborative', 'collaborated',
      'cooperation', 'cooperative', 'cooperated', 'team player',
      'worked with', 'working with', 'paired with', 'partnered',
      'group work', 'group project', 'team project',
      'cross-functional', 'cross functional', 'multidisciplinary',
      'synergy', 'synergistic', 'aligned with', 'partnered with'
    ],
    patterns: [
      /\b(teamwork|collaborat|cooperat|synerg)\w*\b/gi,
      /\b(team\s+player|cross\s+functional|multi\w*disciplinary)\b/gi,
      /\b(group\s+work|team\s+project)\b/gi
    ],
    weight: 1.0
  },
  
  problem_solving: {
    terms: [
      'problem solving', 'problem-solving', 'solved', 'solving', 'solve',
      'troubleshoot', 'troubleshooting', 'troubleshooted',
      'analytical', 'analysis', 'analyzed', 'analyze',
      'critical thinking', 'critically', 'investigated', 'investigation',
      'diagnosed', 'diagnosing', 'diagnosis', 'identified issues',
      'root cause', 'root cause analysis', 'solution', 'solutions'
    ],
    patterns: [
      /\b(problem\s+solving|troubleshoot|analyz|diagnos)\w*\b/gi,
      /\b(critical\s+thinking|root\s+cause)\b/gi,
      /\b(solution|solutions)\b/gi
    ],
    weight: 1.1
  },
  
  adaptability: {
    terms: [
      'adaptable', 'adaptability', 'adapted', 'adapting', 'adapt',
      'flexible', 'flexibility', 'flexed', 'flexing',
      'versatile', 'versatility', 'agile', 'agility',
      'pivot', 'pivoted', 'pivoting', 'adjusted', 'adjusting',
      'responsive', 'responded', 'responding', 'open to change',
      'fast learner', 'quick learner', 'learned quickly'
    ],
    patterns: [
      /\b(adapt|flex|versatil|agil|pivot|adjust)\w*\b/gi,
      /\b(responsive|open\s+to\s+change)\b/gi,
      /\b(fast\s+learner|quick\s+learner)\b/gi
    ],
    weight: 0.9
  },
  
  creativity: {
    terms: [
      'creative', 'creativity', 'created', 'creating', 'create',
      'innovative', 'innovation', 'innovated', 'innovating',
      'designed', 'designing', 'design', 'designer',
      'ideation', 'ideated', 'brainstorm', 'brainstormed',
      'conceptualized', 'conceptualize', 'prototype', 'prototyped',
      'out-of-the-box', 'out of the box', 'thinking outside'
    ],
    patterns: [
      /\b(creat|innovat|design|ideat|brainstorm)\w*\b/gi,
      /\b(conceptual|prototyp)\w*\b/gi,
      /\b(out\s*of\s*the\s*box|thinking\s*outside)\b/gi
    ],
    weight: 0.8
  },
  
  time_management: {
    terms: [
      'time management', 'time-management', 'managed time', 'time managed',
      'deadline', 'deadlines', 'met deadlines', 'deadline driven',
      'prioritized', 'prioritizing', 'prioritization', 'priority',
      'efficient', 'efficiency', 'streamlined', 'streamlining',
      'organized', 'organization', 'well-organized', 'structured',
      'multitask', 'multitasking', 'handled multiple', 'concurrent'
    ],
    patterns: [
      /\b(time\s+management|deadline|priorit|efficient|organiz)\w*\b/gi,
      /\b(multitask|concurrent|well\s+organized)\b/gi
    ],
    weight: 0.9
  },
  
  critical_thinking: {
    terms: [
      'critical thinking', 'critical-thinking', 'critically', 'critical',
      'strategic', 'strategy', 'strategically', 'strategic thinking',
      'analytical thinking', 'analytical mindset', 'analysis',
      'evaluated', 'evaluating', 'evaluation', 'assessed', 'assessing',
      'judgment', 'judgement', 'sound judgment', 'reasoned',
      'logical', 'logic', 'logical reasoning', 'evidence-based'
    ],
    patterns: [
      /\b(critical\s+thinking|strategic\s+thinking|analytical\s+thinking)\b/gi,
      /\b(evaluat|assess|judgment|logical)\w*\b/gi,
      /\b(evidence\s+based|reasoned)\b/gi
    ],
    weight: 1.1
  }
} as const;

type SoftSkillCategory = keyof typeof SOFT_SKILL_DEFINITIONS;

/**
 * Detect soft skills in text with confidence scoring
 */
export function detectSoftSkills(text: string): SoftSkillDetectionResult {
  if (!text || text.trim().length === 0) {
    return createEmptyResult();
  }
  
  const normalizedText = text.toLowerCase();
  const matchedSkills: SoftSkillMatch[] = [];
  
  // Detect each soft skill category
  Object.entries(SOFT_SKILL_DEFINITIONS).forEach(([category, definition]) => {
    const matches = detectSoftSkillCategory(normalizedText, category as SoftSkillCategory, definition);
    matchedSkills.push(...matches);
  });
  
  // Remove duplicates and sort by confidence
  const uniqueMatches = removeDuplicateMatches(matchedSkills);
  uniqueMatches.sort((a, b) => b.confidence - a.confidence);
  
  // Determine missing skills (categories not detected)
  const detectedCategories = new Set(uniqueMatches.map(m => m.category));
  const missingSkills = Object.keys(SOFT_SKILL_DEFINITIONS)
    .filter(cat => !detectedCategories.has(cat as SoftSkillCategory))
    .map(cat => formatCategoryName(cat as SoftSkillCategory));
  
  // Calculate overall confidence
  const confidence = calculateOverallConfidence(uniqueMatches, text.length);
  
  return {
    matchedSkills: uniqueMatches,
    missingSkills,
    confidence,
    totalSkills: uniqueMatches.length,
  };
}

/**
 * Detect skills for a specific category
 */
function detectSoftSkillCategory(
  text: string,
  category: SoftSkillCategory,
  definition: typeof SOFT_SKILL_DEFINITIONS[SoftSkillCategory]
): SoftSkillMatch[] {
  const matches: SoftSkillMatch[] = [];
  
  // Check exact term matches
  definition.terms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      const confidence = calculateTermConfidence(term, match[0], text);
      if (confidence >= 30) { // Minimum confidence threshold
        matches.push({
          skill: formatSkillName(term),
          confidence,
          matchedText: match[0],
          category,
          position: match.index,
        });
      }
    }
  });
  
  // Check pattern matches
  definition.patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const confidence = calculatePatternConfidence(match[0], text);
      if (confidence >= 25) { // Lower threshold for patterns
        matches.push({
          skill: inferSkillFromMatch(match[0], category),
          confidence,
          matchedText: match[0],
          category,
          position: match.index,
        });
      }
    }
  });
  
  return matches;
}

/**
 * Calculate confidence score for exact term matches
 */
function calculateTermConfidence(term: string, matchedText: string, fullText: string): number {
  let confidence = 70; // Base confidence for exact matches
  
  // Boost confidence for exact matches
  if (matchedText.toLowerCase() === term.toLowerCase()) {
    confidence += 20;
  }
  
  // Boost confidence for longer terms (more specific)
  if (term.length > 8) {
    confidence += 10;
  }
  
  // Boost confidence based on context (surrounding words)
  const contextBoost = getContextualConfidence(matchedText, fullText);
  confidence += contextBoost;
  
  return Math.min(100, confidence);
}

/**
 * Calculate confidence score for pattern matches
 */
function calculatePatternConfidence(matchedText: string, fullText: string): number {
  let confidence = 50; // Base confidence for patterns
  
  // Boost confidence for longer matches
  if (matchedText.length > 10) {
    confidence += 15;
  }
  
  // Boost confidence for compound terms
  if (matchedText.includes(' ')) {
    confidence += 10;
  }
  
  // Contextual confidence
  const contextBoost = getContextualConfidence(matchedText, fullText);
  confidence += contextBoost;
  
  return Math.min(100, confidence);
}

/**
 * Get contextual confidence based on surrounding text
 */
function getContextualConfidence(matchedText: string, fullText: string): number {
  const position = fullText.toLowerCase().indexOf(matchedText.toLowerCase());
  const contextStart = Math.max(0, position - 50);
  const contextEnd = Math.min(fullText.length, position + matchedText.length + 50);
  const context = fullText.substring(contextStart, contextEnd).toLowerCase();
  
  let boost = 0;
  
  // Boost if found in experience section
  if (context.includes('experience') || context.includes('work') || context.includes('project')) {
    boost += 10;
  }
  
  // Boost if found with action verbs
  const actionVerbs = ['managed', 'led', 'developed', 'created', 'implemented', 'coordinated', 'achieved'];
  if (actionVerbs.some(verb => context.includes(verb))) {
    boost += 5;
  }
  
  // Boost if found with quantifiable results
  if (/\d+%|\d+\s+(year|month|week|day)/.test(context)) {
    boost += 5;
  }
  
  return boost;
}

/**
 * Infer skill name from pattern match
 */
function inferSkillFromMatch(matchedText: string, category: SoftSkillCategory): string {
  // Try to normalize the matched text to a standard skill name
  const normalized = matchedText.toLowerCase().trim();
  
  // Common normalizations
  const normalizations: Record<string, string> = {
    'communicating': 'communication',
    'communicated': 'communication',
    'leading': 'leadership',
    'led': 'leadership',
    'managing': 'management',
    'managed': 'management',
    'collaborating': 'collaboration',
    'collaborated': 'collaboration',
    'solving': 'problem solving',
    'solved': 'problem solving',
    'adapting': 'adaptability',
    'adapted': 'adaptability',
    'creating': 'creativity',
    'created': 'creativity',
    'innovating': 'innovation',
    'innovated': 'innovation',
  };
  
  return normalizations[normalized] || formatCategoryName(category);
}

/**
 * Remove duplicate matches (same skill category)
 */
function removeDuplicateMatches(matches: SoftSkillMatch[]): SoftSkillMatch[] {
  const seen = new Set<string>();
  const unique: SoftSkillMatch[] = [];
  
  matches.forEach(match => {
    const key = `${match.category}_${match.skill}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(match);
    }
  });
  
  return unique;
}

/**
 * Calculate overall confidence in detection
 */
function calculateOverallConfidence(matches: SoftSkillMatch[], textLength: number): number {
  if (matches.length === 0) return 0;
  
  // Average confidence of all matches
  const averageConfidence = matches.reduce((sum, match) => sum + match.confidence, 0) / matches.length;
  
  // Boost confidence if multiple skills detected
  const multipleSkillBoost = Math.min(20, matches.length * 5);
  
  // Reduce confidence if text is very short (less reliable)
  const textLengthPenalty = textLength < 100 ? 20 : 0;
  
  return Math.min(100, Math.max(0, averageConfidence + multipleSkillBoost - textLengthPenalty));
}

/**
 * Format skill name for display
 */
function formatSkillName(skill: string): string {
  return skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();
}

/**
 * Format category name for display
 */
function formatCategoryName(category: SoftSkillCategory): string {
  return category.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

/**
 * Create empty result
 */
function createEmptyResult(): SoftSkillDetectionResult {
  return {
    matchedSkills: [],
    missingSkills: Object.keys(SOFT_SKILL_DEFINITIONS).map(cat => formatCategoryName(cat as SoftSkillCategory)),
    confidence: 0,
    totalSkills: 0,
  };
}

/**
 * Validate soft skill detection results
 */
export function validateSoftSkillDetection(result: SoftSkillDetectionResult): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check confidence scores
  result.matchedSkills.forEach((match, index) => {
    if (match.confidence < 0 || match.confidence > 100) {
      issues.push(`Invalid confidence at index ${index}: ${match.confidence}`);
    }
    
    if (match.position < 0) {
      issues.push(`Invalid position at index ${index}: ${match.position}`);
    }
  });
  
  // Check overall confidence
  if (result.confidence < 0 || result.confidence > 100) {
    issues.push(`Invalid overall confidence: ${result.confidence}`);
  }
  
  // Check for duplicates
  const skillCategories = new Set(result.matchedSkills.map(m => m.category));
  if (skillCategories.size !== result.matchedSkills.length) {
    issues.push('Duplicate skill categories detected');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
}
