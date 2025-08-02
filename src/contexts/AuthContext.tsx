import React, { createContext, useContext, useEffect, useState } from 'react'
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
  const [isSystemOwner, setIsSystemOwner] = useState(false)
  const [isFirstUser, setIsFirstUser] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Initialize auth state and load profile data
  useEffect(() => {
    console.log('[Auth] Initializing authentication...')
    let mounted = true

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('[Auth] Auth state changed:', event, session?.user?.id)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        // Load profile data when user signs in
        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(() => {
            loadUserProfile(session.user.id)
          }, 0)
        } else if (!session?.user) {
          // Clear profile data on sign out
          setProfile(null)
          setRole(null)
          setIsSystemOwner(false)
          setIsFirstUser(false)
        }
        
        setLoading(false)
      }
    )

    // Get initial session and load profile if user exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      
      console.log('[Auth] Initial session:', session?.user?.id)
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    return () => {
      console.log('[Auth] Cleaning up auth listener')
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // No dependencies to prevent loops

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('[Auth] Loading profile for user:', userId)
      
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('[Auth] Error fetching profile:', profileError)
      } else if (profileData) {
        console.log('[Auth] Profile loaded:', profileData)
        setProfile(profileData)
      }

      // Fetch role and system owner status
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role, is_system_owner')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (roleError && roleError.code !== 'PGRST116') {
        console.error('[Auth] Error fetching role:', roleError)
      } else if (roleData) {
        console.log('[Auth] Role loaded:', roleData.role, 'System owner:', roleData.is_system_owner)
        setRole(roleData.role)
        setIsSystemOwner(Boolean(roleData.is_system_owner))
        
        // Check if this is a first user (system owner with no workspaces)
        if (roleData.is_system_owner) {
          const { data: workspaceData } = await supabase
            .from('workspaces')
            .select('id')
            .limit(1)
            .maybeSingle()
          
          setIsFirstUser(!workspaceData)
        }
      } else {
        // Default role if none found
        setRole('member')
      }
      
    } catch (err) {
      console.error('[Auth] Exception loading profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[Auth] Attempting sign in...')
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('[Auth] Sign in error:', error)
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        console.log('[Auth] Sign in successful')
      }

      return { error }
    } catch (error: any) {
      console.error('[Auth] Sign in exception:', error)
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
      console.log('[Auth] Attempting sign up...')
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
        console.error('[Auth] Sign up error:', error)
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        console.log('[Auth] Sign up successful')
        toast({
          title: "Sign Up Successful",
          description: "Please check your email to verify your account.",
        })
      }

      return { error }
    } catch (error: any) {
      console.error('[Auth] Sign up exception:', error)
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

  const signOut = async () => {
    try {
      console.log('[Auth] Attempting sign out...')
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('[Auth] Sign out error:', error)
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        console.log('[Auth] Sign out successful')
      }

      return { error }
    } catch (error: any) {
      console.error('[Auth] Sign out exception:', error)
      toast({
        title: "Sign Out Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return { error }
    } finally {
      setLoading(false)
    }
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
        // Update local profile state
        setProfile(prev => prev ? { ...prev, ...updates } : null)
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
    if (!user) return
    
    await loadUserProfile(user.id)
  }

  const value: AuthContextType = {
    user,
    session,
    profile,
    role,
    isSystemOwner,
    isFirstUser,
    loading,
    signIn,
    signUp,
    signOut,
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
