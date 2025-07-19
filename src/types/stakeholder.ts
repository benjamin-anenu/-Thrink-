
export interface Stakeholder {
  id: string;
  workspace_id: string;
  name: string;
  email: string;
  role?: string;
  department?: string;
  phone?: string;
  communication_preference?: 'Email' | 'Phone' | 'Slack' | 'In-person';
  projects?: string[];
  influence?: 'low' | 'medium' | 'high' | 'critical';
  interest?: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
  avatar?: string;
  organization?: string;
  created_at?: string;
  updated_at?: string;
}
