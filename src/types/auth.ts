
import { User, Session } from '@supabase/supabase-js'

export type AppRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer'

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
  workspace_id?: string
  is_system_owner?: boolean
  created_at: string
  created_by?: string
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
  role: AppRole | null
  isSystemOwner: boolean
  isFirstUser: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>
  hasRole: (requiredRole: AppRole) => boolean
  hasPermission: (action: string, resource?: string) => boolean
  refreshProfile: () => Promise<void>
  refreshAuth: () => Promise<void>
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

export const ROLE_HIERARCHY: Record<AppRole, number> = {
  owner: 5,
  admin: 4,
  manager: 3,
  member: 2,
  viewer: 1,
}

export const ROLE_PERMISSIONS: Record<AppRole, string[]> = {
  owner: ['*'],
  admin: [
    'users:read',
    'users:write',
    'users:delete',
    'projects:read',
    'projects:write',
    'projects:delete',
    'settings:read',
    'settings:write',
    'audit:read',
  ],
  manager: [
    'users:read',
    'projects:read',
    'projects:write',
    'settings:read',
  ],
  member: [
    'projects:read',
    'projects:write',
  ],
  viewer: [
    'projects:read',
  ],
}
