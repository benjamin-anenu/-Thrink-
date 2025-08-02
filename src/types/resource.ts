
export interface Resource {
  id: string;
  workspace_id: string;
  name: string;
  email?: string;
  role?: string;
  department?: string;
  phone?: string;
  location?: string;
  availability?: number;
  employment_type?: string;
  seniority_level?: string;
  mentorship_capacity?: boolean;
  notes?: string;
  hourly_rate?: number;
  created_at: string;
  updated_at: string;
}
