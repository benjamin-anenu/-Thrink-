
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Stakeholder {
  id: string;
  name: string;
  email?: string;
  role?: string;
  organization?: string;
  influence_level?: string;
  project_id?: string;
  workspace_id?: string;
  escalation_level?: number;
  contact_info?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

interface StakeholderContextType {
  stakeholders: Stakeholder[];
  loading: boolean;
  error: string | null;
  createStakeholder: (stakeholder: Omit<Stakeholder, 'id' | 'created_at' | 'updated_at'>) => Promise<Stakeholder>;
  updateStakeholder: (id: string, updates: Partial<Stakeholder>) => Promise<void>;
  deleteStakeholder: (id: string) => Promise<void>;
  refreshStakeholders: () => Promise<void>;
}

const StakeholderContext = createContext<StakeholderContextType | undefined>(undefined);

export const useStakeholders = () => {
  const context = useContext(StakeholderContext);
  if (!context) {
    throw new Error('useStakeholders must be used within a StakeholderProvider');
  }
  return context;
};

interface StakeholderProviderProps {
  children: ReactNode;
}

export const StakeholderProvider: React.FC<StakeholderProviderProps> = ({ children }) => {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStakeholders = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('stakeholders')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setStakeholders(data || []);
    } catch (err) {
      console.error('Error fetching stakeholders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stakeholders');
    } finally {
      setLoading(false);
    }
  };

  const createStakeholder = async (stakeholderData: Omit<Stakeholder, 'id' | 'created_at' | 'updated_at'>): Promise<Stakeholder> => {
    try {
      const { data, error: createError } = await supabase
        .from('stakeholders')
        .insert([stakeholderData])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      const newStakeholder = data as Stakeholder;
      setStakeholders(prev => [newStakeholder, ...prev]);
      return newStakeholder;
    } catch (err) {
      console.error('Error creating stakeholder:', err);
      throw err;
    }
  };

  const updateStakeholder = async (id: string, updates: Partial<Stakeholder>): Promise<void> => {
    try {
      const { error: updateError } = await supabase
        .from('stakeholders')
        .update(updates)
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      setStakeholders(prev => 
        prev.map(stakeholder => 
          stakeholder.id === id ? { ...stakeholder, ...updates } : stakeholder
        )
      );
    } catch (err) {
      console.error('Error updating stakeholder:', err);
      throw err;
    }
  };

  const deleteStakeholder = async (id: string): Promise<void> => {
    try {
      const { error: deleteError } = await supabase
        .from('stakeholders')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      setStakeholders(prev => prev.filter(stakeholder => stakeholder.id !== id));
    } catch (err) {
      console.error('Error deleting stakeholder:', err);
      throw err;
    }
  };

  const refreshStakeholders = async () => {
    await fetchStakeholders();
  };

  useEffect(() => {
    fetchStakeholders();
  }, []);

  const contextValue: StakeholderContextType = {
    stakeholders,
    loading,
    error,
    createStakeholder,
    updateStakeholder,
    deleteStakeholder,
    refreshStakeholders
  };

  return (
    <StakeholderContext.Provider value={contextValue}>
      {children}
    </StakeholderContext.Provider>
  );
};
