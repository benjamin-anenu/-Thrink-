import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { AuthContextType, Profile, AppRole, ROLE_HIERARCHY, ROLE_PERMISSIONS } from '@/types/auth'
import { useToast } from '@/hooks/use-toast'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [role, setRole] = useState<AppRole | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Fetch user profile and role
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError)
        return
      }

      // Fetch role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (roleError && roleError.code !== 'PGRST116') {
        console.error('Error fetching role:', roleError)
        return
      }

      setProfile(profileData)
      setRole(roleData?.role || 'member')
    } catch (error) {
      console.error('Error in fetchUserData:', error)
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // Defer profile fetching to prevent recursion
          setTimeout(() => {
            if (mounted) {
              fetchUserData(session.user.id)
            }
          }, 0)
        } else {
          setProfile(null)
          setRole(null)
        }

        if (event === 'SIGNED_IN') {
          // Log successful sign in
          if (session?.user) {
            await supabase.from('audit_logs').insert({
              user_id: session.user.id,
              action: 'user_signed_in',
              metadata: { timestamp: new Date().toISOString() }
            })
          }
        }

        if (event === 'SIGNED_OUT') {
          // Log successful sign out
          await supabase.from('audit_logs').insert({
            action: 'user_signed_out',
            metadata: { timestamp: new Date().toISOString() }
          })
        }

        setLoading(false)
      }
    )

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        fetchUserData(session.user.id)
      }
      
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchUserData])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        })
      }

      return { error }
    } catch (error: any) {
      toast({
        title: "Sign In Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true)
      const redirectUrl = `${window.location.origin}/`
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || '',
          }
        }
      })

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Sign Up Successful",
          description: "Please check your email to verify your account.",
        })
      }

      return { error }
    } catch (error: any) {
      toast({
        title: "Sign Up Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (options: { everywhere?: boolean; reason?: string } = {}) => {
    try {
      setLoading(true)
      const currentUser = user
      
      // Immediate state cleanup for security
      setUser(null)
      setProfile(null)
      setRole(null)
      setSession(null)
      
      // Clear sensitive data from localStorage
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('auth') || key.includes('session')
      )
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      // Log the sign out attempt with enhanced metadata
      if (currentUser) {
        try {
          await supabase.from('audit_logs').insert({
            user_id: currentUser.id,
            action: options.everywhere ? 'sign_out_everywhere' : 'sign_out',
            metadata: {
              timestamp: new Date().toISOString(),
              user_agent: navigator.userAgent,
              reason: options.reason || 'user_initiated',
              device_info: {
                platform: navigator.platform,
                language: navigator.language,
                screen: `${screen.width}x${screen.height}`,
              }
            }
          })
        } catch (auditError) {
          // Don't block signout on audit log failure
          console.warn('Failed to log signout:', auditError)
        }
        
        // Broadcast signout to other tabs
        if (window.BroadcastChannel) {
          const channel = new BroadcastChannel(`auth_${currentUser.id}`)
          channel.postMessage({ 
            type: 'FORCE_SIGNOUT', 
            reason: options.reason || 'user_initiated',
            everywhere: options.everywhere 
          })
          channel.close()
        }
        
        // Also use Supabase realtime for cross-device signout
        const realtimeChannel = supabase.channel(`user_signout_${currentUser.id}`)
        realtimeChannel.send({
          type: 'broadcast',
          event: 'force_signout',
          payload: { 
            userId: currentUser.id, 
            reason: options.reason || 'user_initiated',
            everywhere: options.everywhere 
          }
        })
      }

      // Perform the actual signout
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        // Restore state if signout failed
        setUser(currentUser)
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Signed Out Successfully",
          description: options.everywhere ? "Signed out from all devices" : "You have been signed out",
        })
      }

      return { error }
    } catch (error: any) {
      toast({
        title: "Sign Out Error",
        description: "An unexpected error occurred but you have been signed out locally.",
        variant: "destructive",
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const forceSignOut = async (reason: string = 'security_violation') => {
    return signOut({ everywhere: true, reason })
  }

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/reset-password`
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      if (error) {
        toast({
          title: "Password Reset Failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Password Reset Email Sent",
          description: "Please check your email for password reset instructions.",
        })
      }

      return { error }
    } catch (error: any) {
      toast({
        title: "Password Reset Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return { error }
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('User not authenticated') }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)

      if (error) {
        toast({
          title: "Profile Update Failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        })
        await fetchUserData(user.id)
      }

      return { error }
    } catch (error: any) {
      toast({
        title: "Profile Update Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return { error }
    }
  }

  const hasRole = (requiredRole: AppRole): boolean => {
    if (!role) return false
    return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[requiredRole]
  }

  const hasPermission = (action: string, resource?: string): boolean => {
    if (!role) return false
    
    const permissions = ROLE_PERMISSIONS[role]
    if (permissions.includes('*')) return true
    
    const permission = resource ? `${resource}:${action}` : action
    return permissions.includes(permission)
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    profile,
    role,
    loading,
    signIn,
    signUp,
    signOut,
    forceSignOut,
    resetPassword,
    updateProfile,
    hasRole,
    hasPermission,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}