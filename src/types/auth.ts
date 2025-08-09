
import { User, Session } from '@supabase/supabase-js'

export type AppRole = 'owner' | 'admin' | 'member' | 'viewer'
export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface Profile {
  id: string
  user_id: string
  email: string
  full_name?: string
  avatar_url?: string
  company_name?: string
  job_title?: string
  phone?: string
  timezone?: string
  email_notifications: boolean
  marketing_emails: boolean
  created_at: string
  updated_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role: AppRole
  is_system_owner?: boolean
  created_at: string
  created_by?: string
}

export interface AdminPermission {
  id: string
  user_id: string
  permission_type: string
  permission_scope?: string
  granted_by?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserPermissionsContext {
  is_system_owner: boolean
  system_role: AppRole | null
  admin_permissions: AdminPermission[]
  workspace_memberships: WorkspaceMembership[]
}

export interface WorkspaceMembership {
  workspace_id: string
  role: WorkspaceRole
  status: 'active' | 'pending' | 'inactive'
}

export interface AuditLog {
  id: string
  user_id?: string
  action: string
  resource_type?: string
  resource_id?: string
  ip_address?: string
  user_agent?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  isSystemOwner: boolean
  isFirstUser: boolean
  loading: boolean
  permissionsContext: UserPermissionsContext | null
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
  refreshAuth: () => Promise<void>
  // Authorization methods - moved to usePermissions hook
  hasSystemRole: (requiredRole: AppRole) => boolean
  hasWorkspaceRole: (workspaceId: string, requiredRole: WorkspaceRole) => boolean
  hasAdminPermission: (permissionType: string, scope?: string) => boolean
}

export interface AuthError {
  message: string
  code?: string
  details?: any
}

export interface SignUpData {
  email: string
  password: string
  fullName?: string
  companyName?: string
  jobTitle?: string
}

export const SYSTEM_ROLE_HIERARCHY: Record<AppRole, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
}

export const WORKSPACE_ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
}

export const ADMIN_PERMISSION_TYPES = {
  WORKSPACE_ACCESS: 'workspace_access',
  USER_MANAGEMENT: 'user_management',
  SYSTEM_SETTINGS: 'system_settings',
  AUDIT_LOGS: 'audit_logs',
  BILLING: 'billing',
} as const

export type AdminPermissionType = typeof ADMIN_PERMISSION_TYPES[keyof typeof ADMIN_PERMISSION_TYPES]
