import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'

interface SessionTimeoutOptions {
  timeoutMinutes?: number
  warningMinutes?: number
  enabled?: boolean
}

export function useSessionTimeout(options: SessionTimeoutOptions = {}) {
  const { 
    timeoutMinutes = 60, 
    warningMinutes = 5, 
    enabled = true 
  } = options
  
  const { user, forceSignOut } = useAuth()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const warningRef = useRef<NodeJS.Timeout>()
  const lastActivityRef = useRef<number>(Date.now())

  const resetTimeout = () => {
    if (!enabled || !user) return

    lastActivityRef.current = Date.now()
    
    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
    
    // Set warning timeout
    warningRef.current = setTimeout(() => {
      toast({
        title: "Session Expiring",
        description: `Your session will expire in ${warningMinutes} minutes due to inactivity.`,
        variant: "destructive",
      })
    }, (timeoutMinutes - warningMinutes) * 60 * 1000)
    
    // Set session timeout
    timeoutRef.current = setTimeout(() => {
      forceSignOut('session_timeout')
      toast({
        title: "Session Expired",
        description: "You have been signed out due to inactivity.",
        variant: "destructive",
      })
    }, timeoutMinutes * 60 * 1000)
  }

  useEffect(() => {
    if (!enabled || !user) return

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const handleActivity = () => {
      resetTimeout()
    }

    // Add event listeners for user activity
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    // Initial timeout setup
    resetTimeout()

    return () => {
      // Clean up event listeners
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
      
      // Clear timeouts
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
    }
  }, [user, enabled, timeoutMinutes, warningMinutes, forceSignOut])

  return {
    resetTimeout,
    getLastActivity: () => lastActivityRef.current,
    getRemainingTime: () => {
      const elapsed = Date.now() - lastActivityRef.current
      const remaining = (timeoutMinutes * 60 * 1000) - elapsed
      return Math.max(0, remaining)
    }
  }
}