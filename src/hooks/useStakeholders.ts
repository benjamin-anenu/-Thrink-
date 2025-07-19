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
  notes?: string;
  projects?: string[];
  avatar?: string;
  workspace_id?: string;
  status?: string;
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
      
      // Map database fields to interface fields - using actual database fields
      const mappedData = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        role: item.role,
        organization: item.organization,
        department: item.department, // Direct field from database
        phone: item.phone, // Direct field from database
        influence: item.influence, // Direct field from database
        interest: item.interest, // Direct field from database
        communication_preference: item.communication_preference, // Direct field from database
        notes: item.notes, // Direct field from database
        projects: item.projects, // Direct field from database
        avatar: item.avatar, // Direct field from database
        workspace_id: item.workspace_id,
        status: 'active', // Default value for compatibility
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
        department: data[0].department, // Direct field from database
        phone: data[0].phone, // Direct field from database
        influence: data[0].influence, // Direct field from database
        interest: data[0].interest, // Direct field from database
        communication_preference: data[0].communication_preference, // Direct field from database
        notes: data[0].notes, // Direct field from database
        projects: data[0].projects, // Direct field from database
        avatar: data[0].avatar, // Direct field from database
        workspace_id: data[0].workspace_id,
        status: 'active', // Default value for compatibility
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
