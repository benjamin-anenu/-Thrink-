
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface ProjectResource {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  hourly_rate: number;
  utilization: number;
  task_count: number;
  active_task_count: number;
  availability: number;
  status: string;
}

export const useProjectResources = (projectId: string) => {
  const [resources, setResources] = useState<ProjectResource[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    const fetchProjectResources = async () => {
      if (!currentWorkspace || !projectId) {
        setResources([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching project resources for:', projectId);

        // Get all resources assigned to tasks in this project
        const { data: taskAssignments, error: taskError } = await supabase
          .from('project_tasks')
          .select('assigned_resources')
          .eq('project_id', projectId);

        if (taskError) throw taskError;

        // Collect all unique resource IDs from task assignments
        const resourceIds = new Set<string>();
        taskAssignments?.forEach(task => {
          if (task.assigned_resources && Array.isArray(task.assigned_resources)) {
            task.assigned_resources.forEach(resourceId => {
              if (resourceId && typeof resourceId === 'string') {
                resourceIds.add(resourceId);
              }
            });
          }
        });

        console.log('Found resource IDs:', Array.from(resourceIds));

        if (resourceIds.size === 0) {
          setResources([]);
          setLoading(false);
          return;
        }

        // Fetch resource details
        const { data: resourcesData, error: resourcesError } = await supabase
          .from('resource_profiles')
          .select('*')
          .in('id', Array.from(resourceIds))
          .eq('workspace_id', currentWorkspace.id);

        if (resourcesError) throw resourcesError;

        // Calculate utilization and task counts for each resource
        const enhancedResources = await Promise.all(
          (resourcesData || []).map(async (resource) => {
            // Count total tasks assigned to this resource
            const { count: totalTaskCount } = await supabase
              .from('project_tasks')
              .select('*', { count: 'exact', head: true })
              .contains('assigned_resources', [resource.id]);

            // Count active tasks (not completed)
            const { count: activeTaskCount } = await supabase
              .from('project_tasks')
              .select('*', { count: 'exact', head: true })
              .contains('assigned_resources', [resource.id])
              .neq('status', 'Completed');

            // Calculate utilization (simple calculation based on active tasks)
            const utilization = Math.min(100, (activeTaskCount || 0) * 20);
            const availability = Math.max(0, 100 - utilization);

            return {
              id: resource.id,
              name: resource.name || 'Unknown',
              email: resource.email || '',
              role: resource.role || 'Team Member',
              department: resource.department || 'General',
              hourly_rate: resource.hourly_rate || 0,
              utilization,
              task_count: totalTaskCount || 0,
              active_task_count: activeTaskCount || 0,
              availability,
              status: utilization > 80 ? 'Overloaded' : utilization > 60 ? 'Busy' : 'Available'
            } as ProjectResource;
          })
        );

        console.log('Enhanced resources loaded:', enhancedResources);
        setResources(enhancedResources);

      } catch (error) {
        console.error('Error fetching project resources:', error);
        toast.error('Failed to load project resources');
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectResources();
  }, [projectId, currentWorkspace]);

  return { resources, loading };
};
