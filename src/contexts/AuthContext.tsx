
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
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      // Fetch all roles and compute highest effective role and system owner flag
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role, is_system_owner')
        .eq('user_id', user.id);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        return;
      }

      // Compute highest role
      const hierarchy = { owner: 5, admin: 4, manager: 3, member: 2, viewer: 1 } as const;
      let effectiveRole: AppRole | null = null;
      let max = 0;
      (rolesData || []).forEach((r: { role: AppRole; is_system_owner?: boolean }) => {
        const score = hierarchy[r.role];
        if (score > max) {
          max = score;
          effectiveRole = r.role;
        }
      });

      const systemOwner = (rolesData || []).some((r: { is_system_owner?: boolean }) => !!r.is_system_owner);

      setProfile(profileData);
      setRole(effectiveRole);
      setIsSystemOwner(systemOwner);
      console.debug('[Auth] effectiveRole', effectiveRole, 'isSystemOwner', systemOwner);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setUser(session.user);
          setSession(session);
          await refreshProfile();
        }

        const firstUser = await checkFirstUser();
        setIsFirstUser(firstUser);
      } catch (e: any) {
        console.error('Auth error:', e.message);
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        return;
      }

      setUser(session?.user || null);
      setSession(session);

      if (session?.user) {
        await refreshProfile();
        const firstUser = await checkFirstUser();
        setIsFirstUser(firstUser);
      } else {
        setProfile(null);
        setRole(null);
        setIsSystemOwner(false);
        setIsFirstUser(false);
      }
    });
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
