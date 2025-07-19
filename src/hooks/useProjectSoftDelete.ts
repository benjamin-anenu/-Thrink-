
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useProjectSoftDelete = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const softDeleteProject = async (projectId: string) => {
    try {
      setIsDeleting(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Soft delete the project
      const { error } = await supabase
        .from('projects')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user.id,
          status: 'Cancelled' // Change status to cancelled when deleted
        })
        .eq('id', projectId);

      if (error) throw error;

      toast.success('Project moved to recycle bin');
      return true;
    } catch (error) {
      console.error('Error soft deleting project:', error);
      toast.error('Failed to delete project');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const restoreProject = async (projectId: string) => {
    try {
      setIsDeleting(true);

      const { error } = await supabase
        .from('projects')
        .update({
          deleted_at: null,
          deleted_by: null,
          status: 'Active' // Restore to active status
        })
        .eq('id', projectId);

      if (error) throw error;

      toast.success('Project restored successfully');
      return true;
    } catch (error) {
      console.error('Error restoring project:', error);
      toast.error('Failed to restore project');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const getProjectStats = async (projectId: string) => {
    try {
      // Get project details
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('status')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Get ongoing tasks count
      const { count: ongoingTasks, error: tasksError } = await supabase
        .from('project_tasks')
        .select('id', { count: 'exact' })
        .eq('project_id', projectId)
        .neq('status', 'Completed');

      if (tasksError) throw tasksError;

      return {
        status: project.status,
        ongoingTasks: ongoingTasks || 0
      };
    } catch (error) {
      console.error('Error getting project stats:', error);
      return {
        status: 'Unknown',
        ongoingTasks: 0
      };
    }
  };

  return {
    softDeleteProject,
    restoreProject,
    getProjectStats,
    isDeleting
  };
};
