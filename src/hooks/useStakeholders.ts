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
        const mappedData = data?.map(item => ({
          ...item,
          department: item.department || '',
          phone: item.phone || '',
          communicationPreference: item.communication_preference || 'Email',
          projects: item.projects || []
        })) || [];
        
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
        .insert([stakeholder])
        .select()
        .single();

      if (error) {
        console.error('Error creating stakeholder:', error);
        throw error;
      }

      setStakeholders(prevStakeholders => [...prevStakeholders, data]);
      return data;
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
    updateStakeholder,
    deleteStakeholder
  };
};
