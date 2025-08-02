
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
    if (!currentWorkspace || resources.length === 0) {
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

      // Get project assignments
      const { data: assignments } = await supabase
        .from('project_assignments')
        .select('resource_id, project_id')
        .in('resource_id', resources.map(r => r.id));

      // Get projects with their tasks
      const { data: projects } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          project_tasks (
            id,
            assigned_resources
          )
        `)
        .eq('workspace_id', currentWorkspace.id);

      // Calculate metrics
      const totalResources = resources.length;
      
      // Available: utilization < 100% OR no assignments
      const assignedResourceIds = new Set(assignments?.map(a => a.resource_id) || []);
      let availableCount = 0;
      let allocatedCount = 0;
      let overloadedCount = 0;
      let resourcesAtRiskCount = 0;

      resources.forEach(resource => {
        const utilization = utilizationMetrics[resource.id]?.utilization_percentage || 0;
        const isAssigned = assignedResourceIds.has(resource.id);
        
        if (utilization < 100 && utilization > 0) {
          allocatedCount++;
        } else if (utilization === 0 || !isAssigned) {
          availableCount++;
        }
        
        if (utilization > 100) {
          overloadedCount++;
          resourcesAtRiskCount++; // Overloaded resources are at risk
        }

        // Additional risk factors
        const bottleneckRisk = utilizationMetrics[resource.id]?.bottleneck_risk || 0;
        if (bottleneckRisk > 7) {
          resourcesAtRiskCount++;
        }
      });

      // Unassigned resources (not in any project assignment)
      const unassignedCount = resources.length - assignedResourceIds.size;

      // Projects with gaps (tasks without sufficient resources)
      let projectsWithGapsCount = 0;
      if (projects) {
        projects.forEach(project => {
          const tasks = project.project_tasks || [];
          let tasksWithoutResources = 0;
          let tasksWithResources = 0;

          tasks.forEach(task => {
            if (!task.assigned_resources || task.assigned_resources.length === 0) {
              tasksWithoutResources++;
            } else {
              tasksWithResources++;
            }
          });

          if (tasksWithoutResources > tasksWithResources && tasks.length > 0) {
            projectsWithGapsCount++;
          }
        });
      }

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
