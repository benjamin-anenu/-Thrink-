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
  
  const { user, loading, hasRole, hasPermission } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    // Check if user is authenticated
    if (!user) {
      navigate(redirectTo)
      return
    }

    // Check role requirement
    if (requiredRole && !hasRole(requiredRole)) {
      navigate('/unauthorized')
      return
    }

    // Check permission requirement
    if (requiredPermission && !hasPermission(requiredPermission, resource)) {
      navigate('/unauthorized')
      return
    }
  }, [user, loading, requiredRole, requiredPermission, resource, hasRole, hasPermission, navigate, redirectTo])

  return {
    isAuthenticated: !!user,
    isAuthorized: (!requiredRole || hasRole(requiredRole)) && 
                  (!requiredPermission || hasPermission(requiredPermission, resource)),
    loading
  }
}