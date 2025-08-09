import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Enterprise, EnterpriseContextType } from '@/types/enterprise';

const EnterpriseContext = createContext<EnterpriseContextType | undefined>(undefined);

interface EnterpriseProviderProps {
  children: ReactNode;
}

export const EnterpriseProvider: React.FC<EnterpriseProviderProps> = ({ children }) => {
  const [currentEnterprise, setCurrentEnterprise] = useState<Enterprise | null>(null);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isSystemOwner } = useAuth();

  const fetchEnterprises = async () => {
    if (!user) {
      setEnterprises([]);
      setCurrentEnterprise(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch enterprises for the current user
      const { data: enterpriseData, error: enterpriseError } = await supabase
        .from('enterprises')
        .select('*')
        .order('created_at', { ascending: false });

      if (enterpriseError) {
        throw enterpriseError;
      }

      const mappedEnterprises: Enterprise[] = (enterpriseData || []).map(e => ({
        ...e,
        settings: typeof e.settings === 'string' ? JSON.parse(e.settings) : (e.settings || {})
      }));
      
      setEnterprises(mappedEnterprises);

      // Set current enterprise if not already set
      if (!currentEnterprise && mappedEnterprises.length > 0) {
        setCurrentEnterprise(mappedEnterprises[0]);
      }
    } catch (err) {
      console.error('Error fetching enterprises:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch enterprises');
    } finally {
      setLoading(false);
    }
  };

  const createEnterprise = async (name: string, description?: string): Promise<Enterprise | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc('create_enterprise_with_owner', {
        enterprise_name: name,
        enterprise_description: description
      });

      if (error) throw error;

      // Fetch the created enterprise
      const { data: enterpriseData, error: fetchError } = await supabase
        .from('enterprises')
        .select('*')
        .eq('id', data)
        .single();

      if (fetchError) throw fetchError;

      const mappedEnterprise: Enterprise = {
        ...enterpriseData,
        settings: typeof enterpriseData.settings === 'string' ? JSON.parse(enterpriseData.settings) : (enterpriseData.settings || {})
      };

      await refreshEnterprises();
      return mappedEnterprise;
    } catch (err) {
      console.error('Error creating enterprise:', err);
      setError(err instanceof Error ? err.message : 'Failed to create enterprise');
      return null;
    }
  };

  const updateEnterprise = async (id: string, updates: Partial<Enterprise>) => {
    try {
      const { error } = await supabase
        .from('enterprises')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await refreshEnterprises();
    } catch (err) {
      console.error('Error updating enterprise:', err);
      setError(err instanceof Error ? err.message : 'Failed to update enterprise');
    }
  };

  const refreshEnterprises = async () => {
    await fetchEnterprises();
  };

  // Fetch enterprises when user changes
  useEffect(() => {
    fetchEnterprises();
  }, [user]);

  return (
    <EnterpriseContext.Provider
      value={{
        currentEnterprise,
        enterprises,
        loading,
        error,
        setCurrentEnterprise,
        refreshEnterprises,
        createEnterprise,
        updateEnterprise,
      }}
    >
      {children}
    </EnterpriseContext.Provider>
  );
};

export const useEnterprise = (): EnterpriseContextType => {
  const context = useContext(EnterpriseContext);
  if (context === undefined) {
    throw new Error('useEnterprise must be used within an EnterpriseProvider');
  }
  return context;
};