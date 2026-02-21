export interface Resume {
  id: string;
  user_id: number;
  title: string;
  file_path: string;
  extracted_text: string | null;
  created_at: string;
}

export interface ResumeListItem {
  id: string;
  title: string;
  filename: string;
  created_at: string;
}

