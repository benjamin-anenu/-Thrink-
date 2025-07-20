
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SoftDeleteItem {
  id: string;
  type: 'project' | 'resource' | 'stakeholder';
  name: string;
  data: any;
}

export const useSoftDelete = () => {
  const [loading, setLoading] = useState(false);

  const softDeleteProject = async (projectId: string) => {
    setLoading(true);
    try {
      // Get project data before deletion
      const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (fetchError) throw fetchError;

      // Check if project has active tasks
      const { data: activeTasks, error: tasksError } = await supabase
        .from('project_tasks')
        .select('id, name, status')
        .eq('project_id', projectId)
        .neq('status', 'Completed');

      if (tasksError) throw tasksError;

      // Soft delete the project
      const { error: deleteError } = await supabase
        .from('projects')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', projectId);

      if (deleteError) throw deleteError;

      toast.success('Project moved to recycle bin');
      return {
        success: true,
        hasActiveTasks: activeTasks && activeTasks.length > 0,
        activeTasks: activeTasks || []
      };
    } catch (error) {
      console.error('Error soft deleting project:', error);
      toast.error('Failed to delete project');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const softDeleteResource = async (resourceId: string) => {
    setLoading(true);
    try {
      // For now, just hard delete resources since they don't have deleted_at column
      const { error: deleteError } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId);

      if (deleteError) throw deleteError;

      toast.success('Resource deleted');
      return { success: true };
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const softDeleteStakeholder = async (stakeholderId: string) => {
    setLoading(true);
    try {
      // For now, just hard delete stakeholders since they don't have deleted_at column
      const { error: deleteError } = await supabase
        .from('stakeholders')
        .delete()
        .eq('id', stakeholderId);

      if (deleteError) throw deleteError;

      toast.success('Stakeholder deleted');
      return { success: true };
    } catch (error) {
      console.error('Error deleting stakeholder:', error);
      toast.error('Failed to delete stakeholder');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    softDeleteProject,
    softDeleteResource,
    softDeleteStakeholder,
    loading
  };
};
