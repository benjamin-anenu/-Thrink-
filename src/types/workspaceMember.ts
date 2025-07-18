export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at: string;
  status: 'active' | 'pending' | 'inactive';
  created_at: string;
  updated_at: string;
} 