import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { AuthContextType, Profile, AppRole, ROLE_HIERARCHY, ROLE_PERMISSIONS } from '@/types/auth'
import { useToast } from '@/hooks/use-toast'
import { cacheManager, withCache } from '@/services/CacheManager'
import { useOfflineStatus } from '@/hooks/useOfflineStatus'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [role, setRole] = useState<AppRole | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { isOnline } = useOfflineStatus()

  // Fetch user profile and role with caching
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      // Try to get from cache first (if online) or local storage (if offline)
      const cacheKey = `user_data_${userId}`
      
      if (!isOnline) {
        // Try to get from local storage when offline
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          const { profile: cachedProfile, role: cachedRole } = JSON.parse(cached)
          setProfile(cachedProfile)
          setRole(cachedRole || 'member')
          return
        }
      }

      // Use cached data if available and online
      const cachedData = await withCache(
        cacheKey,
        async () => {
          // Fetch profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single()

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileError)
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
          }

          return {
            profile: profileData,
            role: roleData?.role || 'member'
          }
        },
        5 * 60 * 1000 // 5 minute cache
      )

      // Store in localStorage for offline access
      localStorage.setItem(cacheKey, JSON.stringify(cachedData))

      setProfile(cachedData.profile)
      setRole(cachedData.role)
    } catch (error) {
      console.error('Error in fetchUserData:', error)
      
      // If there's an error and we're offline, try local storage
      if (!isOnline) {
        const cached = localStorage.getItem(`user_data_${userId}`)
        if (cached) {
          const { profile: cachedProfile, role: cachedRole } = JSON.parse(cached)
          setProfile(cachedProfile)
          setRole(cachedRole || 'member')
        }
      }
    }
  }, [isOnline])

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
  }, []) // Removed fetchUserData dependency to prevent infinite loops

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Provide more specific error messages
        let errorMessage = error.message
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.'
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many sign-in attempts. Please wait a few minutes before trying again.'
        }
        
        toast({
          title: "Sign In Failed",
          description: errorMessage,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been successfully signed in.",
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
        // Provide more specific error messages
        let errorMessage = error.message
        if (error.message.includes('already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.'
        } else if (error.message.includes('Password')) {
          errorMessage = 'Password does not meet requirements. Please ensure it\'s at least 8 characters long.'
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.'
        }
        
        toast({
          title: "Sign Up Failed",
          description: errorMessage,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Account Created Successfully!",
          description: "Please check your email to verify your account before signing in.",
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

  const signOut = async () => {
    try {
      setLoading(true)
      
      // Clear all local state immediately
      setUser(null)
      setSession(null)
      setProfile(null)
      setRole(null)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Signed Out Successfully",
          description: "You have been signed out of your account.",
        })
      }

      return { error }
    } catch (error: any) {
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