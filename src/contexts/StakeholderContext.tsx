import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './WorkspaceContext';
import { toast } from 'sonner';

export interface Stakeholder {
  id: string;
  name: string;
  email?: string;
  role?: string;
  organization?: string;
  influence_level?: string;
  project_id?: string;
  workspace_id?: string;
  created_at: string;
  updated_at: string;
  // Extended properties for UI components
  department?: string;
  phone?: string;
  communicationPreference?: 'Email' | 'Phone' | 'Slack' | 'In-person';
  influence?: 'High' | 'Medium' | 'Low';
  interest?: 'High' | 'Medium' | 'Low';
  projects?: string[];
  status?: string;
  lastContact?: string;
}

interface StakeholderContextType {
  stakeholders: Stakeholder[];
  loading: boolean;
  addStakeholder: (stakeholder: Omit<Stakeholder, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateStakeholder: (id: string, updates: Partial<Stakeholder>) => Promise<void>;
  deleteStakeholder: (id: string) => Promise<void>;
  refreshStakeholders: () => Promise<void>;
}

const StakeholderContext = createContext<StakeholderContextType | undefined>(undefined);

export const useStakeholder = () => {
  const context = useContext(StakeholderContext);
  if (!context) {
    throw new Error('useStakeholder must be used within a StakeholderProvider');
  }
  return context;
};

// Also export as useStakeholders for backward compatibility
export const useStakeholders = useStakeholder;

export const StakeholderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  const loadStakeholders = async () => {
    if (!currentWorkspace?.id) {
      setStakeholders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stakeholders')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('name');

      if (error) throw error;

      const transformedStakeholders = (data || []).map(stakeholder => ({
        id: stakeholder.id,
        name: stakeholder.name,
        email: stakeholder.email || undefined,
        role: stakeholder.role || undefined,
        organization: stakeholder.organization || undefined,
        influence_level: stakeholder.influence_level || undefined,
        project_id: stakeholder.project_id || undefined,
        workspace_id: stakeholder.workspace_id || undefined,
        created_at: stakeholder.created_at,
        updated_at: stakeholder.updated_at,
        // Default values for extended properties
        department: stakeholder.organization || '',
        phone: '',
        communicationPreference: 'Email' as const,
        influence: 'Medium' as const,
        interest: 'Medium' as const,
        projects: [],
        status: 'Active',
        lastContact: new Date().toISOString().split('T')[0]
      }));

      setStakeholders(transformedStakeholders);
    } catch (error) {
      console.error('Error loading stakeholders:', error);
      toast.error('Failed to load stakeholders');
      setStakeholders([]);
    } finally {
      setLoading(false);
    }
  };

  const addStakeholder = async (stakeholderData: Omit<Stakeholder, 'id' | 'created_at' | 'updated_at'>) => {
    if (!currentWorkspace?.id) {
      toast.error('No workspace selected');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('stakeholders')
        .insert({
          name: stakeholderData.name,
          email: stakeholderData.email,
          role: stakeholderData.role,
          organization: stakeholderData.organization,
          influence_level: stakeholderData.influence_level,
          project_id: stakeholderData.project_id,
          workspace_id: currentWorkspace.id
        })
        .select()
        .single();

      if (error) throw error;

      const newStakeholder: Stakeholder = {
        id: data.id,
        name: data.name,
        email: data.email || undefined,
        role: data.role || undefined,
        organization: data.organization || undefined,
        influence_level: data.influence_level || undefined,
        project_id: data.project_id || undefined,
        workspace_id: data.workspace_id || undefined,
        created_at: data.created_at,
        updated_at: data.updated_at,
        department: stakeholderData.department || data.organization || '',
        phone: stakeholderData.phone || '',
        communicationPreference: stakeholderData.communicationPreference || 'Email',
        influence: stakeholderData.influence || 'Medium',
        interest: stakeholderData.interest || 'Medium',
        projects: stakeholderData.projects || [],
        status: stakeholderData.status || 'Active',
        lastContact: stakeholderData.lastContact || new Date().toISOString().split('T')[0]
      };

      setStakeholders(prev => [...prev, newStakeholder]);
      toast.success('Stakeholder added successfully');
    } catch (error) {
      console.error('Error adding stakeholder:', error);
      toast.error('Failed to add stakeholder');
      throw error;
    }
  };

  const updateStakeholder = async (id: string, updates: Partial<Stakeholder>) => {
    try {
      const { data, error } = await supabase
        .from('stakeholders')
        .update({
          name: updates.name,
          email: updates.email,
          role: updates.role,
          organization: updates.organization,
          influence_level: updates.influence_level,
          project_id: updates.project_id
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedStakeholder: Stakeholder = {
        id: data.id,
        name: data.name,
        email: data.email || undefined,
        role: data.role || undefined,
        organization: data.organization || undefined,
        influence_level: data.influence_level || undefined,
        project_id: data.project_id || undefined,
        workspace_id: data.workspace_id || undefined,
        created_at: data.created_at,
        updated_at: data.updated_at,
        department: updates.department || data.organization || '',
        phone: updates.phone || '',
        communicationPreference: updates.communicationPreference || 'Email',
        influence: updates.influence || 'Medium',
        interest: updates.interest || 'Medium',
        projects: updates.projects || [],
        status: updates.status || 'Active',
        lastContact: updates.lastContact || new Date().toISOString().split('T')[0]
      };

      setStakeholders(prev => prev.map(stakeholder => 
        stakeholder.id === id ? updatedStakeholder : stakeholder
      ));
      toast.success('Stakeholder updated successfully');
    } catch (error) {
      console.error('Error updating stakeholder:', error);
      toast.error('Failed to update stakeholder');
      throw error;
    }
  };

  const deleteStakeholder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('stakeholders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStakeholders(prev => prev.filter(stakeholder => stakeholder.id !== id));
      toast.success('Stakeholder deleted successfully');
    } catch (error) {
      console.error('Error deleting stakeholder:', error);
      toast.error('Failed to delete stakeholder');
      throw error;
    }
  };

  useEffect(() => {
    loadStakeholders();

    const subscription = supabase
      .channel('stakeholders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stakeholders'
        },
        () => {
          loadStakeholders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentWorkspace?.id]);

  const value: StakeholderContextType = {
    stakeholders,
    loading,
    addStakeholder,
    updateStakeholder,
    deleteStakeholder,
    refreshStakeholders: loadStakeholders
  };

  return (
    <StakeholderContext.Provider value={value}>
      {children}
    </StakeholderContext.Provider>
  );
};
