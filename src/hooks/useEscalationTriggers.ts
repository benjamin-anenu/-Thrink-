
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
  created_at: string;
  updated_at: string;
}

export const useEscalationTriggers = () => {
  const [triggers, setTriggers] = useState<EscalationTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  const loadTriggers = async () => {
    try {
      setLoading(true);
      
      // Load both global triggers (workspace_id IS NULL) and workspace-specific triggers
      const { data, error } = await supabase
        .from('escalation_triggers')
        .select('*')
        .or(`workspace_id.is.null,workspace_id.eq.${currentWorkspace?.id || 'null'}`)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      // If we have a workspace, assign workspace_id to global triggers for local management
      const processedTriggers = data?.map(trigger => ({
        ...trigger,
        workspace_id: trigger.workspace_id || currentWorkspace?.id || ''
      })) || [];
      
      setTriggers(processedTriggers);
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
    threshold_unit: string
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
