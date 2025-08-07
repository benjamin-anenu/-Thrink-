
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
  project_id?: string;
  created_at: string;
  updated_at: string;
}

export interface EscalationAssignmentWithDetails extends EscalationAssignment {
  level: {
    name: string;
    level_order: number;
    project_id?: string;
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
    project_id?: string;
  };
}

export const useEscalationAssignments = (projectId?: string) => {
  const [assignments, setAssignments] = useState<EscalationAssignmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  const loadAssignments = async () => {
    if (!currentWorkspace?.id) return;
    
    try {
      setLoading(true);
      let query = supabase
        .from('escalation_assignments')
        .select(`
          *,
          level:escalation_levels(name, level_order, project_id),
          stakeholder:stakeholders(name, email, role),
          trigger:escalation_triggers(name, description, condition_type, threshold_value, threshold_unit, project_id)
        `)
        .eq('workspace_id', currentWorkspace.id);

      if (projectId) {
        // Get both workspace-level and project-specific assignments
        query = query.or(`project_id.is.null,project_id.eq.${projectId}`);
      } else {
        // Only workspace-level assignments
        query = query.is('project_id', null);
      }

      const { data, error } = await query.order('created_at');

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
    trigger_id: string,
    isProjectSpecific: boolean = false
  ) => {
    if (!currentWorkspace?.id) return null;

    try {
      const { data, error } = await supabase
        .from('escalation_assignments')
        .insert([{
          level_id,
          stakeholder_id,
          trigger_id,
          workspace_id: currentWorkspace.id,
          project_id: isProjectSpecific && projectId ? projectId : null
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
