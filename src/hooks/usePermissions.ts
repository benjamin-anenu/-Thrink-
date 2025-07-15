
import { useAuth } from '@/contexts/AuthContext'

export interface PermissionHook {
  hasRole: (requiredRole: string) => boolean
  hasPermission: (action: string, resource?: string) => boolean
  canAccess: (resource: string, action?: string) => boolean
  isOwner: boolean
  isAdmin: boolean
  isManager: boolean
  isMember: boolean
  isViewer: boolean
}

export function usePermissions(): PermissionHook {
  const { user } = useAuth()

  // Simplified permissions - for now, all authenticated users have basic access
  const hasRole = (requiredRole: string): boolean => {
    return !!user // All authenticated users have access for now
  }

  const hasPermission = (action: string, resource?: string): boolean => {
    return !!user // All authenticated users have permission for now
  }

  const canAccess = (resource: string, action: string = 'read'): boolean => {
    return !!user
  }

  return {
    hasRole,
    hasPermission,
    canAccess,
    isOwner: !!user,
    isAdmin: !!user,
    isManager: !!user,
    isMember: !!user,
    isViewer: !!user,
  }
}
