import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AppRole } from '@/types/auth'
import { LoadingState } from '@/components/ui/loading-state'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: AppRole
  requiredPermission?: string
  resource?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredPermission, 
  resource 
}: ProtectedRouteProps) {
  const { user, loading, hasRole, hasPermission } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingState />
  }

  if (!user) {
    // Redirect to auth page with return URL
    return <Navigate 
      to={`/auth?returnTo=${encodeURIComponent(location.pathname + location.search)}`} 
      replace 
    />
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission, resource)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}