
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Stakeholder {
  id: string;
  name: string;
  email?: string;
  role?: string;
  organization?: string;
  department?: string;
  phone?: string;
  influence?: string;
  interest?: string;
  communication_preference?: string;
  escalation_level?: number;
  notes?: string;
  projects?: string[];
  avatar?: string;
  influence_level?: string;
  contact_info?: any;
  project_id?: string;
  workspace_id?: string;
  created_at?: string;
  updated_at?: string;
}

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
      const { data, error } = await query.order('created_at');
      if (error) throw error;
      
      // Map database fields to interface fields
      const mappedData = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        role: item.role,
        organization: item.organization,
        department: item.department,
        phone: item.phone,
        influence: item.influence,
        interest: item.interest,
        communication_preference: item.communication_preference,
        escalation_level: item.escalation_level,
        notes: item.notes,
        projects: item.projects,
        avatar: item.avatar,
        influence_level: item.influence_level,
        contact_info: item.contact_info,
        project_id: item.project_id,
        workspace_id: item.workspace_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
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
      const { data, error } = await supabase
        .from('stakeholders')
        .insert([stakeholder])
        .select();
      if (error) throw error;
      toast.success('Stakeholder created successfully');
      loadStakeholders();
      return data?.[0] ? {
        id: data[0].id,
        name: data[0].name,
        email: data[0].email,
        role: data[0].role,
        organization: data[0].organization,
        department: data[0].department,
        phone: data[0].phone,
        influence: data[0].influence,
        interest: data[0].interest,
        communication_preference: data[0].communication_preference,
        escalation_level: data[0].escalation_level,
        notes: data[0].notes,
        projects: data[0].projects,
        avatar: data[0].avatar,
        influence_level: data[0].influence_level,
        contact_info: data[0].contact_info,
        project_id: data[0].project_id,
        workspace_id: data[0].workspace_id,
        created_at: data[0].created_at,
        updated_at: data[0].updated_at,
      } : null;
    } catch (error) {
      console.error('Error creating stakeholder:', error);
      toast.error('Failed to create stakeholder');
      return null;
    }
  };

  const updateStakeholder = async (id: string, updates: Partial<Stakeholder>) => {
    try {
      const { error } = await supabase
        .from('stakeholders')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
      toast.success('Stakeholder updated successfully');
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
      toast.success('Stakeholder deleted successfully');
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
