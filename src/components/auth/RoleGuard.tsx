
import React from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles?: string[]
  fallback?: React.ReactNode
}

export function RoleGuard({ 
  children, 
  fallback = <div className="text-center text-muted-foreground">Access denied</div>
}: RoleGuardProps) {
  const { user } = useAuth()

  // For now, allow all authenticated users
  if (!user) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Simplified convenience components
export function AdminOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <RoleGuard fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function ManagerOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <RoleGuard fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function MemberOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <RoleGuard fallback={fallback}>
      {children}
    </RoleGuard>
  )
}
