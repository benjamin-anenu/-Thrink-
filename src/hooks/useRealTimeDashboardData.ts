
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

    const fetchStats = async () => {
      try {
        // Calculate project stats
        const workspaceProjects = projects.filter(p => p.workspaceId === currentWorkspace.id);
        const activeProjects = workspaceProjects.filter(p => 
          ['Planning', 'Execution', 'Monitoring & Controlling'].includes(p.status)
        );
        
        // Calculate average progress
        const avgProgress = workspaceProjects.length > 0
          ? Math.round(workspaceProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / workspaceProjects.length)
          : 0;

        // Calculate available resources (not over-utilized and available for additional tasks)
        const workspaceResources = resources.filter(r => r.workspaceId === currentWorkspace.id);
        const availableResources = workspaceResources.filter(r => 
          (r.utilization || 0) <= 80
        ).length;

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

        // Get recent activity from actual database
        const { data: recentTasks, error: tasksError } = await supabase
          .from('project_tasks')
          .select(`
            id,
            name,
            status,
            progress,
            updated_at,
            projects!inner(
              name,
              workspace_id
            )
          `)
          .eq('projects.workspace_id', currentWorkspace.id)
          .or('status.eq.Completed,status.eq.In Progress,progress.gte.50')
          .order('updated_at', { ascending: false })
          .limit(8);

        const recentActivity = (recentTasks || []).map(task => {
          const updatedTime = new Date(task.updated_at);
          const now = new Date();
          const hoursAgo = Math.floor((now.getTime() - updatedTime.getTime()) / (1000 * 60 * 60));
          
          let action = '';
          if (task.status === 'Completed') {
            action = `${task.name} completed`;
          } else if (task.progress >= 100) {
            action = `${task.name} is 100% complete`;
          } else if (task.progress >= 50) {
            action = `${task.name} is ${task.progress}% complete`;
          } else {
            action = `${task.name} updated`;
          }
          
          return {
            action,
            project: task.projects.name,
            time: hoursAgo === 0 ? 'Just now' : hoursAgo === 1 ? '1 hour ago' : `${hoursAgo} hours ago`
          };
        });

        setStats({
          totalProjects: workspaceProjects.length,
          activeProjects: activeProjects.length,
          availableResources,
          avgProgress,
          upcomingDeadlines,
          recentActivity
        });
        
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Set up real-time subscription for task updates
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_tasks'
        },
        (payload) => {
          console.log('Real-time task update:', payload);
          // Refetch stats when tasks are updated
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        (payload) => {
          console.log('Real-time project update:', payload);
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentWorkspace, projects, resources]);

  return { stats, loading };
};
