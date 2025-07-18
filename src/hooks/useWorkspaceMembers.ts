
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
      
      // Map database fields to interface fields with defaults for missing profile data
      const mappedData = (data || []).map(item => ({
        ...item,
        email: '', // Default since profiles relation isn't working
        name: 'Unknown User', // Default since profiles relation isn't working
        role: (['owner', 'admin', 'member', 'viewer'].includes(item.role || '')) 
          ? item.role as 'owner' | 'admin' | 'member' | 'viewer'
          : 'member' as const,
        status: item.status || 'active',
        workspace_id: item.workspace_id || '',
        user_id: item.user_id || '',
        created_at: item.created_at || '',
        updated_at: item.updated_at || '',
      }));
      
      setMembers(mappedData);
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
      
      const mappedResult = data?.[0] ? {
        ...data[0],
        email: '', // Default since profiles relation isn't working
        name: 'Unknown User', // Default since profiles relation isn't working
        role: (['owner', 'admin', 'member', 'viewer'].includes(data[0].role || '')) 
          ? data[0].role as 'owner' | 'admin' | 'member' | 'viewer'
          : 'member' as const,
      } : null;
      
      return mappedResult as WorkspaceMember;
    } catch (error) {
      console.error('Error adding workspace member:', error);
      toast.error('Failed to add workspace member');
      return null;
    }
  };

  const updateMember = async (id: string, updates: Partial<WorkspaceMember>) => {
    try {
      // Remove fields that don't exist in the database table
      const dbUpdates = { ...updates };
      delete dbUpdates.email;
      delete dbUpdates.name;
      
      const { error } = await supabase
        .from('workspace_members')
        .update(dbUpdates)
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
