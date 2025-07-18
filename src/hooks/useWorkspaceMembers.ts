import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { WorkspaceMember } from '@/types/workspaceMember';

export const useWorkspaceMembers = (workspaceId?: string) => {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMembers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('workspace_members')
        .select('*');
      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }
      const { data, error } = await query.order('joined_at');
      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error loading workspace members:', error);
      toast.error('Failed to load workspace members');
    } finally {
      setLoading(false);
    }
  };

  const createMember = async (member: Omit<WorkspaceMember, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .insert([{ ...member }])
        .select();
      if (error) throw error;
      toast.success('Workspace member added');
      loadMembers();
      return data?.[0] as WorkspaceMember;
    } catch (error) {
      console.error('Error adding workspace member:', error);
      toast.error('Failed to add workspace member');
      return null;
    }
  };

  const updateMember = async (id: string, updates: Partial<WorkspaceMember>) => {
    try {
      const { error } = await supabase
        .from('workspace_members')
        .update({ ...updates })
        .eq('id', id);
      if (error) throw error;
      toast.success('Workspace member updated');
      loadMembers();
      return true;
    } catch (error) {
      console.error('Error updating workspace member:', error);
      toast.error('Failed to update workspace member');
      return false;
    }
  };

  const deleteMember = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Workspace member removed');
      loadMembers();
      return true;
    } catch (error) {
      console.error('Error removing workspace member:', error);
      toast.error('Failed to remove workspace member');
      return false;
    }
  };

  useEffect(() => {
    loadMembers();
    const subscription = supabase
      .channel('workspace_members_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workspace_members'
        },
        () => {
          loadMembers();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [workspaceId]);

  return {
    members,
    loading,
    refreshMembers: loadMembers,
    createMember,
    updateMember,
    deleteMember
  };
}; 