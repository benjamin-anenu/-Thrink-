
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EscalationMatrixEntry {
  id: string;
  project_id: string;
  level: number;
  contact_name: string;
  contact_email: string;
  contact_role: string;
  issue_types: string[];
  created_at: string;
}

export const useEscalationMatrix = (projectId?: string) => {
  const [escalationMatrix, setEscalationMatrix] = useState<EscalationMatrixEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEscalationMatrix = async () => {
    if (!projectId) {
      setEscalationMatrix([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_escalation_matrix')
        .select('*')
        .eq('project_id', projectId)
        .order('level');

      if (error) throw error;
      setEscalationMatrix(data || []);
    } catch (error) {
      console.error('Error loading escalation matrix:', error);
      toast.error('Failed to load escalation matrix');
    } finally {
      setLoading(false);
    }
  };

  const createEscalationEntry = async (entry: Omit<EscalationMatrixEntry, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('project_escalation_matrix')
        .insert([entry])
        .select();

      if (error) throw error;
      toast.success('Escalation entry created');
      loadEscalationMatrix();
      return data?.[0];
    } catch (error) {
      console.error('Error creating escalation entry:', error);
      toast.error('Failed to create escalation entry');
      return null;
    }
  };

  const updateEscalationEntry = async (id: string, updates: Partial<EscalationMatrixEntry>) => {
    try {
      const { error } = await supabase
        .from('project_escalation_matrix')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Escalation entry updated');
      loadEscalationMatrix();
      return true;
    } catch (error) {
      console.error('Error updating escalation entry:', error);
      toast.error('Failed to update escalation entry');
      return false;
    }
  };

  const deleteEscalationEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_escalation_matrix')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Escalation entry deleted');
      loadEscalationMatrix();
      return true;
    } catch (error) {
      console.error('Error deleting escalation entry:', error);
      toast.error('Failed to delete escalation entry');
      return false;
    }
  };

  useEffect(() => {
    loadEscalationMatrix();
  }, [projectId]);

  return {
    escalationMatrix,
    loading,
    refreshEscalationMatrix: loadEscalationMatrix,
    createEscalationEntry,
    updateEscalationEntry,
    deleteEscalationEntry
  };
};
