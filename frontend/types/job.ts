export interface JobDescription {
  id: string;
  user_id: number;
  title: string;
  company: string | null;
  location: string | null;
  employment_type: string | null;
  experience_level: string | null;
  work_mode: string | null;
  salary_range: string | null;
  tech_stack: string[] | null;
  description_text: string;
  word_count: number | null;
  keywords: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface JobDescriptionCreate {
  title: string;
  company?: string;
  location?: string;
  employment_type?: string;
  experience_level?: string;
  work_mode?: string;
  salary_range?: string;
  tech_stack?: string[];
  description_text: string;
}

