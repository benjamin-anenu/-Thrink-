
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
          communicationPreference: (item.communication_preference || 'Email') as 'Email' | 'Phone' | 'Slack' | 'In-person',
          projects: item.projects || [],
          influence: (item.influence || 'medium') as 'low' | 'medium' | 'high' | 'critical',
          interest: (item.interest || 'medium') as 'low' | 'medium' | 'high' | 'critical',
          status: 'active' as const, // Default since it's required
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
        communicationPreference: (data.communication_preference || 'Email') as 'Email' | 'Phone' | 'Slack' | 'In-person',
        projects: data.projects || [],
        influence: (data.influence || 'medium') as 'low' | 'medium' | 'high' | 'critical',
        interest: (data.interest || 'medium') as 'low' | 'medium' | 'high' | 'critical',
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
        .update({
          name: updates.name,
          email: updates.email,
          role: updates.role,
          department: updates.department,
          phone: updates.phone,
          communication_preference: updates.communicationPreference,
          projects: updates.projects,
          influence: updates.influence,
          interest: updates.interest,
          notes: updates.notes
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating stakeholder:', error);
        throw error;
      }

      const updatedStakeholder: Stakeholder = {
        id: data.id,
        workspace_id: data.workspace_id,
        name: data.name,
        email: data.email || '',
        role: data.role || '',
        department: data.department || '',
        phone: data.phone || '',
        communicationPreference: (data.communication_preference || 'Email') as 'Email' | 'Phone' | 'Slack' | 'In-person',
        projects: data.projects || [],
        influence: (data.influence || 'medium') as 'low' | 'medium' | 'high' | 'critical',
        interest: (data.interest || 'medium') as 'low' | 'medium' | 'high' | 'critical',
        status: 'active',
        notes: data.notes || '',
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setStakeholders(prevStakeholders =>
        prevStakeholders.map(stakeholder => (stakeholder.id === id ? updatedStakeholder : stakeholder))
      );
      return updatedStakeholder;
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
    updateStakeholder,
    deleteStakeholder
  };
};
