export interface Resource {
  id: string;
  workspace_id: string;
  name: string;
  email: string;
  role: string;
  type: 'human' | 'ai' | 'external';
  status: 'active' | 'inactive' | 'pending';
  skills: string[];
  availability: string;
  cost: number;
  created_at: string;
  updated_at: string;
} 