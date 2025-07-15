import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

export function useMultiTabSync() {
  const { user, refreshProfile, forceSignOut } = useAuth()

  useEffect(() => {
    if (!user) return

    // Create a channel for this user's auth state
    const channel = supabase.channel(`user_sync_${user.id}`)
    
    // Listen for profile updates from other tabs
    channel.on('broadcast', { event: 'profile_updated' }, () => {
      refreshProfile()
    })
    
    // Listen for forced signout events from other devices
    channel.on('broadcast', { event: 'force_signout' }, (payload) => {
      if (payload.payload.userId === user.id) {
        forceSignOut(payload.payload.reason || 'remote_signout')
      }
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

    // Listen for BroadcastChannel messages (cross-tab signout)
    let broadcastChannel: BroadcastChannel | null = null
    if (window.BroadcastChannel) {
      broadcastChannel = new BroadcastChannel(`auth_${user.id}`)
      broadcastChannel.addEventListener('message', (event) => {
        if (event.data.type === 'FORCE_SIGNOUT') {
          forceSignOut(event.data.reason || 'cross_tab_signout')
        }
      })
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      channel.unsubscribe()
      window.removeEventListener('storage', handleStorageChange)
      if (broadcastChannel) {
        broadcastChannel.close()
      }
    }
  }, [user, refreshProfile, forceSignOut])

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