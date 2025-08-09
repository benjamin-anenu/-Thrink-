
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface EscalationLevel {
  id: string;
  name: string;
  level_order: number;
  workspace_id: string;
  project_id?: string;
  created_at: string;
  updated_at: string;
}

export const useEscalationLevels = (projectId?: string) => {
  const [levels, setLevels] = useState<EscalationLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  const loadLevels = async () => {
    if (!currentWorkspace?.id) return;
    
    try {
      setLoading(true);
      let query = supabase
        .from('escalation_levels')
        .select('*')
        .eq('workspace_id', currentWorkspace.id);

      if (projectId) {
        // Get both workspace-level (inherited) and project-specific levels
        query = query.or(`project_id.is.null,project_id.eq.${projectId}`);
      } else {
        // Only workspace-level configurations
        query = query.is('project_id', null);
      }

      const { data, error } = await query.order('level_order');

      if (error) throw error;
      setLevels(data || []);
    } catch (error) {
      console.error('Error loading escalation levels:', error);
      toast.error('Failed to load escalation levels');
    } finally {
      setLoading(false);
    }
  };

  const createLevel = async (name: string, level_order: number, isProjectSpecific: boolean = false) => {
    if (!currentWorkspace?.id) return null;

    try {
      const { data, error } = await supabase
        .from('escalation_levels')
        .insert([{ 
          name, 
          level_order, 
          workspace_id: currentWorkspace.id,
          project_id: isProjectSpecific && projectId ? projectId : null
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Escalation level created');
      loadLevels();
      return data;
    } catch (error) {
      console.error('Error creating escalation level:', error);
      toast.error('Failed to create escalation level');
      return null;
    }
  };

  const updateLevel = async (id: string, updates: Partial<EscalationLevel>) => {
    try {
      const { error } = await supabase
        .from('escalation_levels')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Escalation level updated');
      loadLevels();
      return true;
    } catch (error) {
      console.error('Error updating escalation level:', error);
      toast.error('Failed to update escalation level');
      return false;
    }
  };

  const deleteLevel = async (id: string) => {
    try {
      const { error } = await supabase
        .from('escalation_levels')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Escalation level deleted');
      loadLevels();
      return true;
    } catch (error) {
      console.error('Error deleting escalation level:', error);
      toast.error('Failed to delete escalation level');
      return false;
    }
  };

  useEffect(() => {
    loadLevels();
  }, [currentWorkspace?.id]);

  return {
    levels,
    loading,
    createLevel,
    updateLevel,
    deleteLevel,
    refreshLevels: loadLevels
  };
};
