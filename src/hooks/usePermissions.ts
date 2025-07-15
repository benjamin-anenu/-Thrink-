import { useAuth } from '@/contexts/AuthContext'
import { AppRole } from '@/types/auth'

export function usePermissions() {
  const { role, hasRole, hasPermission } = useAuth()

  return {
    role,
    hasRole,
    hasPermission,
    canRead: (resource: string) => hasPermission('read', resource),
    canWrite: (resource: string) => hasPermission('write', resource),
    canDelete: (resource: string) => hasPermission('delete', resource),
    canManageUsers: () => hasRole('admin') || hasRole('owner'),
    canManageSettings: () => hasRole('admin') || hasRole('owner'),
    canViewAuditLogs: () => hasRole('admin') || hasRole('owner'),
    isOwner: () => role === 'owner',
    isAdmin: () => hasRole('admin'),
    isManager: () => hasRole('manager'),
    isMember: () => role === 'member',
    isViewer: () => role === 'viewer',
  }
}