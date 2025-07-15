export interface Workspace {
  id: string;
  name: string;
  description?: string;
  slug: string;
  owner_id: string;
  settings: any;
  subscription_tier: string;
  max_members: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  invited_by?: string;
  joined_at?: string;
  status: 'active' | 'pending' | 'inactive' | 'suspended';
  permissions: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceInvitation {
  id: string;
  workspace_id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  invited_by: string;
  invitation_token: string;
  expires_at: string;
  accepted_at?: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  metadata: Record<string, any>;
  created_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_id: string;
  workspace_id?: string;
  ip_address?: string;
  user_agent?: string;
  device_info?: Record<string, any>;
  login_method: 'email' | 'sso' | 'oauth';
  is_active: boolean;
  last_activity: string;
  expires_at?: string;
  created_at: string;
  ended_at?: string;
}

export interface ComplianceLog {
  id: string;
  workspace_id?: string;
  user_id?: string;
  event_type: string;
  event_category: 'data_access' | 'data_modification' | 'user_management' | 'security' | 'compliance';
  resource_type?: string;
  resource_id?: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  metadata: Record<string, any>;
  retention_period: number;
  created_at: string;
}

export interface DataProcessingActivity {
  id: string;
  workspace_id: string;
  activity_name: string;
  purpose: string;
  legal_basis: string;
  data_categories: string[];
  data_subjects: string[];
  recipients?: string[];
  retention_period?: number;
  cross_border_transfers: boolean;
  safeguards?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvitationFormData {
  email: string;
  role: 'admin' | 'member' | 'viewer';
  message?: string;
}

export interface WorkspaceCreateData {
  name: string;
  description?: string;
  slug?: string;
}

export interface SessionTrackingData {
  sessionId: string;
  workspaceId?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: Record<string, any>;
}