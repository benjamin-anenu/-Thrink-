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
      const mappedData = (data || []).map(item => {
        const contactInfo = (item.contact_info as { department?: string; phone?: string }) || {};
        return {
          id: item.id,
          workspace_id: item.workspace_id || '',
          name: item.name || '',
          email: item.email || '',
          role: item.role || '',
          department: contactInfo.department || '',
          phone: contactInfo.phone || '',
          communicationPreference: (item.communication_preference as 'Email' | 'Phone' | 'Slack' | 'In-person') || 'Email',
          projects: item.projects || [],
          influence: (item.influence_level as 'low' | 'medium' | 'high' | 'critical') || 'medium',
          interest: 'medium' as 'low' | 'medium' | 'high' | 'critical',
          status: 'active' as 'active' | 'inactive' | 'pending',
          notes: item.notes || '',
          created_at: item.created_at || '',
          updated_at: item.updated_at || '',
        };
      });
      
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

      // Map interface fields to database fields
      const dbData = {
        name: stakeholder.name,
        email: stakeholder.email,
        role: stakeholder.role,
        workspace_id: targetWorkspaceId,
        influence_level: stakeholder.influence,
        projects: stakeholder.projects || [],
        notes: stakeholder.notes || '',
        communication_preference: stakeholder.communicationPreference || 'Email',
        contact_info: {
          department: stakeholder.department || '',
          phone: stakeholder.phone || ''
        }
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
        department: ((data[0].contact_info as { department?: string }) || {}).department || '',
        phone: ((data[0].contact_info as { phone?: string }) || {}).phone || '',
        communicationPreference: (data[0].communication_preference as 'Email' | 'Phone' | 'Slack' | 'In-person') || 'Email',
        projects: data[0].projects || [],
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
      // Map interface fields to database fields
      const dbUpdates: any = {};
      
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.role) dbUpdates.role = updates.role;
      if (updates.projects) dbUpdates.projects = updates.projects;
      if (updates.influence) dbUpdates.influence_level = updates.influence;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.communicationPreference) dbUpdates.communication_preference = updates.communicationPreference;
      
      // Handle contact_info updates
      if (updates.department !== undefined || updates.phone !== undefined) {
        // Get current contact_info first
        const { data: current } = await supabase
          .from('stakeholders')
          .select('contact_info')
          .eq('id', id)
          .single();
        
        const currentContactInfo = (current?.contact_info as { department?: string; phone?: string }) || {};
        dbUpdates.contact_info = {
          ...currentContactInfo,
          ...(updates.department !== undefined && { department: updates.department }),
          ...(updates.phone !== undefined && { phone: updates.phone })
        };
      }
      
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
