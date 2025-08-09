import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Profile, AppRole, WorkspaceRole, AuthContextType, UserPermissionsContext } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSystemOwner, setIsSystemOwner] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permissionsContext, setPermissionsContext] = useState<UserPermissionsContext | null>(null);

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
      console.log('[AuthContext] Refreshing profile for user:', user.id);
      
      // 1) Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('[AuthContext] Error fetching profile:', profileError);
      }

      // 2) Get user permissions context using the new function
      const { data: contextData, error: contextError } = await supabase
        .rpc('get_user_permissions_context', { _user_id: user.id });

      console.log('[AuthContext] Permissions context result:', { contextData, contextError });

      if (!contextError && contextData && contextData.length > 0) {
        const data = contextData[0]; // RPC returns array, take first result
        const context: UserPermissionsContext = {
          is_system_owner: data.is_system_owner || false,
          system_role: (data.system_role && ['owner', 'admin', 'member', 'viewer'].includes(data.system_role)) 
            ? data.system_role as AppRole 
            : null,
          admin_permissions: Array.isArray(data.admin_permissions) 
            ? data.admin_permissions.map((p: any) => ({
                id: p.id || '',
                user_id: p.user_id || '',
                permission_type: p.permission_type || '',
                permission_scope: p.permission_scope,
                granted_by: p.granted_by,
                is_active: p.is_active || true,
                created_at: p.created_at || '',
                updated_at: p.updated_at || ''
              }))
            : [],
          workspace_memberships: Array.isArray(data.workspace_memberships) 
            ? data.workspace_memberships.map((m: any) => ({
                workspace_id: m.workspace_id || '',
                role: m.role || 'viewer',
                status: m.status || 'active'
              }))
            : []
        };

        setPermissionsContext(context);
        setIsSystemOwner(context.is_system_owner);
        
        console.log('[AuthContext] Updated permissions context:', context);
      } else {
        console.error('[AuthContext] Failed to get permissions context:', contextError);
        // Fallback: try to get basic system owner status
        try {
          const { data: ownerData } = await supabase.rpc('is_system_owner', { 
            user_id_param: user.id 
          });
          
          if (typeof ownerData === 'boolean') {
            setIsSystemOwner(ownerData);
            setPermissionsContext({
              is_system_owner: ownerData,
              system_role: ownerData ? 'owner' : null,
              admin_permissions: [],
              workspace_memberships: []
            });
          }
        } catch (fallbackError) {
          console.error('[AuthContext] Fallback also failed:', fallbackError);
        }
      }

      setProfile(profileData ?? null);
      
    } catch (error) {
      console.error('[AuthContext] Error refreshing profile:', error);
    }
  };

  useEffect(() => {
    console.log('[AuthContext] Initializing auth state');
    setLoading(true);

    // 1) Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthContext] Auth state changed:', event, !!session?.user);
      
      // Only synchronous updates inside the callback
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Defer any Supabase reads to avoid deadlocks
        setTimeout(async () => {
          try {
            await refreshProfile();
            const first = await checkFirstUser();
            setIsFirstUser(first);
          } catch (e) {
            console.error('[AuthContext] Auth state change hydration error:', e);
          } finally {
            setLoading(false);
          }
        }, 0);
      } else {
        // Logged out state
        setProfile(null);
        setPermissionsContext(null);
        setIsSystemOwner(false);
        setIsFirstUser(false);
        setLoading(false);
      }
    });

    // 2) Then check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AuthContext] Initial session check:', !!session?.user);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(async () => {
          try {
            await refreshProfile();
            const first = await checkFirstUser();
            setIsFirstUser(first);
          } catch (e) {
            console.error('[AuthContext] Initial session hydration error:', e);
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
        setPermissionsContext(null);
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
          emailRedirectTo: `${window.location.origin}/`,
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
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

  // Authorization methods
  const hasSystemRole = (requiredRole: AppRole): boolean => {
    if (!permissionsContext) return false;
    if (permissionsContext.is_system_owner) return true;
    if (!permissionsContext.system_role) return false;
    
    const roleHierarchy = { owner: 4, admin: 3, member: 2, viewer: 1 };
    const userLevel = roleHierarchy[permissionsContext.system_role];
    const requiredLevel = roleHierarchy[requiredRole];
    
    return userLevel >= requiredLevel;
  };

  const hasWorkspaceRole = (workspaceId: string, requiredRole: WorkspaceRole): boolean => {
    if (!permissionsContext) return false;
    if (permissionsContext.is_system_owner) return true;
    
    const membership = permissionsContext.workspace_memberships.find(
      m => m.workspace_id === workspaceId && m.status === 'active'
    );
    
    if (!membership) return false;
    
    const roleHierarchy = { owner: 4, admin: 3, member: 2, viewer: 1 };
    const userLevel = roleHierarchy[membership.role];
    const requiredLevel = roleHierarchy[requiredRole];
    
    return userLevel >= requiredLevel;
  };

  const hasAdminPermission = (permissionType: string, scope?: string): boolean => {
    if (!permissionsContext) return false;
    if (permissionsContext.is_system_owner) return true;
    
    return permissionsContext.admin_permissions.some(
      p => p.permission_type === permissionType && 
           (scope === undefined || p.permission_scope === scope) &&
           p.is_active
    );
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isSystemOwner,
      isFirstUser,
      loading,
      permissionsContext,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updateProfile,
      refreshProfile,
      refreshAuth,
      hasSystemRole,
      hasWorkspaceRole,
      hasAdminPermission
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