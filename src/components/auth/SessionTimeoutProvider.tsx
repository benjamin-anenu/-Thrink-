import React from 'react'
import { useSessionTimeout } from '@/hooks/useSessionTimeout'
import { SessionTimeoutWarning } from '@/components/auth/SessionTimeoutWarning'

export function SessionTimeoutProvider({ children }: { children: React.ReactNode }) {
  const { 
    showTimeoutWarning, 
    extendSession, 
    handleTimeout 
  } = useSessionTimeout({
    warningTime: 5, // Show warning 5 minutes before timeout
    idleTimeout: 30 // Timeout after 30 minutes of inactivity
  })

  return (
    <>
      {children}
      <SessionTimeoutWarning
        open={showTimeoutWarning}
        onExtend={extendSession}
        onSignOut={handleTimeout}
        remainingTime={5}
      />
    </>
  )
}