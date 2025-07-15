import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function useAuthRedirect() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (loading) return

    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo')
    
    // If user is authenticated and on auth page, redirect them
    if (user && location.pathname === '/auth') {
      const destination = returnTo && returnTo !== '/auth' ? returnTo : '/dashboard'
      navigate(destination, { replace: true })
    }
  }, [user, loading, location, navigate])

  return { user, loading }
}