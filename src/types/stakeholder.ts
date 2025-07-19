
export interface Stakeholder {
  id: string;
  workspace_id: string;
  workspaceId?: string; // Optional for compatibility
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  communicationPreference: 'Email' | 'Phone' | 'Slack' | 'In-person';
  projects: string[];
  influence: 'low' | 'medium' | 'high' | 'critical';
  interest: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'pending';
  notes?: string;
  created_at: string;
  updated_at: string;
  lastContact?: string; // Add missing property
  organization?: string;
  influenceLevel?: string;
  escalationLevel?: number;
  contactInfo?: any;
}
