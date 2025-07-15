import { useState, useEffect } from 'react'

export interface OfflineState {
  isOnline: boolean
  isOffline: boolean
  wasOffline: boolean
  lastOnline?: Date
}

export function useOfflineStatus() {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    isOffline: !navigator.onLine,
    wasOffline: false,
  })

  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({
        isOnline: true,
        isOffline: false,
        wasOffline: prev.wasOffline || !prev.isOnline,
        lastOnline: new Date(),
      }))
    }

    const handleOffline = () => {
      setState(prev => ({
        ...prev,
        isOnline: false,
        isOffline: true,
      }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return state
}