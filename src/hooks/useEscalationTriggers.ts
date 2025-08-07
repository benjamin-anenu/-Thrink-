
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface EscalationTrigger {
  id: string;
  name: string;
  description: string;
  condition_type: string;
  threshold_value: number;
  threshold_unit: string;
  is_active: boolean;
  workspace_id: string;
  project_id?: string;
  created_at: string;
  updated_at: string;
}

export const useEscalationTriggers = (projectId?: string) => {
  const [triggers, setTriggers] = useState<EscalationTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  const loadTriggers = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('escalation_triggers')
        .select('*')
        .eq('is_active', true);

      if (projectId) {
        // Get workspace-level and project-specific triggers
        query = query.or(`and(workspace_id.eq.${currentWorkspace?.id || 'null'},project_id.is.null),and(workspace_id.eq.${currentWorkspace?.id || 'null'},project_id.eq.${projectId})`);
      } else {
        // Get workspace-level triggers only (project_id is null)
        query = query.eq('workspace_id', currentWorkspace?.id || 'null').is('project_id', null);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      
      setTriggers(data || []);
    } catch (error) {
      console.error('Error loading escalation triggers:', error);
      toast.error('Failed to load escalation triggers');
    } finally {
      setLoading(false);
    }
  };

  const createTrigger = async (
    name: string,
    description: string,
    condition_type: string,
    threshold_value: number,
    threshold_unit: string,
    isProjectSpecific: boolean = false
  ) => {
    if (!currentWorkspace?.id) return null;

    try {
      const { data, error } = await supabase
        .from('escalation_triggers')
        .insert([{
          name,
          description,
          condition_type,
          threshold_value,
          threshold_unit,
          workspace_id: currentWorkspace.id,
          project_id: isProjectSpecific && projectId ? projectId : null,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Escalation trigger created');
      loadTriggers();
      return data;
    } catch (error) {
      console.error('Error creating escalation trigger:', error);
      toast.error('Failed to create escalation trigger');
      return null;
    }
  };

  const updateTrigger = async (id: string, updates: Partial<EscalationTrigger>) => {
    try {
      const { error } = await supabase
        .from('escalation_triggers')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Escalation trigger updated');
      loadTriggers();
      return true;
    } catch (error) {
      console.error('Error updating escalation trigger:', error);
      toast.error('Failed to update escalation trigger');
      return false;
    }
  };

  const deleteTrigger = async (id: string) => {
    try {
      // Instead of deleting, mark as inactive for data integrity
      const { error } = await supabase
        .from('escalation_triggers')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      toast.success('Escalation trigger deactivated');
      loadTriggers();
      return true;
    } catch (error) {
      console.error('Error deactivating escalation trigger:', error);
      toast.error('Failed to deactivate escalation trigger');
      return false;
    }
  };

  useEffect(() => {
    loadTriggers();
  }, [currentWorkspace?.id]);

  return {
    triggers,
    loading,
    createTrigger,
    updateTrigger,
    deleteTrigger,
    refreshTriggers: loadTriggers
  };
};
