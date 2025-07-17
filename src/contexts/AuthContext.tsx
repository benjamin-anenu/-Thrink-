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
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Initialize auth state - simplified to only handle core authentication
  useEffect(() => {
    console.log('[Auth] Initializing authentication...')
    let mounted = true

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return

        console.log('[Auth] Auth state changed:', event, session?.user?.id)
        
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Clear profile/role data on sign out
        if (!session?.user) {
          setProfile(null)
          setRole(null)
        }
      }
    )

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      
      console.log('[Auth] Initial session:', session?.user?.id)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      console.log('[Auth] Cleaning up auth listener')
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // No dependencies to prevent loops

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

  // Simplified profile update without immediate refetch
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

  // Basic role checking - will be enhanced by useProfile hook
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

  // Simple refresh without complex fetching
  const refreshProfile = async () => {
    if (!user) return
    
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      setProfile(profileData)
      setRole(roleData?.role || 'member')
    } catch (error) {
      console.error('[Auth] Error refreshing profile:', error)
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