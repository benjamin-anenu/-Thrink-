import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Stakeholder } from '@/types/stakeholder';

export const useStakeholders = () => {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    const fetchStakeholders = async () => {
      if (!currentWorkspace?.id) {
        setStakeholders([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('stakeholders')
          .select('*')
          .eq('workspace_id', currentWorkspace.id)
          .order('name');

        if (error) throw error;
        
        // Map database fields to match Stakeholder interface
        const mappedData: Stakeholder[] = (data || []).map(item => ({
          id: item.id,
          workspace_id: item.workspace_id,
          name: item.name,
          email: item.email || '',
          role: item.role || '',
          department: item.department || '',
          phone: item.phone || '',
          communicationPreference: item.communication_preference || 'Email',
          projects: item.projects || [],
          influence: item.influence || 'medium',
          interest: item.interest || 'medium',
          status: 'active', // Default since it's required
          notes: item.notes || '',
          created_at: item.created_at,
          updated_at: item.updated_at
        }));
        
        setStakeholders(mappedData);
      } catch (error) {
        console.error('Error fetching stakeholders:', error);
        setStakeholders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStakeholders();
  }, [currentWorkspace?.id]);

  const createStakeholder = async (stakeholder: Omit<Stakeholder, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('stakeholders')
        .insert([{
          workspace_id: stakeholder.workspace_id,
          name: stakeholder.name,
          email: stakeholder.email,
          role: stakeholder.role,
          department: stakeholder.department,
          phone: stakeholder.phone,
          communication_preference: stakeholder.communicationPreference,
          projects: stakeholder.projects,
          influence: stakeholder.influence,
          interest: stakeholder.interest,
          notes: stakeholder.notes
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating stakeholder:', error);
        throw error;
      }

      const newStakeholder: Stakeholder = {
        id: data.id,
        workspace_id: data.workspace_id,
        name: data.name,
        email: data.email || '',
        role: data.role || '',
        department: data.department || '',
        phone: data.phone || '',
        communicationPreference: data.communication_preference || 'Email',
        projects: data.projects || [],
        influence: data.influence || 'medium',
        interest: data.interest || 'medium',
        status: 'active',
        notes: data.notes || '',
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setStakeholders(prevStakeholders => [...prevStakeholders, newStakeholder]);
      return newStakeholder;
    } catch (error) {
      console.error('Error creating stakeholder:', error);
      throw error;
    }
  };

  const updateStakeholder = async (id: string, updates: Partial<Stakeholder>) => {
    try {
      const { data, error } = await supabase
        .from('stakeholders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating stakeholder:', error);
        throw error;
      }

      setStakeholders(prevStakeholders =>
        prevStakeholders.map(stakeholder => (stakeholder.id === id ? { ...stakeholder, ...data } : stakeholder))
      );
      return data;
    } catch (error) {
      console.error('Error updating stakeholder:', error);
      throw error;
    }
  };

  const deleteStakeholder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('stakeholders')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting stakeholder:', error);
        throw error;
      }

      setStakeholders(prevStakeholders => prevStakeholders.filter(stakeholder => stakeholder.id !== id));
    } catch (error) {
      console.error('Error deleting stakeholder:', error);
      throw error;
    }
  };

  return {
    stakeholders,
    loading,
    createStakeholder,
    updateStakeholder: async () => {},
    deleteStakeholder: async () => {}
  };
};
