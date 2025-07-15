
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface UseRequireAuthOptions {
  redirectTo?: string
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { redirectTo = '/login' } = options
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    // Check if user is authenticated
    if (!user) {
      navigate(redirectTo)
      return
    }
  }, [user, loading, navigate, redirectTo])

  return {
    isAuthenticated: !!user,
    isAuthorized: !!user, // Simplified for now
    loading
  }
}
