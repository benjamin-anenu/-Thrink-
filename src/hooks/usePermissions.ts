import { useAuth } from '@/contexts/AuthContext'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { AppRole, WorkspaceRole, ADMIN_PERMISSION_TYPES } from '@/types/auth'

export function usePermissions() {
  const { isSystemOwner, hasSystemRole, hasWorkspaceRole, hasAdminPermission, permissionsContext } = useAuth()
  const { currentWorkspace } = useWorkspace()

  // System-level permissions
  const isOwner = () => isSystemOwner
  const isSystemAdmin = () => hasSystemRole('admin')
  const isSystemMember = () => hasSystemRole('member')
  const isSystemViewer = () => hasSystemRole('viewer')

  // Workspace-level permissions  
  const isWorkspaceOwner = (workspaceId?: string) => {
    const wsId = workspaceId || currentWorkspace?.id
    return wsId ? hasWorkspaceRole(wsId, 'owner') : false
  }

  const isWorkspaceAdmin = (workspaceId?: string) => {
    const wsId = workspaceId || currentWorkspace?.id
    return wsId ? hasWorkspaceRole(wsId, 'admin') : false
  }

  const isWorkspaceMember = (workspaceId?: string) => {
    const wsId = workspaceId || currentWorkspace?.id
    return wsId ? hasWorkspaceRole(wsId, 'member') : false
  }

  const isWorkspaceViewer = (workspaceId?: string) => {
    const wsId = workspaceId || currentWorkspace?.id
    return wsId ? hasWorkspaceRole(wsId, 'viewer') : false
  }

  // Admin permissions
  const canManageUsers = () => 
    isSystemOwner || hasAdminPermission(ADMIN_PERMISSION_TYPES.USER_MANAGEMENT)

  const canManageSystemSettings = () => 
    isSystemOwner || hasAdminPermission(ADMIN_PERMISSION_TYPES.SYSTEM_SETTINGS)

  const canViewAuditLogs = () => 
    isSystemOwner || hasAdminPermission(ADMIN_PERMISSION_TYPES.AUDIT_LOGS)

  const canAccessWorkspace = (workspaceId: string) => 
    isSystemOwner || 
    hasAdminPermission(ADMIN_PERMISSION_TYPES.WORKSPACE_ACCESS, workspaceId) ||
    hasWorkspaceRole(workspaceId, 'viewer')

  const canCreateWorkspace = () => 
    isSystemOwner || hasAdminPermission(ADMIN_PERMISSION_TYPES.USER_MANAGEMENT)

  // Context-aware permissions for current workspace
  const canManageCurrentWorkspace = () => 
    currentWorkspace ? (isWorkspaceOwner() || isWorkspaceAdmin()) : false

  const canViewCurrentWorkspace = () => 
    currentWorkspace ? (isWorkspaceMember() || isWorkspaceViewer()) : false

  const canInviteToCurrentWorkspace = () => 
    currentWorkspace ? (isWorkspaceOwner() || isWorkspaceAdmin()) : false

  // Legacy compatibility methods
  const hasRole = (requiredRole: AppRole | WorkspaceRole) => {
    // Check system role first
    if (hasSystemRole(requiredRole as AppRole)) return true
    
    // Then check workspace role if in workspace context
    if (currentWorkspace) {
      return hasWorkspaceRole(currentWorkspace.id, requiredRole as WorkspaceRole)
    }
    
    return false
  }

  const canRead = (resource: string) => {
    if (isSystemOwner) return true
    if (resource === 'workspace' && currentWorkspace) return canViewCurrentWorkspace()
    return hasSystemRole('viewer')
  }

  const canWrite = (resource: string) => {
    if (isSystemOwner) return true
    if (resource === 'workspace' && currentWorkspace) return canManageCurrentWorkspace()
    return hasSystemRole('member')
  }

  const canDelete = (resource: string) => {
    if (isSystemOwner) return true
    if (resource === 'workspace' && currentWorkspace) return isWorkspaceOwner()
    return hasSystemRole('admin')
  }

  // Get user's effective role for display
  const getEffectiveRole = (): string => {
    if (isSystemOwner) return 'System Owner'
    if (currentWorkspace) {
      const membership = permissionsContext?.workspace_memberships.find(
        m => m.workspace_id === currentWorkspace.id && m.status === 'active'
      )
      if (membership) {
        return `Workspace ${membership.role.charAt(0).toUpperCase() + membership.role.slice(1)}`
      }
    }
    return permissionsContext?.system_role || 'User'
  }

  return {
    // System permissions
    isOwner,
    isSystemAdmin,
    isSystemMember,
    isSystemViewer,
    
    // Workspace permissions
    isWorkspaceOwner,
    isWorkspaceAdmin,
    isWorkspaceMember, 
    isWorkspaceViewer,
    
    // Admin permissions
    canManageUsers,
    canManageSystemSettings,
    canViewAuditLogs,
    canAccessWorkspace,
    canCreateWorkspace,
    
    // Current workspace permissions
    canManageCurrentWorkspace,
    canViewCurrentWorkspace,
    canInviteToCurrentWorkspace,
    
    // Legacy compatibility
    hasRole,
    canRead,
    canWrite,
    canDelete,
    
    // Utilities
    getEffectiveRole,
    
    // Raw access to permission context
    permissionsContext,
    currentWorkspace
  }
}