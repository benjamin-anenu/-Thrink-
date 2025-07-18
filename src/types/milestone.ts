export interface Milestone {
  id: string;
  project_id: string;
  name: string;
  description: string;
  date: string;
  baseline_date: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'overdue';
  created_at: string;
  updated_at: string;
} 