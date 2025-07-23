
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface EscalationAssignment {
  id: string;
  level_id: string;
  stakeholder_id: string;
  trigger_id: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export interface EscalationAssignmentWithDetails extends EscalationAssignment {
  level: {
    name: string;
    level_order: number;
  };
  stakeholder: {
    name: string;
    email: string;
    role: string;
  };
  trigger: {
    name: string;
    description: string;
    condition_type: string;
    threshold_value: number;
    threshold_unit: string;
  };
}

export const useEscalationAssignments = () => {
  const [assignments, setAssignments] = useState<EscalationAssignmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  const loadAssignments = async () => {
    if (!currentWorkspace?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('escalation_assignments')
        .select(`
          *,
          level:escalation_levels(name, level_order),
          stakeholder:stakeholders(name, email, role),
          trigger:escalation_triggers(name, description, condition_type, threshold_value, threshold_unit)
        `)
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at');

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error loading escalation assignments:', error);
      toast.error('Failed to load escalation assignments');
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async (
    level_id: string,
    stakeholder_id: string,
    trigger_id: string
  ) => {
    if (!currentWorkspace?.id) return null;

    try {
      const { data, error } = await supabase
        .from('escalation_assignments')
        .insert([{
          level_id,
          stakeholder_id,
          trigger_id,
          workspace_id: currentWorkspace.id
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Escalation assignment created');
      loadAssignments();
      return data;
    } catch (error) {
      console.error('Error creating escalation assignment:', error);
      toast.error('Failed to create escalation assignment');
      return null;
    }
  };

  const deleteAssignment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('escalation_assignments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Escalation assignment deleted');
      loadAssignments();
      return true;
    } catch (error) {
      console.error('Error deleting escalation assignment:', error);
      toast.error('Failed to delete escalation assignment');
      return false;
    }
  };

  const getAssignmentsByLevel = (level_id: string) => {
    return assignments.filter(a => a.level_id === level_id);
  };

  const getAssignmentsByTrigger = (trigger_id: string) => {
    return assignments.filter(a => a.trigger_id === trigger_id);
  };

  useEffect(() => {
    loadAssignments();
  }, [currentWorkspace?.id]);

  return {
    assignments,
    loading,
    createAssignment,
    deleteAssignment,
    getAssignmentsByLevel,
    getAssignmentsByTrigger,
    refreshAssignments: loadAssignments
  };
};
