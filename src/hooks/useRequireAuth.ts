import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AppRole } from '@/types/auth'

interface UseRequireAuthOptions {
  redirectTo?: string
  requiredRole?: AppRole
  requiredPermission?: string
  resource?: string
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { 
    redirectTo = '/auth', 
    requiredRole, 
    requiredPermission, 
    resource 
  } = options
  
  const { user, loading, hasSystemRole, hasAdminPermission } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    // Check if user is authenticated
    if (!user) {
      navigate(redirectTo)
      return
    }

    // Check role requirement
    if (requiredRole && !hasSystemRole(requiredRole)) {
      navigate('/unauthorized')
      return
    }

    // Check permission requirement
    if (requiredPermission && !hasAdminPermission(requiredPermission, resource)) {
      navigate('/unauthorized')
      return
    }
  }, [user, loading, requiredRole, requiredPermission, resource, hasSystemRole, hasAdminPermission, navigate, redirectTo])

  return {
    isAuthenticated: !!user,
    isAuthorized: (!requiredRole || hasSystemRole(requiredRole)) && 
                  (!requiredPermission || hasAdminPermission(requiredPermission, resource)),
    loading
  }
}