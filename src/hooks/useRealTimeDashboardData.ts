
import { useState, useEffect } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';

interface DashboardMetrics {
  activeProjects: number;
  availableResources: number;
  averageProgress: number;
  budgetHealth: number;
}

export const useRealTimeDashboardData = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeProjects: 0,
    availableResources: 0,
    averageProgress: 0,
    budgetHealth: 0,
  });
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  const calculateProjectHealth = async (workspaceId: string): Promise<number> => {
    try {
      // Get project budget data
      const { data: budgetData, error: budgetError } = await supabase
        .from('project_budgets')
        .select(`
          allocated_amount,
          spent_amount,
          projects!inner(workspace_id)
        `)
        .eq('projects.workspace_id', workspaceId);

      if (budgetError || !budgetData || budgetData.length === 0) {
        // No budget data exists - return very low health score
        return 15;
      }

      // Get project task completion rates
      const { data: taskData, error: taskError } = await supabase
        .from('project_tasks')
        .select(`
          status,
          end_date,
          projects!inner(workspace_id)
        `)
        .eq('projects.workspace_id', workspaceId);

      let healthScore = 15; // Start with low baseline

      // Budget health component (40% of score)
      const totalAllocated = budgetData.reduce((sum, item) => sum + Number(item.allocated_amount), 0);
      const totalSpent = budgetData.reduce((sum, item) => sum + Number(item.spent_amount), 0);
      
      if (totalAllocated > 0) {
        const budgetUtilization = (totalSpent / totalAllocated) * 100;
        if (budgetUtilization <= 80) {
          healthScore += 35; // Good budget utilization
        } else if (budgetUtilization <= 100) {
          healthScore += 20; // Acceptable
        } else {
          healthScore += 5; // Over budget
        }
      }

      // Task completion component (40% of score)
      if (taskData && taskData.length > 0) {
        const completedTasks = taskData.filter(task => task.status === 'Completed').length;
        const overdueTasks = taskData.filter(task => 
          task.end_date && new Date(task.end_date) < new Date() && task.status !== 'Completed'
        ).length;
        
        const completionRate = (completedTasks / taskData.length) * 100;
        const overdueRate = (overdueTasks / taskData.length) * 100;
        
        if (completionRate >= 80 && overdueRate < 10) {
          healthScore += 35;
        } else if (completionRate >= 60 && overdueRate < 20) {
          healthScore += 25;
        } else if (completionRate >= 40) {
          healthScore += 15;
        } else {
          healthScore += 5;
        }
      }

      // Resource allocation component (20% of score)
      const { data: resourceData } = await supabase
        .from('resources')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (resourceData && resourceData.length > 0) {
        healthScore += 20; // Basic resource availability
      } else {
        healthScore += 5; // Limited resources
      }

      return Math.min(healthScore, 100);
    } catch (error) {
      console.error('Error calculating project health:', error);
      return 15; // Return very low score on error
    }
  };

  const fetchDashboardData = async () => {
    if (!currentWorkspace) {
      setMetrics({ activeProjects: 0, availableResources: 0, averageProgress: 0, budgetHealth: 0 });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch active projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, status, name')
        .eq('workspace_id', currentWorkspace.id)
        .in('status', ['Active', 'Planning', 'In Progress']);

      if (projectsError) throw projectsError;

      // Fetch available resources (utilization < 80%)
      const { data: resources, error: resourcesError } = await supabase
        .from('resources')
        .select('*')
        .eq('workspace_id', currentWorkspace.id);

      if (resourcesError) throw resourcesError;

      // Calculate average progress
      let totalProgress = 0;
      let projectCount = 0;

      if (projects && projects.length > 0) {
        for (const project of projects) {
          const { data: tasks } = await supabase
            .from('project_tasks')
            .select('status')
            .eq('project_id', project.id);

          if (tasks && tasks.length > 0) {
            const completedTasks = tasks.filter(task => task.status === 'Completed').length;
            const progress = (completedTasks / tasks.length) * 100;
            totalProgress += progress;
            projectCount++;
          }
        }
      }

      const avgProgress = projectCount > 0 ? Math.round(totalProgress / projectCount) : 0;

      // Calculate budget health
      const budgetHealth = await calculateProjectHealth(currentWorkspace.id);

      setMetrics({
        activeProjects: projects?.length || 0,
        availableResources: resources?.length || 0,
        averageProgress: avgProgress,
        budgetHealth: Math.round(budgetHealth),
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setMetrics({
        activeProjects: 0,
        availableResources: 0,
        averageProgress: 0,
        budgetHealth: 15, // Very low health when no data
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Set up real-time subscriptions
    const projectsSubscription = supabase
      .channel('dashboard_projects')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `workspace_id=eq.${currentWorkspace?.id}`
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    const resourcesSubscription = supabase
      .channel('dashboard_resources')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'resources',
          filter: `workspace_id=eq.${currentWorkspace?.id}`
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    const budgetSubscription = supabase
      .channel('dashboard_budgets')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_budgets'
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectsSubscription);
      supabase.removeChannel(resourcesSubscription);
      supabase.removeChannel(budgetSubscription);
    };
  }, [currentWorkspace]);

  return {
    metrics,
    loading,
    refreshData: fetchDashboardData,
  };
};
