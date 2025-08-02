import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  isFirstUser: boolean;
  isSystemOwner: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [isSystemOwner, setIsSystemOwner] = useState(false);

  const checkFirstUser = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*', { count: 'exact' });

      if (error) {
        console.error('Error checking first user:', error);
        return false;
      }

      const userCount = data?.length || 0;
      return userCount === 0;
    } catch (error) {
      console.error('Error checking first user:', error);
      return false;
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          setUser(session.user);
        }

        const firstUser = await checkFirstUser();
        setIsFirstUser(firstUser);

        // Check if the user is a system owner
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_system_owner')
          .eq('id', session?.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else {
          setIsSystemOwner(profile?.is_system_owner || false);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        return
      }

      setUser(session?.user || null);

      if (session?.user) {
        // Check if the user is a system owner
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_system_owner')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else {
          setIsSystemOwner(profile?.is_system_owner || false);
        }
      }
    });
  }, []);

  // Add refresh auth function
  const refreshAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const firstUser = await checkFirstUser();
      setIsFirstUser(firstUser);
    }
  };

  const signIn = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split('@')[0],
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Create a user profile in the 'profiles' table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { id: data.user.id, full_name: email.split('@')[0], email: data.user.email },
          ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      signIn,
      signOut,
      signUp,
      isFirstUser,
      isSystemOwner,
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
