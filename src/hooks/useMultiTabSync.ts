import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

export function useMultiTabSync() {
  const { user, refreshProfile } = useAuth()

  useEffect(() => {
    if (!user) return

    // Create a channel for this user's auth state
    const channel = supabase.channel(`user_sync_${user.id}`)
    
    // Listen for profile updates from other tabs
    channel.on('broadcast', { event: 'profile_updated' }, () => {
      refreshProfile()
    })
    
    // Subscribe to the channel
    channel.subscribe()

    // Listen for storage events (session changes in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'supabase.auth.token') {
        // Session changed in another tab, refresh our state
        supabase.auth.getSession()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      channel.unsubscribe()
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [user, refreshProfile])

  // Function to broadcast profile updates to other tabs
  const broadcastProfileUpdate = () => {
    if (user) {
      const channel = supabase.channel(`user_sync_${user.id}`)
      channel.send({
        type: 'broadcast',
        event: 'profile_updated',
        payload: {}
      })
    }
  }

  return { broadcastProfileUpdate }
}