
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useEnhancedResources } from '@/hooks/useEnhancedResources';

export interface ResourceDashboardMetrics {
  totalResources: number;
  availableResources: number;
  allocatedResources: number;
  overloadedResources: number;
  unassignedResources: number;
  projectsWithGaps: number;
  resourcesAtRisk: number;
}

export const useResourceDashboardData = () => {
  const [metrics, setMetrics] = useState<ResourceDashboardMetrics>({
    totalResources: 0,
    availableResources: 0,
    allocatedResources: 0,
    overloadedResources: 0,
    unassignedResources: 0,
    projectsWithGaps: 0,
    resourcesAtRisk: 0
  });
  const [loading, setLoading] = useState(true);
  
  const { currentWorkspace } = useWorkspace();
  const { resources, utilizationMetrics } = useEnhancedResources();

  const calculateMetrics = async () => {
    if (!currentWorkspace) {
      // No workspace means no data
      setMetrics({
        totalResources: 0,
        availableResources: 0,
        allocatedResources: 0,
        overloadedResources: 0,
        unassignedResources: 0,
        projectsWithGaps: 0,
        resourcesAtRisk: 0
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Calculating resource dashboard metrics...');

      // Get all project tasks with their assigned resources
      const { data: projectTasks } = await supabase
        .from('project_tasks')
        .select(`
          id,
          name,
          assigned_resources,
          status,
          project_id,
          projects (
            id,
            name,
            workspace_id
          )
        `)
        .eq('projects.workspace_id', currentWorkspace.id);

      console.log('Project tasks:', projectTasks);

      // Get projects in this workspace
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name')
        .eq('workspace_id', currentWorkspace.id);

      console.log('Projects:', projects);
      console.log('Resources:', resources);

      // Calculate metrics from real data only
      const totalResources = resources.length;
      
      // Track which resources are assigned to tasks
      const assignedResourceIds = new Set<string>();
      
      // Process each project task to find assigned resources
      if (projectTasks) {
        projectTasks.forEach(task => {
          if (task.assigned_resources && Array.isArray(task.assigned_resources)) {
            task.assigned_resources.forEach((resourceId: string) => {
              if (resourceId && typeof resourceId === 'string') {
                assignedResourceIds.add(resourceId);
              }
            });
          }
        });
      }

      console.log('Assigned resource IDs:', Array.from(assignedResourceIds));

      // Count allocated vs unassigned resources
      const allocatedCount = assignedResourceIds.size;
      const unassignedCount = totalResources - allocatedCount;

      // Calculate available, overloaded, and at-risk resources based on actual utilization
      let availableCount = 0;
      let overloadedCount = 0;
      let resourcesAtRiskCount = 0;

      resources.forEach(resource => {
        const utilization = utilizationMetrics[resource.id]?.utilization_percentage || 0;
        const isAssigned = assignedResourceIds.has(resource.id);
        
        if (utilization > 100) {
          overloadedCount++;
          resourcesAtRiskCount++;
        } else if (utilization < 70 || !isAssigned) {
          availableCount++;
        }

        // Additional risk factors from utilization metrics
        const bottleneckRisk = utilizationMetrics[resource.id]?.bottleneck_risk || 0;
        if (bottleneckRisk > 7) {
          resourcesAtRiskCount++;
        }
      });

      // Calculate projects with resource gaps
      let projectsWithGapsCount = 0;
      
      if (projects && projectTasks) {
        // Group tasks by project
        const tasksByProject = new Map<string, any[]>();
        projectTasks.forEach(task => {
          const projectId = task.project_id;
          if (!tasksByProject.has(projectId)) {
            tasksByProject.set(projectId, []);
          }
          tasksByProject.get(projectId)!.push(task);
        });

        // Check each project for unassigned tasks
        projects.forEach(project => {
          const projectTasks = tasksByProject.get(project.id) || [];
          const unassignedTasks = projectTasks.filter(task => 
            !task.assigned_resources || 
            task.assigned_resources.length === 0 || 
            task.status !== 'Completed'
          );
          
          console.log(`Project ${project.name}: ${projectTasks.length} tasks, ${unassignedTasks.length} unassigned`);
          
          if (unassignedTasks.length > 0) {
            projectsWithGapsCount++;
          }
        });
      }

      console.log('Calculated metrics:', {
        totalResources,
        availableCount,
        allocatedCount,
        overloadedCount,
        unassignedCount,
        projectsWithGapsCount,
        resourcesAtRiskCount
      });

      setMetrics({
        totalResources,
        availableResources: availableCount,
        allocatedResources: allocatedCount,
        overloadedResources: overloadedCount,
        unassignedResources: unassignedCount,
        projectsWithGaps: projectsWithGapsCount,
        resourcesAtRisk: resourcesAtRiskCount
      });
    } catch (error) {
      console.error('Error calculating dashboard metrics:', error);
      // On error, show empty metrics rather than fallback data
      setMetrics({
        totalResources: 0,
        availableResources: 0,
        allocatedResources: 0,
        overloadedResources: 0,
        unassignedResources: 0,
        projectsWithGaps: 0,
        resourcesAtRisk: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateMetrics();
  }, [currentWorkspace, resources, utilizationMetrics]);

  return {
    metrics,
    loading,
    refreshMetrics: calculateMetrics
  };
};
