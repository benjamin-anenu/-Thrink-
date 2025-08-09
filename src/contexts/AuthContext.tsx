
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

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      // 1) Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      // 2) Prefer secure RPCs for role + system owner
      const [roleRpc, ownerRpc] = await Promise.all([
        supabase.rpc('get_user_role', { _user_id: user.id }),
        supabase.rpc('is_system_owner', { user_id_param: user.id })
      ]);

      let effectiveRole: AppRole | null = (roleRpc.data as AppRole | null) ?? null;
      let systemOwner = Boolean(ownerRpc.data);

      // 3) Fallback: direct table read only if RPC unavailable or returned null
      if ((!effectiveRole || roleRpc.error) && !ownerRpc.error) {
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('role, is_system_owner')
          .eq('user_id', user.id);

        if (!rolesError && rolesData) {
          const hierarchy = { owner: 5, admin: 4, manager: 3, member: 2, viewer: 1 } as const;
          let max = 0;
          (rolesData || []).forEach((r: { role: AppRole; is_system_owner?: boolean }) => {
            const score = hierarchy[r.role];
            if (score > max) {
              max = score;
              effectiveRole = r.role;
            }
          });
          systemOwner = (rolesData || []).some((r: { is_system_owner?: boolean }) => !!r.is_system_owner);
        } else if (rolesError) {
          console.warn('[Auth] Fallback role query failed due to RLS (expected for non-admins):', rolesError?.message);
        }
      }

      setProfile(profileData ?? null);
      setRole(effectiveRole);
      setIsSystemOwner(systemOwner);
      console.debug('[Auth] effectiveRole', effectiveRole, 'isSystemOwner', systemOwner);

      // 4) One-time retry after slight delay if role not yet hydrated
      if (!effectiveRole) {
        setTimeout(async () => {
          try {
            const [{ data: roleRetry }, { data: ownerRetry }] = await Promise.all([
              supabase.rpc('get_user_role', { _user_id: user.id }),
              supabase.rpc('is_system_owner', { user_id_param: user.id })
            ]);
            if (roleRetry) setRole(roleRetry as AppRole);
            if (typeof ownerRetry === 'boolean') setIsSystemOwner(ownerRetry);
          } catch (e) {
            console.debug('[Auth] Role retry failed (non-fatal):', e);
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  useEffect(() => {
    // Keep auth loading true until we hydrate profile/roles
    setLoading(true);

    // 1) Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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
            console.error('Auth onAuthStateChange hydration error:', e);
          } finally {
            setLoading(false);
          }
        }, 0);
      } else {
        // Logged out state
        setProfile(null);
        setRole(null);
        setIsSystemOwner(false);
        setIsFirstUser(false);
        setLoading(false);
      }
    });

    // 2) Then check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session as any);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(async () => {
          try {
            await refreshProfile();
            const first = await checkFirstUser();
            setIsFirstUser(first);
          } catch (e) {
            console.error('Auth initial session hydration error:', e);
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
      return { error };
    } catch (e: any) {
      return { error: { message: e.message } };
    } finally {
      setLoading(false);
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
