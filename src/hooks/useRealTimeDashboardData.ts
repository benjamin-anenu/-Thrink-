
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
      // Calculate project stats
      const workspaceProjects = projects.filter(p => p.workspaceId === currentWorkspace.id);
      const activeProjects = workspaceProjects.filter(p => p.status === 'In Progress');
      
      // Calculate average progress
      const avgProgress = workspaceProjects.length > 0
        ? Math.round(workspaceProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / workspaceProjects.length)
        : 0;

      // Calculate available resources
      const workspaceResources = resources.filter(r => r.workspaceId === currentWorkspace.id);
      const availableResources = workspaceResources.filter(r => r.utilization < 80).length;

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

      setStats({
        totalProjects: workspaceProjects.length,
        activeProjects: activeProjects.length,
        availableResources,
        avgProgress,
        upcomingDeadlines,
        recentActivity
      });
      
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
