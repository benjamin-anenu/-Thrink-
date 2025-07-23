
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
    if (!currentWorkspace?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('escalation_triggers')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTriggers(data || []);
    } catch (error) {
      console.error('Error loading escalation triggers:', error);
      toast.error('Failed to load escalation triggers');
    } finally {
      setLoading(false);
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

  useEffect(() => {
    loadTriggers();
  }, [currentWorkspace?.id]);

  return {
    triggers,
    loading,
    updateTrigger,
    refreshTriggers: loadTriggers
  };
};
