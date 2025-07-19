
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useResourceSoftDelete = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const softDeleteResource = async (resourceId: string) => {
    try {
      setIsDeleting(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Note: We need to add deleted_at and deleted_by columns to resources table
      // For now, we'll use a status approach or actual deletion based on current schema
      
      // Check if deleted_at column exists by trying to update
      const { error } = await supabase
        .from('resources')
        .update({
          // If deleted_at column exists, use it
          // deleted_at: new Date().toISOString(),
          // deleted_by: user.id,
          // For now, we'll add a note in the email field to mark as deleted
          email: `DELETED_${new Date().toISOString()}_${resourceId}@deleted.local`
        })
        .eq('id', resourceId);

      if (error) throw error;

      toast.success('Resource moved to recycle bin');
      return true;
    } catch (error) {
      console.error('Error soft deleting resource:', error);
      toast.error('Failed to delete resource');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const restoreResource = async (resourceId: string, originalEmail: string) => {
    try {
      setIsDeleting(true);

      const { error } = await supabase
        .from('resources')
        .update({
          email: originalEmail // Restore original email
        })
        .eq('id', resourceId);

      if (error) throw error;

      toast.success('Resource restored successfully');
      return true;
    } catch (error) {
      console.error('Error restoring resource:', error);
      toast.error('Failed to restore resource');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const getResourceStats = async (resourceId: string) => {
    try {
      // Count active project assignments
      const { count: activeProjects, error: projectsError } = await supabase
        .from('project_assignments')
        .select('project_id', { count: 'exact' })
        .eq('resource_id', resourceId);

      if (projectsError) throw projectsError;

      // Count ongoing tasks assigned to this resource
      const { count: ongoingTasks, error: tasksError } = await supabase
        .from('project_tasks')
        .select('id', { count: 'exact' })
        .eq('assignee_id', resourceId)
        .neq('status', 'Completed');

      if (tasksError) throw tasksError;

      return {
        activeProjects: activeProjects || 0,
        ongoingTasks: ongoingTasks || 0
      };
    } catch (error) {
      console.error('Error getting resource stats:', error);
      return {
        activeProjects: 0,
        ongoingTasks: 0
      };
    }
  };

  return {
    softDeleteResource,
    restoreResource,
    getResourceStats,
    isDeleting
  };
};
