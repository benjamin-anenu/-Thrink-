
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { AuthContextType, Profile, AppRole } from '@/types/auth'
import { useToast } from '@/hooks/use-toast'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [role, setRole] = useState<AppRole | null>(null)
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
  }, [])

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

      // Fetch role with enhanced security check
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (roleError && roleError.code !== 'PGRST116') {
        console.error('[Auth] Error fetching role:', roleError)
      } else if (roleData) {
        console.log('[Auth] Role loaded:', roleData.role)
        setRole(roleData.role)
        
        // Log successful role loading for security audit
        try {
          await supabase.from('compliance_logs').insert({
            user_id: userId,
            event_type: 'login_attempt',
            event_category: 'authentication',
            description: 'User role successfully loaded',
            metadata: { role: roleData.role }
          });
        } catch (logError) {
          console.error('[Auth] Failed to log role loading:', logError);
        }
      } else {
        // Default role if none found - but log this security event
        console.warn('[Auth] No role found for user, assigning default member role')
        setRole('member')
        
        try {
          await supabase.from('compliance_logs').insert({
            user_id: userId,
            event_type: 'login_attempt',
            event_category: 'authentication',
            description: 'Default member role assigned - no existing role found',
            metadata: { assigned_role: 'member' }
          });
        } catch (logError) {
          console.error('[Auth] Failed to log default role assignment:', logError);
        }
      }
      
    } catch (err: any) {
      console.error('[Auth] Exception loading profile:', err)
      
      // Log security exception
      try {
        await supabase.from('compliance_logs').insert({
          user_id: userId,
          event_type: 'failed_login',
          event_category: 'authentication',
          description: 'Failed to load user profile',
          metadata: { error: err.message }
        });
      } catch (logError) {
        console.error('[Auth] Failed to log profile load error:', logError);
      }
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
        
        // Log failed authentication attempt
        try {
          await supabase.from('compliance_logs').insert({
            event_type: 'failed_login',
            event_category: 'authentication',
            description: 'Failed login attempt',
            metadata: { 
              email: email.toLowerCase(),
              error: error.message,
              timestamp: new Date().toISOString()
            }
          });
        } catch (logError) {
          console.error('[Auth] Failed to log authentication failure:', logError);
        }
        
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        console.log('[Auth] Sign in successful')
        
        // Log successful authentication
        try {
          await supabase.from('compliance_logs').insert({
            event_type: 'login_attempt',
            event_category: 'authentication',
            description: 'Successful login',
            metadata: { 
              email: email.toLowerCase(),
              timestamp: new Date().toISOString()
            }
          });
        } catch (logError) {
          console.error('[Auth] Failed to log authentication success:', logError);
        }
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
      
      // Log sign out attempt
      if (user) {
        try {
          await supabase.from('compliance_logs').insert({
            user_id: user.id,
            event_type: 'login_attempt',
            event_category: 'authentication',
            description: 'User logged out',
            metadata: { timestamp: new Date().toISOString() }
          });
        } catch (logError) {
          console.error('[Auth] Failed to log logout:', logError);
        }
      }
      
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

  // Enhanced role checking with security validation
  const hasRole = (requiredRole: AppRole): boolean => {
    if (!role || !user) return false
    
    const roleHierarchy = {
      'owner': 5,
      'admin': 4,
      'manager': 3,
      'member': 2,
      'viewer': 1
    }
    
    const currentRoleLevel = roleHierarchy[role] || 0
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0
    
    const hasPermission = currentRoleLevel >= requiredRoleLevel
    
    // Log permission checks for security audit
    if (!hasPermission) {
      supabase.from('compliance_logs').insert({
        user_id: user.id,
        event_type: 'suspicious_activity',
        event_category: 'authorization',
        description: 'Permission check failed',
        metadata: { 
          current_role: role,
          required_role: requiredRole,
          permission_granted: hasPermission
        }
      }).then(() => {}).catch(error => {
        console.error('[Auth] Failed to log permission check:', error)
      });
    }
    
    return hasPermission
  }

  const hasPermission = (action: string, resource?: string): boolean => {
    if (!role || !user) return false
    
    const rolePermissions = {
      'owner': ['*'],
      'admin': ['*'],
      'manager': ['read', 'write', 'projects:manage', 'resources:manage', 'tasks:manage'],
      'member': ['read', 'write', 'tasks:write'],
      'viewer': ['read']
    }
    
    const permissions = rolePermissions[role] || []
    if (permissions.includes('*')) return true
    
    const permission = resource ? `${resource}:${action}` : action
    const hasPermission = permissions.includes(permission)
    
    // Log permission checks for security audit  
    if (!hasPermission) {
      supabase.from('compliance_logs').insert({
        user_id: user.id,
        event_type: 'suspicious_activity',
        event_category: 'authorization',
        description: 'Resource permission check failed',
        metadata: { 
          current_role: role,
          requested_permission: permission,
          available_permissions: permissions
        }
      }).then(() => {}).catch(error => {
        console.error('[Auth] Failed to log permission check:', error)
      });
    }
    
    return hasPermission
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
