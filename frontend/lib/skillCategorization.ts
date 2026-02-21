export type SkillCategory = 
  | 'core_technical'
  | 'backend' 
  | 'frontend'
  | 'database'
  | 'devops'
  | 'ai_ml'
  | 'soft_skills'
  | 'bonus_skills';

export interface CategorizedSkill {
  skill: string;
  category: SkillCategory;
  priority: 'critical' | 'important' | 'nice_to_have';
}

export interface SkillCategoryWeights {
  core_technical: number;
  backend: number;
  frontend: number;
  database: number;
  devops: number;
  ai_ml: number;
  soft_skills: number;
  bonus_skills: number;
}

export const DEFAULT_CATEGORY_WEIGHTS: SkillCategoryWeights = {
  core_technical: 0.40,
  backend: 0.20,
  frontend: 0.20,
  database: 0.10,
  devops: 0.05,
  ai_ml: 0.02,
  soft_skills: 0.03,
  bonus_skills: 0.00 // Bonus skills have 0 direct weight, only count as differentiators
};

// Semantic normalization mappings
export const SEMANTIC_NORMALIZATIONS: Record<string, string[]> = {
  'REST API': ['REST APIs', 'RESTful API', 'RESTful', 'REST'],
  'PostgreSQL': ['Postgres', 'PostgreSQL'],
  'Node.js': ['Node', 'NodeJS', 'Node.js'],
  'React.js': ['React', 'React.js', 'ReactJS'],
  'JWT Authentication': ['JWT', 'JWT Auth', 'JSON Web Token'],
  'TypeScript': ['TS', 'TypeScript', 'Typescript'],
  'JavaScript': ['JS', 'JavaScript', 'Javascript'],
  'Python': ['Python', 'Py'],
  'Docker': ['Docker', 'Docker Containers'],
  'Kubernetes': ['K8s', 'Kubernetes', 'K8S'],
  'AWS': ['Amazon Web Services', 'AWS', 'Amazon Cloud'],
  'Azure': ['Microsoft Azure', 'Azure', 'MS Azure'],
  'Google Cloud': ['GCP', 'Google Cloud Platform', 'Google Cloud'],
  'MongoDB': ['Mongo', 'MongoDB'],
  'MySQL': ['MySQL', 'My SQL'],
  'Redis': ['Redis', 'Redis Cache'],
  'GraphQL': ['GraphQL', 'Graph QL'],
  'Git': ['Git', 'Git Version Control'],
  'CI/CD': ['Continuous Integration', 'Continuous Deployment', 'CI/CD Pipeline'],
  'Microservices': ['Microservices', 'Micro-service Architecture'],
  'Machine Learning': ['ML', 'Machine Learning'],
  'Deep Learning': ['DL', 'Deep Learning'],
  'Data Science': ['Data Science', 'DS'],
  'Agile': ['Agile', 'Agile Methodology', 'Scrum'],
  'Leadership': ['Leadership', 'Team Leadership', 'Lead'],
  'Communication': ['Communication', 'Communication Skills', 'Verbal Communication'],
};

// Skill categorization rules
export const SKILL_CATEGORIES: Record<SkillCategory, { skills: string[]; priority: 'critical' | 'important' | 'nice_to_have' }> = {
  core_technical: {
    skills: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP'],
    priority: 'critical'
  },
  backend: {
    skills: ['Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'Ruby on Rails', 'Laravel', 'ASP.NET', 'FastAPI'],
    priority: 'important'
  },
  frontend: {
    skills: ['React.js', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap', 'jQuery'],
    priority: 'important'
  },
  database: {
    skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'Elasticsearch'],
    priority: 'important'
  },
  devops: {
    skills: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'CI/CD', 'Jenkins', 'GitHub Actions', 'Terraform', 'Ansible'],
    priority: 'important'
  },
  ai_ml: {
    skills: ['Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Data Science', 'NLP', 'Computer Vision'],
    priority: 'nice_to_have'
  },
  soft_skills: {
    skills: ['Leadership', 'Communication', 'Teamwork', 'Problem Solving', 'Time Management', 'Critical Thinking', 'Adaptability', 'Creativity'],
    priority: 'important'
  },
  bonus_skills: {
    skills: ['Blockchain', 'Web3', 'Mobile Development', 'Game Development', 'IoT', 'Cybersecurity', 'UI/UX Design', 'Project Management'],
    priority: 'nice_to_have'
  }
};

export function normalizeSkill(skill: string): string {
  const normalizedSkill = skill.trim().toLowerCase();
  
  for (const [canonical, variants] of Object.entries(SEMANTIC_NORMALIZATIONS)) {
    if (variants.some(variant => variant.toLowerCase() === normalizedSkill)) {
      return canonical;
    }
  }
  
  return skill;
}

export function categorizeSkill(skill: string): CategorizedSkill {
  const normalizedSkill = normalizeSkill(skill);
  
  for (const [category, config] of Object.entries(SKILL_CATEGORIES)) {
    if (config.skills.some(s => normalizeSkill(s) === normalizedSkill)) {
      return {
        skill: normalizedSkill,
        category: category as SkillCategory,
        priority: config.priority
      };
    }
  }
  
  // Default categorization for unknown skills
  return {
    skill: normalizedSkill,
    category: 'bonus_skills',
    priority: 'nice_to_have'
  };
}

export function categorizeSkills(skills: string[]): CategorizedSkill[] {
  return skills.map(skill => categorizeSkill(skill));
}

export function calculateWeightedScore(
  categorizedSkills: CategorizedSkill[],
  matchedSkills: string[],
  weights: SkillCategoryWeights = DEFAULT_CATEGORY_WEIGHTS
): {
  totalScore: number;
  categoryScores: Record<SkillCategory, number>;
  breakdown: Record<SkillCategory, { matched: number; total: number; weightedScore: number }>;
  preferredSkillImpact: number;
  bonusSkillDifferentiator: number;
} {
  const matchedSet = new Set(matchedSkills.map(normalizeSkill));
  
  const categoryScores: Record<SkillCategory, number> = {} as Record<SkillCategory, number>;
  const breakdown: Record<SkillCategory, { matched: number; total: number; weightedScore: number }> = {} as Record<SkillCategory, { matched: number; total: number; weightedScore: number }>;
  
  let totalWeightedScore = 0;
  let preferredSkillImpact = 0;
  let bonusSkillDifferentiator = 0;
  
  // Group skills by category
  const skillsByCategory: Record<SkillCategory, CategorizedSkill[]> = {} as Record<SkillCategory, CategorizedSkill[]>;
  
  categorizedSkills.forEach(skill => {
    if (!skillsByCategory[skill.category]) {
      skillsByCategory[skill.category] = [];
    }
    skillsByCategory[skill.category].push(skill);
  });
  
  // Calculate scores for each category
  Object.entries(skillsByCategory).forEach(([category, skills]) => {
    const categoryKey = category as SkillCategory;
    const totalSkills = skills.length;
    const matchedSkillsInCategory = skills.filter(skill => 
      matchedSet.has(normalizeSkill(skill.skill))
    ).length;
    
    const categoryMatchRatio = totalSkills > 0 ? matchedSkillsInCategory / totalSkills : 0;
    
    // Apply different weight logic for preferred vs bonus skills
    let categoryWeight = weights[categoryKey];
    if (categoryKey === 'bonus_skills') {
      // Bonus skills don't contribute to core score, only as differentiators
      categoryWeight = 0;
      bonusSkillDifferentiator = categoryMatchRatio; // How many bonus skills you have
    } else {
      // Cap preferred skills at 60% max impact
      const maxImpact = 0.60;
      categoryWeight = Math.min(weights[categoryKey], maxImpact);
      preferredSkillImpact += categoryMatchRatio * categoryWeight;
    }
    
    const weightedScore = categoryMatchRatio * categoryWeight;
    
    categoryScores[categoryKey] = categoryMatchRatio;
    breakdown[categoryKey] = {
      matched: matchedSkillsInCategory,
      total: totalSkills,
      weightedScore
    };
    
    totalWeightedScore += weightedScore;
  });
  
  return {
    totalScore: Math.min(totalWeightedScore + preferredSkillImpact, 1), // Cap at 1.0
    categoryScores,
    breakdown,
    preferredSkillImpact: Math.round(preferredSkillImpact * 100),
    bonusSkillDifferentiator: Math.round(bonusSkillDifferentiator * 100)
  };
}
