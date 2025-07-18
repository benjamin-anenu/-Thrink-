
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Stakeholder } from '@/types/stakeholder';

export const useStakeholders = (workspaceId?: string) => {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStakeholders = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('stakeholders')
        .select('*');
      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }
      const { data, error } = await query.order('name');
      if (error) throw error;
      
      // Map database fields to interface fields
      const mappedData = (data || []).map(item => ({
        ...item,
        influence: (item.influence_level as 'low' | 'medium' | 'high' | 'critical') || 'medium',
        interest: 'medium' as 'low' | 'medium' | 'high' | 'critical', // Default value since not in DB
        status: 'active' as 'active' | 'inactive' | 'pending', // Default value since not in DB
        workspace_id: item.workspace_id || '',
        name: item.name || '',
        email: item.email || '',
        role: item.role || '',
        created_at: item.created_at || '',
        updated_at: item.updated_at || '',
      }));
      
      setStakeholders(mappedData);
    } catch (error) {
      console.error('Error loading stakeholders:', error);
      toast.error('Failed to load stakeholders');
    } finally {
      setLoading(false);
    }
  };

  const createStakeholder = async (stakeholder: Omit<Stakeholder, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const dbData = {
        ...stakeholder,
        influence_level: stakeholder.influence,
        // Remove interface-only fields that don't exist in DB
      };
      delete dbData.influence;
      delete dbData.interest;
      delete dbData.status;
      delete dbData.notes;
      
      const { data, error } = await supabase
        .from('stakeholders')
        .insert([dbData])
        .select();
      if (error) throw error;
      toast.success('Stakeholder created');
      loadStakeholders();
      
      // Map response back to interface
      const mappedResult = data?.[0] ? {
        ...data[0],
        influence: (data[0].influence_level as 'low' | 'medium' | 'high' | 'critical') || 'medium',
        interest: 'medium' as 'low' | 'medium' | 'high' | 'critical',
        status: 'active' as 'active' | 'inactive' | 'pending',
      } : null;
      
      return mappedResult as Stakeholder;
    } catch (error) {
      console.error('Error creating stakeholder:', error);
      toast.error('Failed to create stakeholder');
      return null;
    }
  };

  const updateStakeholder = async (id: string, updates: Partial<Stakeholder>) => {
    try {
      const dbUpdates = { ...updates };
      if (updates.influence) {
        dbUpdates.influence_level = updates.influence;
        delete dbUpdates.influence;
      }
      // Remove interface-only fields
      delete dbUpdates.interest;
      delete dbUpdates.status;
      delete dbUpdates.notes;
      
      const { error } = await supabase
        .from('stakeholders')
        .update(dbUpdates)
        .eq('id', id);
      if (error) throw error;
      toast.success('Stakeholder updated');
      loadStakeholders();
      return true;
    } catch (error) {
      console.error('Error updating stakeholder:', error);
      toast.error('Failed to update stakeholder');
      return false;
    }
  };

  const deleteStakeholder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('stakeholders')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Stakeholder deleted');
      loadStakeholders();
      return true;
    } catch (error) {
      console.error('Error deleting stakeholder:', error);
      toast.error('Failed to delete stakeholder');
      return false;
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
  }, [workspaceId]);

  return {
    stakeholders,
    loading,
    refreshStakeholders: loadStakeholders,
    createStakeholder,
    updateStakeholder,
    deleteStakeholder
  };
};
