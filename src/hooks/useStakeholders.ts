
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Stakeholder } from '@/types/stakeholder';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export const useStakeholders = (workspaceId?: string) => {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  const loadStakeholders = async () => {
    try {
      setLoading(true);
      const targetWorkspaceId = workspaceId || currentWorkspace?.id;
      
      if (!targetWorkspaceId) {
        console.log('No workspace ID available, skipping stakeholder load');
        setStakeholders([]);
        return;
      }

      let query = supabase
        .from('stakeholders')
        .select('*')
        .eq('workspace_id', targetWorkspaceId);
        
      const { data, error } = await query.order('name');
      if (error) throw error;
      
      // Map database fields to interface fields
      const mappedData = (data || []).map(item => ({
        id: item.id,
        workspace_id: item.workspace_id || '',
        name: item.name || '',
        email: item.email || '',
        role: item.role || '',
        influence: (item.influence_level as 'low' | 'medium' | 'high' | 'critical') || 'medium',
        interest: 'medium' as 'low' | 'medium' | 'high' | 'critical',
        status: 'active' as 'active' | 'inactive' | 'pending',
        notes: item.notes || '',
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
      const targetWorkspaceId = stakeholder.workspace_id || currentWorkspace?.id;
      
      if (!targetWorkspaceId || targetWorkspaceId === 'default-workspace') {
        toast.error('Valid workspace required to create stakeholder');
        return null;
      }

      // Only send fields that exist in the database
      const dbData = {
        name: stakeholder.name,
        email: stakeholder.email,
        role: stakeholder.role,
        workspace_id: targetWorkspaceId,
        influence_level: stakeholder.influence,
        notes: stakeholder.notes || '',
      };
      
      const { data, error } = await supabase
        .from('stakeholders')
        .insert([dbData])
        .select();
      if (error) throw error;
      toast.success('Stakeholder created');
      loadStakeholders();
      
      // Map response back to interface
      const mappedResult = data?.[0] ? {
        id: data[0].id,
        workspace_id: data[0].workspace_id,
        name: data[0].name,
        email: data[0].email,
        role: data[0].role,
        influence: (data[0].influence_level as 'low' | 'medium' | 'high' | 'critical') || 'medium',
        interest: 'medium' as 'low' | 'medium' | 'high' | 'critical',
        status: 'active' as 'active' | 'inactive' | 'pending',
        notes: data[0].notes || '',
        created_at: data[0].created_at,
        updated_at: data[0].updated_at,
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
      // Only send fields that exist in the database
      const dbUpdates: any = {};
      
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.role) dbUpdates.role = updates.role;
      if (updates.influence) dbUpdates.influence_level = updates.influence;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      
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
  }, [workspaceId, currentWorkspace?.id]);

  return {
    stakeholders,
    loading,
    refreshStakeholders: loadStakeholders,
    createStakeholder,
    updateStakeholder,
    deleteStakeholder
  };
};
