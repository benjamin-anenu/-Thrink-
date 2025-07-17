
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
  department?: string;
  phone?: string;
  communicationPreference?: string;
  influence?: string;
  interest?: string;
  availability?: string;
  projects?: string[];
  status?: string;
  lastContact?: string;
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
  addStakeholder: (stakeholder: Omit<Stakeholder, 'id' | 'created_at' | 'updated_at'>) => Promise<Stakeholder>;
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

      // Map the database fields to the extended Stakeholder interface
      const mappedStakeholders: Stakeholder[] = (data || []).map(stakeholder => ({
        id: stakeholder.id,
        name: stakeholder.name,
        email: stakeholder.email,
        role: stakeholder.role,
        organization: stakeholder.organization,
        influence_level: stakeholder.influence_level,
        project_id: stakeholder.project_id,
        workspace_id: stakeholder.workspace_id,
        escalation_level: stakeholder.escalation_level,
        contact_info: typeof stakeholder.contact_info === 'object' && stakeholder.contact_info !== null ? stakeholder.contact_info as Record<string, any> : {},
        department: stakeholder.role || '',
        phone: '',
        communicationPreference: 'Email',
        influence: stakeholder.influence_level || 'Medium',
        interest: 'Medium',
        availability: 'Available',
        projects: [],
        status: 'Active',
        lastContact: new Date().toISOString().split('T')[0],
        created_at: stakeholder.created_at,
        updated_at: stakeholder.updated_at
      }));

      setStakeholders(mappedStakeholders);
    } catch (err) {
      console.error('Error fetching stakeholders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stakeholders');
    } finally {
      setLoading(false);
    }
  };

  const createStakeholder = async (stakeholderData: Omit<Stakeholder, 'id' | 'created_at' | 'updated_at'>): Promise<Stakeholder> => {
    try {
      // Only send basic fields to the database
      const basicStakeholderData = {
        name: stakeholderData.name,
        email: stakeholderData.email,
        role: stakeholderData.role,
        organization: stakeholderData.organization,
        influence_level: stakeholderData.influence_level || stakeholderData.influence,
        project_id: stakeholderData.project_id,
        workspace_id: stakeholderData.workspace_id,
        escalation_level: stakeholderData.escalation_level,
        contact_info: stakeholderData.contact_info || {}
      };

      const { data, error: createError } = await supabase
        .from('stakeholders')
        .insert([basicStakeholderData])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Map to full Stakeholder interface
      const newStakeholder: Stakeholder = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        organization: data.organization,
        influence_level: data.influence_level,
        project_id: data.project_id,
        workspace_id: data.workspace_id,
        escalation_level: data.escalation_level,
        contact_info: typeof data.contact_info === 'object' && data.contact_info !== null ? data.contact_info as Record<string, any> : {},
        department: stakeholderData.department || data.role || '',
        phone: stakeholderData.phone || '',
        communicationPreference: stakeholderData.communicationPreference || 'Email',
        influence: stakeholderData.influence || data.influence_level || 'Medium',
        interest: stakeholderData.interest || 'Medium',
        availability: stakeholderData.availability || 'Available',
        projects: stakeholderData.projects || [],
        status: stakeholderData.status || 'Active',
        lastContact: stakeholderData.lastContact || new Date().toISOString().split('T')[0],
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setStakeholders(prev => [newStakeholder, ...prev]);
      return newStakeholder;
    } catch (err) {
      console.error('Error creating stakeholder:', err);
      throw err;
    }
  };

  const updateStakeholder = async (id: string, updates: Partial<Stakeholder>): Promise<void> => {
    try {
      // Only send basic fields to the database
      const basicUpdates = {
        name: updates.name,
        email: updates.email,
        role: updates.role,
        organization: updates.organization,
        influence_level: updates.influence_level || updates.influence,
        project_id: updates.project_id,
        workspace_id: updates.workspace_id,
        escalation_level: updates.escalation_level,
        contact_info: updates.contact_info
      };

      // Remove undefined values
      Object.keys(basicUpdates).forEach(key => {
        if (basicUpdates[key as keyof typeof basicUpdates] === undefined) {
          delete basicUpdates[key as keyof typeof basicUpdates];
        }
      });

      const { error: updateError } = await supabase
        .from('stakeholders')
        .update(basicUpdates)
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

  const addStakeholder = async (stakeholderData: Omit<Stakeholder, 'id' | 'created_at' | 'updated_at'>): Promise<Stakeholder> => {
    return createStakeholder(stakeholderData);
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
    refreshStakeholders,
    addStakeholder
  };

  return (
    <StakeholderContext.Provider value={contextValue}>
      {children}
    </StakeholderContext.Provider>
  );
};
