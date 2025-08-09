
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  ownerId: string;
  members: WorkspaceMember[];
  settings: WorkspaceSettings;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: string;
  status: 'active' | 'pending' | 'inactive';
}

export interface WorkspaceSettings {
  allowGuestAccess: boolean;
  defaultProjectVisibility: 'private' | 'workspace' | 'public';
  currency?: string;
  timeZone?: string;
  notificationSettings: WorkspaceNotificationSettings;
}

export interface WorkspaceNotificationSettings {
  emailNotifications: boolean;
  projectUpdates: boolean;
  taskAssignments: boolean;
  deadlineReminders: boolean;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired';
}
