export interface Stakeholder {
  id: string;
  workspace_id: string;
  name: string;
  email: string;
  role: string;
  influence: 'low' | 'medium' | 'high' | 'critical';
  interest: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'pending';
  notes?: string;
  created_at: string;
  updated_at: string;
} 