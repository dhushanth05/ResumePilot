import { normalizeSkill, categorizeSkill, type CategorizedSkill } from './skillCategorization';

export interface ProjectExperience {
  name: string;
  description: string;
  technologies: string[];
  duration?: string;
  role?: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  duration: string;
  description: string;
  technologies: string[];
}

export interface ExperienceRelevanceResult {
  score: number;
  stackOverlapRatio: number;
  projectAlignment: number;
  internshipAlignment: number;
  breakdown: {
    overlappingTechnologies: number;
    totalJobTechnologies: number;
    coreStackProjects: number;
    totalProjects: number;
    internshipMatches: number;
    totalInternships: number;
  };
}

export function calculateExperienceRelevance(
  workExperiences: WorkExperience[],
  projects: ProjectExperience[],
  jobSkills: string[],
  jobDescription: string
): ExperienceRelevanceResult {
  const jobTechSet = new Set(jobSkills.map(normalizeSkill));
  
  // Extract technologies from experiences and projects
  const allTechnologies = [
    ...workExperiences.flatMap(exp => exp.technologies),
    ...projects.flatMap(proj => proj.technologies)
  ].map(normalizeSkill);
  
  const resumeTechSet = new Set(allTechnologies);
  
  // Calculate stack overlap ratio (60% weight)
  const overlappingTechnologies = Array.from(resumeTechSet).filter(tech => jobTechSet.has(tech)).length;
  const totalJobTechnologies = jobTechSet.size;
  const stackOverlapRatio = totalJobTechnologies > 0 ? overlappingTechnologies / totalJobTechnologies : 0;
  
  // Calculate project alignment with core stack (25% weight)
  const coreJobSkills = jobSkills.filter(skill => {
    const categorized = categorizeSkill(skill);
    return categorized.category === 'core_technical' || categorized.category === 'backend' || categorized.category === 'frontend';
  });
  
  const coreJobTechSet = new Set(coreJobSkills.map(normalizeSkill));
  const coreStackProjects = projects.filter(project => {
    const projectTechs = project.technologies.map(normalizeSkill);
    const overlap = projectTechs.filter(tech => coreJobTechSet.has(tech)).length;
    return overlap >= 2; // At least 2 core technologies
  }).length;
  
  const projectAlignment = projects.length > 0 ? coreStackProjects / projects.length : 0;
  
  // Calculate internship alignment with role (15% weight)
  const internships = workExperiences.filter(exp => 
    exp.position.toLowerCase().includes('intern') || 
    exp.position.toLowerCase().includes('trainee') ||
    exp.company.toLowerCase().includes('intern')
  );
  
  const internshipMatches = internships.filter(internship => {
    const internshipTechs = internship.technologies.map(normalizeSkill);
    const overlap = internshipTechs.filter(tech => jobTechSet.has(tech)).length;
    return overlap >= 1;
  }).length;
  
  const internshipAlignment = internships.length > 0 ? internshipMatches / internships.length : 0;
  
  // Calculate weighted experience relevance score
  const experienceScore = (
    stackOverlapRatio * 0.60 +
    projectAlignment * 0.25 +
    internshipAlignment * 0.15
  );
  
  return {
    score: Math.min(experienceScore, 1),
    stackOverlapRatio: Math.round(stackOverlapRatio * 100),
    projectAlignment: Math.round(projectAlignment * 100),
    internshipAlignment: Math.round(internshipAlignment * 100),
    breakdown: {
      overlappingTechnologies,
      totalJobTechnologies,
      coreStackProjects,
      totalProjects: projects.length,
      internshipMatches,
      totalInternships: internships.length
    }
  };
}

export function extractExperienceFromText(resumeText: string): {
  workExperiences: WorkExperience[];
  projects: ProjectExperience[];
} {
  // This is a simplified extraction - in production, you'd use more sophisticated NLP
  const lines = resumeText.split('\n').filter(line => line.trim());
  
  const workExperiences: WorkExperience[] = [];
  const projects: ProjectExperience[] = [];
  
  let currentSection = '';
  let currentExperience: Partial<WorkExperience> | null = null;
  let currentProject: Partial<ProjectExperience> | null = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Detect section headers
    if (trimmedLine.toLowerCase().includes('experience') || trimmedLine.toLowerCase().includes('work')) {
      currentSection = 'experience';
      continue;
    }
    
    if (trimmedLine.toLowerCase().includes('project')) {
      currentSection = 'projects';
      continue;
    }
    
    // Simple extraction patterns (would need enhancement for production)
    if (currentSection === 'experience') {
      const companyMatch = trimmedLine.match(/^([A-Za-z0-9\s&]+)\s*[-–]\s*(.+)$/);
      if (companyMatch) {
        if (currentExperience) {
          workExperiences.push({
            company: currentExperience.company || '',
            position: currentExperience.position || '',
            duration: currentExperience.duration || '',
            description: currentExperience.description || '',
            technologies: []
          });
        }
        
        currentExperience = {
          company: companyMatch[1].trim(),
          position: companyMatch[2].trim(),
          description: '',
          technologies: []
        };
        continue;
      }
      
      if (currentExperience && trimmedLine.includes('|')) {
        const parts = trimmedLine.split('|');
        if (parts.length >= 2) {
          currentExperience.duration = parts[0].trim();
          currentExperience.position = parts[1].trim();
        }
        continue;
      }
      
      if (currentExperience && trimmedLine) {
        currentExperience.description = (currentExperience.description || '') + trimmedLine + ' ';
        
        // Extract technologies from description
        const techPattern = /\b(React|Node\.js|Python|JavaScript|TypeScript|AWS|Docker|MongoDB|PostgreSQL|MySQL|Redis|GraphQL|REST API|Git|CI\/CD|Kubernetes)\b/gi;
        const matches = trimmedLine.match(techPattern);
        if (matches) {
          currentExperience.technologies = [...(currentExperience.technologies || []), ...matches];
        }
      }
    }
    
    if (currentSection === 'projects') {
      const projectMatch = trimmedLine.match(/^([A-Za-z0-9\s_-]+)\s*[-–]\s*(.+)$/);
      if (projectMatch) {
        if (currentProject) {
          projects.push({
            name: currentProject.name || '',
            description: currentProject.description || '',
            technologies: currentProject.technologies || []
          });
        }
        
        currentProject = {
          name: projectMatch[1].trim(),
          description: projectMatch[2].trim(),
          technologies: []
        };
        continue;
      }
      
      if (currentProject && trimmedLine) {
        currentProject.description = (currentProject.description || '') + trimmedLine + ' ';
        
        // Extract technologies from description
        const techPattern = /\b(React|Node\.js|Python|JavaScript|TypeScript|AWS|Docker|MongoDB|PostgreSQL|MySQL|Redis|GraphQL|REST API|Git|CI\/CD|Kubernetes)\b/gi;
        const matches = trimmedLine.match(techPattern);
        if (matches) {
          currentProject.technologies = [...(currentProject.technologies || []), ...matches];
        }
      }
    }
  }
  
  // Add the last experience/project if exists
  if (currentExperience) {
    workExperiences.push({
      company: currentExperience.company || '',
      position: currentExperience.position || '',
      duration: currentExperience.duration || '',
      description: currentExperience.description || '',
      technologies: currentExperience.technologies || []
    });
  }
  
  if (currentProject) {
    projects.push({
      name: currentProject.name || '',
      description: currentProject.description || '',
      technologies: currentProject.technologies || []
    });
  }
  
  return { workExperiences, projects };
}
