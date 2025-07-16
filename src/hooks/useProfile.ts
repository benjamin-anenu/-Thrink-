import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Profile, AppRole } from '@/types/auth'

export function useProfile() {
  const { user, profile, role, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load profile and role data when user is available
  useEffect(() => {
    if (!user || profile !== null) return // Skip if no user or profile already loaded

    const loadUserProfile = async () => {
      console.log('[Profile] Loading profile for user:', user.id)
      setLoading(true)
      setError(null)

      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        // Fetch role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('[Profile] Error fetching profile:', profileError)
          setError('Failed to load profile')
          return
        }

        if (roleError && roleError.code !== 'PGRST116') {
          console.error('[Profile] Error fetching role:', roleError)
          setError('Failed to load role')
          return
        }

        // Update auth context with profile data
        await refreshProfile()
        
        console.log('[Profile] Profile loaded successfully')
      } catch (err) {
        console.error('[Profile] Exception loading profile:', err)
        setError('An error occurred while loading profile')
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [user, profile, refreshProfile])

  return {
    profile,
    role,
    loading,
    error,
    refreshProfile
  }
}