import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Stakeholder {
  id: string;
  name: string;
  email?: string;
  role?: string;
  organization?: string;
  influence_level?: string;
  project_id?: string;
  workspace_id?: string;
  created_at: string;
  updated_at: string;
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

      const { data, error } = await query.order('name');

      if (error) throw error;

      setStakeholders(data || []);
    } catch (error) {
      console.error('Error loading stakeholders:', error);
      toast.error('Failed to load stakeholders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStakeholders();

    // Set up real-time subscription
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
    refreshStakeholders: loadStakeholders
  };
};