import { useAuth } from '@/contexts/AuthContext'
import { AppRole } from '@/types/auth'

export interface PermissionHook {
  hasRole: (requiredRole: AppRole) => boolean
  hasPermission: (action: string, resource?: string) => boolean
  canAccess: (resource: string, action?: string) => boolean
  isOwner: boolean
  isAdmin: boolean
  isManager: boolean
  isMember: boolean
  isViewer: boolean
}

export function usePermissions(): PermissionHook {
  const { role, hasRole, hasPermission } = useAuth()

  const canAccess = (resource: string, action: string = 'read'): boolean => {
    return hasPermission(action, resource)
  }

  return {
    hasRole,
    hasPermission,
    canAccess,
    isOwner: hasRole('owner'),
    isAdmin: hasRole('admin'),
    isManager: hasRole('manager'),
    isMember: hasRole('member'),
    isViewer: hasRole('viewer'),
  }
}