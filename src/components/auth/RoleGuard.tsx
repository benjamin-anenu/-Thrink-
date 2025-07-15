import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AppRole } from '@/types/auth'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: AppRole[]
  fallback?: React.ReactNode
  requiredPermission?: string
  resource?: string
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback = null,
  requiredPermission,
  resource
}: RoleGuardProps) {
  const { role, hasRole, hasPermission } = useAuth()

  // Check if user has any of the allowed roles
  const hasAllowedRole = allowedRoles.some(allowedRole => hasRole(allowedRole))

  // Check permission if specified
  const hasRequiredPermission = requiredPermission 
    ? hasPermission(requiredPermission, resource)
    : true

  if (!hasAllowedRole || !hasRequiredPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Convenience components for common role checks
export function AdminOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['admin', 'owner']} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function ManagerOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['manager', 'admin', 'owner']} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function MemberOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['member', 'manager', 'admin', 'owner']} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}