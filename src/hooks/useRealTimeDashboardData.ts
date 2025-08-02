
import { useState, useEffect } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useProject } from '@/contexts/ProjectContext';
import { useResources } from '@/contexts/ResourceContext';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  availableResources: number;
  avgProgress: number;
  upcomingDeadlines: Array<{
    name: string;
    deadline: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  recentActivity: Array<{
    action: string;
    project: string;
    time: string;
  }>;
}

export const useRealTimeDashboardData = () => {
  const { currentWorkspace } = useWorkspace();
  const { projects } = useProject();
  const { resources } = useResources();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    availableResources: 0,
    avgProgress: 0,
    upcomingDeadlines: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentWorkspace) {
      setLoading(false);
      return;
    }

    const calculateStats = () => {
      console.log('Calculating dashboard stats with data:', { projects, resources, currentWorkspace });
      
      // Calculate project stats - count both "In Progress" and "Planning" as active
      const workspaceProjects = projects.filter(p => p.workspaceId === currentWorkspace.id);
      const activeProjects = workspaceProjects.filter(p => 
        p.status === 'In Progress' || p.status === 'Planning'
      );
      
      console.log('Workspace projects:', workspaceProjects);
      console.log('Active projects:', activeProjects);
      
      // Calculate average progress based on completed tasks ratio
      let totalTasks = 0;
      let completedTasks = 0;
      
      workspaceProjects.forEach(project => {
        if (project.tasks && Array.isArray(project.tasks)) {
          totalTasks += project.tasks.length;
          completedTasks += project.tasks.filter(task => task.status === 'Completed').length;
        }
      });
      
      const avgProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      console.log('Progress calculation:', { totalTasks, completedTasks, avgProgress });

      // Calculate available resources - those with utilization < 80%
      const workspaceResources = resources.filter(r => r.workspaceId === currentWorkspace.id);
      const availableResources = workspaceResources.filter(r => r.utilization < 80).length;
      
      console.log('Resource calculation:', { 
        workspaceResources: workspaceResources.length, 
        availableResources,
        resourceDetails: workspaceResources.map(r => ({ name: r.name, utilization: r.utilization }))
      });

      // Get upcoming deadlines from tasks
      const upcomingDeadlines = workspaceProjects.flatMap(project => 
        project.tasks
          .filter(task => {
            const deadline = new Date(task.endDate);
            const now = new Date();
            const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return daysUntil <= 7 && daysUntil >= 0 && task.status !== 'Completed';
          })
          .map(task => ({
            name: `${project.name} - ${task.name}`,
            deadline: new Date(task.endDate).toLocaleDateString(),
            priority: task.priority?.toLowerCase() as 'high' | 'medium' | 'low' || 'medium'
          }))
      ).slice(0, 3);

      // Generate recent activity from project data
      const recentActivity = workspaceProjects
        .filter(p => p.updatedAt)
        .sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime())
        .slice(0, 3)
        .map(project => ({
          action: `Project ${project.status.toLowerCase()}`,
          project: project.name,
          time: new Date(project.updatedAt!).toLocaleDateString()
        }));

      const finalStats = {
        totalProjects: workspaceProjects.length,
        activeProjects: activeProjects.length,
        availableResources,
        avgProgress,
        upcomingDeadlines,
        recentActivity
      };
      
      console.log('Final dashboard stats:', finalStats);
      
      setStats(finalStats);
      setLoading(false);
    };

    calculateStats();
    
    // Set up real-time subscription for project changes
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `workspace_id=eq.${currentWorkspace.id}`
        },
        () => {
          // Recalculate stats when projects change
          setTimeout(calculateStats, 100); // Small delay to ensure context updates
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentWorkspace, projects, resources]);

  return { stats, loading };
};
