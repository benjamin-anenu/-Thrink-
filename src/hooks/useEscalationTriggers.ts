
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EscalationTrigger {
  id: string;
  name: string;
  description?: string;
  condition_type: string;
  threshold_value?: number;
  threshold_unit?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export const useEscalationTriggers = () => {
  const [triggers, setTriggers] = useState<EscalationTrigger[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTriggers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('escalation_triggers')
        .select('*')
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
      toast.success('Trigger updated successfully');
      loadTriggers();
    } catch (error) {
      console.error('Error updating trigger:', error);
      toast.error('Failed to update trigger');
      throw error;
    }
  };

  useEffect(() => {
    loadTriggers();
  }, []);

  return {
    triggers,
    loading,
    updateTrigger,
    refreshTriggers: loadTriggers
  };
};
