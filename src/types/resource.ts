
export interface Resource {
  id: string;
  workspace_id: string;
  name: string;
  email?: string;
  role?: string;
  department?: string;
  hourly_rate?: number;
  phone?: string;
  location?: string;
  availability?: string;
  employment_type?: string;
  seniority_level?: string;
  mentorship_capacity?: boolean;
  notes?: string;
  // Legacy fields for compatibility
  type?: 'human' | 'ai' | 'external';
  status?: 'active' | 'inactive' | 'pending';
  skills?: string[];
  cost?: number;
  utilization?: number;
  created_at: string;
  updated_at: string;
}
