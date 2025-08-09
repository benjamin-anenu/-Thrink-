import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Profile, AppRole, AuthContextType } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isSystemOwner, setIsSystemOwner] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contextError, setContextError] = useState<string | null>(null);
  
  // Enhanced state for enterprise owner persistence
  const [roleCache, setRoleCache] = useState<{ 
    role: AppRole | null; 
    isSystemOwner: boolean; 
    timestamp: number;
    userId: string | null;
  } | null>(null);

  const checkFirstUser = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Check if the current user has any workspaces (as owner or member)
      const { data: workspaces, error } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1);

      if (error) {
        console.error('Error checking user workspaces:', error);
        return false;
      }

      // If user has no workspaces, they need onboarding
      return (workspaces || []).length === 0;
    } catch (error) {
      console.error('Error checking first user:', error);
      return false;
    }
  };

  // Load cached role data from localStorage
  const loadCachedRole = (userId: string) => {
    try {
      const cached = localStorage.getItem(`thrink_role_cache_${userId}`);
      if (cached) {
        const data = JSON.parse(cached);
        const isExpired = Date.now() - data.timestamp > 5 * 60 * 1000; // 5 minutes cache
        if (!isExpired && data.userId === userId) {
          console.log('[Auth] Using cached role data:', data);
          setRole(data.role);
          setIsSystemOwner(data.isSystemOwner);
          setRoleCache(data);
          return true;
        }
      }
    } catch (error) {
      console.error('[Auth] Error loading cached role:', error);
    }
    return false;
  };

  // Save role data to localStorage
  const saveCachedRole = (userId: string, role: AppRole | null, isSystemOwner: boolean) => {
    try {
      const data = {
        role,
        isSystemOwner,
        timestamp: Date.now(),
        userId
      };
      localStorage.setItem(`thrink_role_cache_${userId}`, JSON.stringify(data));
      setRoleCache(data);
    } catch (error) {
      console.error('[Auth] Error saving cached role:', error);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      console.log('[Auth] Refreshing profile for user:', user.id);
      
      // Try to load from cache first for faster response
      const usedCache = loadCachedRole(user.id);
      
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('[Auth] Error fetching profile:', profileError);
        return;
      }

      console.log('[Auth] Profile data:', profileData);

      // Fetch user roles - should now work without RLS recursion
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role, is_enterprise_owner, enterprise_id')
        .eq('user_id', user.id);

      if (rolesError) {
        console.error('[Auth] Error fetching roles:', rolesError);
        return;
      }

      console.log('[Auth] Roles data:', rolesData);

      // Compute highest role
      const hierarchy = { owner: 5, admin: 4, manager: 3, member: 2, viewer: 1 } as const;
      let effectiveRole: AppRole | null = null;
      let max = 0;
      (rolesData || []).forEach((r: any) => {
        const score = hierarchy[r.role as AppRole];
        if (score > max) {
          max = score;
          effectiveRole = r.role as AppRole;
        }
      });

      const enterpriseOwner = (rolesData || []).some((r: any) => !!r.is_enterprise_owner);

      setProfile(profileData);
      
      // Only update if different from cache to avoid unnecessary re-renders
      if (!usedCache || roleCache?.role !== effectiveRole || roleCache?.isSystemOwner !== enterpriseOwner) {
        setRole(effectiveRole);
        setIsSystemOwner(enterpriseOwner);
        saveCachedRole(user.id, effectiveRole, enterpriseOwner);
      }
      
      console.log('[Auth] Computed role:', effectiveRole, 'is system owner:', enterpriseOwner);
    } catch (error) {
      console.error('[Auth] Error refreshing profile:', error);
    }
  };

  useEffect(() => {
    // Keep auth loading true until we hydrate profile/roles
    setLoading(true);

    // 1) Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] Auth state change:', event, 'user:', session?.user?.email);
      
      // Only synchronous updates inside the callback
      setSession(session as any);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Defer any Supabase reads to avoid deadlocks
        setTimeout(async () => {
          try {
            await refreshProfile();
            const first = await checkFirstUser();
            setIsFirstUser(first);
          } catch (e) {
            console.error('[Auth] onAuthStateChange hydration error:', e);
          } finally {
            setLoading(false);
          }
        }, 0);
      } else {
        // Logged out state - clear cache
        setProfile(null);
        setRole(null);
        setIsSystemOwner(false);
        setIsFirstUser(false);
        setRoleCache(null);
        setLoading(false);
        
        // Clear localStorage cache
        try {
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.startsWith('thrink_role_cache_')) {
              localStorage.removeItem(key);
            }
          });
        } catch (error) {
          console.error('[Auth] Error clearing role cache:', error);
        }
      }
    });

    // 2) Then check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[Auth] Initial session:', session?.user?.email);
      
      setSession(session as any);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(async () => {
          try {
            await refreshProfile();
            const first = await checkFirstUser();
            setIsFirstUser(first);
          } catch (e) {
            console.error('[Auth] Initial session hydration error:', e);
          } finally {
            setLoading(false);
          }
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const firstUser = await checkFirstUser();
      setIsFirstUser(firstUser);
      await refreshProfile();
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // Don't set loading to false here - let the auth state change handle it
      // This ensures role data is loaded before redirects happen
      return { error };
    } catch (e: any) {
      setLoading(false); // Only set to false on error
      return { error: { message: e.message } };
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setUser(null);
        setProfile(null);
        setRole(null);
        setIsSystemOwner(false);
      }
      return { error };
    } catch (e: any) {
      return { error: { message: e.message } };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split('@')[0],
          },
        },
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        // Profile will be created by the database trigger
        await refreshProfile();
      }
      
      return { error: null };
    } catch (e: any) {
      return { error: { message: e.message } };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (e: any) {
      return { error: { message: e.message } };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: { message: 'No user logged in' } };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (!error) {
        await refreshProfile();
      }

      return { error };
    } catch (e: any) {
      return { error: { message: e.message } };
    }
  };

  const hasRole = (requiredRole: AppRole): boolean => {
    if (!role) return false;
    const roleHierarchy = { owner: 5, admin: 4, manager: 3, member: 2, viewer: 1 };
    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  };

  const hasPermission = (action: string, resource?: string): boolean => {
    if (!role) return false;
    if (role === 'owner') return true;
    
    const rolePermissions = {
      admin: ['users:read', 'users:write', 'users:delete', 'projects:read', 'projects:write', 'projects:delete', 'settings:read', 'settings:write', 'audit:read'],
      manager: ['users:read', 'projects:read', 'projects:write', 'settings:read'],
      member: ['projects:read', 'projects:write'],
      viewer: ['projects:read'],
    };

    const permissions = rolePermissions[role] || [];
    const fullAction = resource ? `${resource}:${action}` : action;
    return permissions.includes(fullAction);
  };

  return (
    <AuthContext.Provider value={{
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
      refreshAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
