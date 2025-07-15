import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

interface Session {
  id: string
  device_info: any
  ip_address: string | null
  user_agent: string | null
  created_at: string
  last_activity: string | null
  is_active: boolean
}

export function useSessionManager() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)

  const fetchSessions = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('last_activity', { ascending: false })

      if (error) throw error
      setSessions((data || []).map(session => ({
        ...session,
        ip_address: session.ip_address?.toString() || 'Unknown',
        user_agent: session.user_agent || 'Unknown Browser'
      })))
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  const terminateSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          is_active: false, 
          ended_at: new Date().toISOString() 
        })
        .eq('id', sessionId)

      if (error) throw error
      
      // Refresh sessions list
      await fetchSessions()
    } catch (error) {
      console.error('Error terminating session:', error)
      throw error
    }
  }

  const terminateAllOtherSessions = async () => {
    if (!user) return

    try {
      const currentSession = await supabase.auth.getSession()
      
      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          is_active: false, 
          ended_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .neq('session_id', currentSession.data.session?.access_token || '')

      if (error) throw error
      
      // Refresh sessions list
      await fetchSessions()
    } catch (error) {
      console.error('Error terminating sessions:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return {
    sessions,
    loading,
    fetchSessions,
    terminateSession,
    terminateAllOtherSessions
  }
}