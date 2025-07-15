import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

interface SessionTimeoutHookOptions {
  warningTime?: number // Time in minutes before session expires to show warning
  idleTimeout?: number // Time in minutes of inactivity before showing warning
}

export function useSessionTimeout(options: SessionTimeoutHookOptions = {}) {
  const { warningTime = 5, idleTimeout = 30 } = options
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())

  // Update last activity time
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now())
  }, [])

  // Reset timeout warning
  const resetTimeoutWarning = useCallback(() => {
    setShowTimeoutWarning(false)
    updateActivity()
  }, [updateActivity])

  // Force logout due to timeout
  const handleTimeout = useCallback(async () => {
    setShowTimeoutWarning(false)
    await signOut()
    toast({
      title: "Session Expired",
      description: "You have been signed out due to inactivity.",
      variant: "destructive",
    })
  }, [signOut, toast])

  // Extend session
  const extendSession = useCallback(() => {
    resetTimeoutWarning()
    toast({
      title: "Session Extended",
      description: "Your session has been extended.",
    })
  }, [resetTimeoutWarning, toast])

  useEffect(() => {
    if (!user) return

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true)
    })

    // Check for inactivity every minute
    const interval = setInterval(() => {
      const now = Date.now()
      const timeSinceLastActivity = (now - lastActivity) / (1000 * 60) // in minutes

      if (timeSinceLastActivity >= idleTimeout - warningTime && !showTimeoutWarning) {
        setShowTimeoutWarning(true)
      }

      if (timeSinceLastActivity >= idleTimeout) {
        handleTimeout()
      }
    }, 60000) // Check every minute

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true)
      })
      clearInterval(interval)
    }
  }, [user, lastActivity, idleTimeout, warningTime, showTimeoutWarning, updateActivity, handleTimeout])

  return {
    showTimeoutWarning,
    resetTimeoutWarning,
    extendSession,
    handleTimeout
  }
}