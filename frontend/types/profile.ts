export interface Profile {
  id: number;
  user_id: number;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  summary: string | null;
  location: string | null; // City, Country
  linkedin_url: string | null;
  github_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: number;
  user_id: number;
  skill_name: string;
  category: string | null;
  created_at: string;
}

export interface Education {
  id: number;
  user_id: number;
  institution: string | null;
  degree: string | null;
  field_of_study: string | null;
  start_date: string | null; // YYYY-MM format
  end_date: string | null; // YYYY-MM format or null for ongoing
  is_current: boolean; // Flag for ongoing education
  description: string | null;
}

export interface Experience {
  id: number;
  user_id: number;
  company: string | null;
  job_title: string | null;
  start_date: string | null; // YYYY-MM format
  end_date: string | null; // YYYY-MM format or null for ongoing
  is_current: boolean; // Flag for ongoing role
  description: string | null;
}

export interface Project {
  id: number;
  user_id: number;
  project_name: string | null;
  description: string | null;
  technologies: string[] | null;
}

export interface FullProfile {
  profile: Profile | null;
  skills: Skill[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
}

export interface ProfileUpdatePayload {
  profile?: {
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    summary?: string | null;
    location?: string | null; // City, Country
    linkedin_url?: string | null;
    github_url?: string | null;
  };
  skills?: { skill_name: string; category?: string | null }[];
  education?: {
    institution?: string | null;
    degree?: string | null;
    field_of_study?: string | null;
    start_date?: string | null; // YYYY-MM format
    end_date?: string | null; // YYYY-MM format or null for ongoing
    is_current?: boolean;
    description?: string | null;
  }[];
  experience?: {
    company?: string | null;
    job_title?: string | null;
    start_date?: string | null; // YYYY-MM format
    end_date?: string | null; // YYYY-MM format or null for ongoing
    is_current?: boolean;
    description?: string | null;
  }[];
  projects?: {
    project_name?: string | null;
    description?: string | null;
    technologies?: string[] | null;
  }[];
}
