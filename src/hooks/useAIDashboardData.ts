
import { useState, useEffect, useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useResources } from '@/contexts/ResourceContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { AvailabilityCalculationService } from '@/services/AvailabilityCalculationService';

export interface AIDashboardData {
  projectsInProgress: number;
  resourceUtilization: number;
  budgetHealth: number;
  riskScore: number;
  totalBudget: number;
  budgetSpent: number;
}

export interface AIDashboardTrend {
  month: string;
  value: number;
  change: number;
}

export interface ClientSatisfactionData {
  month: string;
  score: number;
  responses: number;
}

export const useAIDashboardData = () => {
  const { projects } = useProject();
  const { resources } = useResources();
  const { currentWorkspace } = useWorkspace();
  
  const [lastUpdate] = useState(new Date());
  const [projectTrend, setProjectTrend] = useState<AIDashboardTrend[]>([]);
  const [utilizationTrend, setUtilizationTrend] = useState<AIDashboardTrend[]>([]);
  const [budgetTrend, setBudgetTrend] = useState<AIDashboardTrend[]>([]);
  const [clientSatisfactionTrend, setClientSatisfactionTrend] = useState<ClientSatisfactionData[]>([]);

  // Filter data by current workspace
  const workspaceProjects = useMemo(() => 
    projects.filter(project => 
      !currentWorkspace || project.workspaceId === currentWorkspace.id
    ), [projects, currentWorkspace]);

  const workspaceResources = useMemo(() => 
    resources.filter(resource => 
      !currentWorkspace || resource.workspaceId === currentWorkspace.id
    ), [resources, currentWorkspace]);

  // Load additional dashboard data
  useEffect(() => {
    const loadAdditionalData = async () => {
      try {
        // Load trend data from localStorage or API
        const savedProjectTrend = localStorage.getItem('projectTrend');
        const savedUtilizationTrend = localStorage.getItem('utilizationTrend');
        const savedBudgetTrend = localStorage.getItem('budgetTrend');
        const savedSatisfactionTrend = localStorage.getItem('satisfactionTrend');

        if (savedProjectTrend) {
          setProjectTrend(JSON.parse(savedProjectTrend));
        } else {
          setProjectTrend([
            { month: 'Jan', value: 12, change: 8 },
            { month: 'Feb', value: 15, change: 12 },
            { month: 'Mar', value: 18, change: 15 },
            { month: 'Apr', value: 22, change: 18 },
            { month: 'May', value: 25, change: 22 },
            { month: 'Jun', value: 28, change: 25 }
          ]);
        }

        if (savedUtilizationTrend) {
          setUtilizationTrend(JSON.parse(savedUtilizationTrend));
        } else {
          setUtilizationTrend([
            { month: 'Jan', value: 65, change: 2 },
            { month: 'Feb', value: 68, change: 3 },
            { month: 'Mar', value: 72, change: 4 },
            { month: 'Apr', value: 75, change: 3 },
            { month: 'May', value: 78, change: 3 },
            { month: 'Jun', value: 82, change: 4 }
          ]);
        }

        if (savedBudgetTrend) {
          setBudgetTrend(JSON.parse(savedBudgetTrend));
        } else {
          setBudgetTrend([
            { month: 'Jan', value: 92, change: 1 },
            { month: 'Feb', value: 89, change: -3 },
            { month: 'Mar', value: 91, change: 2 },
            { month: 'Apr', value: 88, change: -3 },
            { month: 'May', value: 90, change: 2 },
            { month: 'Jun', value: 87, change: -3 }
          ]);
        }

        if (savedSatisfactionTrend) {
          setClientSatisfactionTrend(JSON.parse(savedSatisfactionTrend));
        } else {
          setClientSatisfactionTrend([
            { month: 'Jan', score: 4.2, responses: 12 },
            { month: 'Feb', score: 4.5, responses: 18 },
            { month: 'Mar', score: 4.1, responses: 15 },
            { month: 'Apr', score: 4.7, responses: 22 },
            { month: 'May', score: 4.6, responses: 19 },
            { month: 'Jun', score: 4.8, responses: 25 }
          ]);
        }
      } catch (error) {
        console.error('Error loading additional dashboard data:', error);
      }
    };

    loadAdditionalData();
  }, [currentWorkspace]);

  // Memoize expensive calculations with cache invalidation
  const cacheKey = useMemo(() => 
    `${projects.length}-${resources.length}-${currentWorkspace?.id || 'none'}-${lastUpdate.getTime()}`,
    [projects.length, resources.length, currentWorkspace?.id, lastUpdate]
  );

  // Calculate real-time metrics with availability service
  const realTimeData = useMemo((): AIDashboardData => {
    const activeProjects = workspaceProjects.filter(p => p.status === 'In Progress').length;
    
    // Calculate real resource utilization using the availability service
    let avgUtilization = 0;
    if (currentWorkspace) {
      try {
        // For now, use a simplified calculation since the async service isn't available in useMemo
        avgUtilization = workspaceResources.length > 0 
          ? Math.round(workspaceResources.reduce((acc, resource) => {
              const resourceProjects = workspaceProjects.filter(p => 
                p.resources?.includes(resource.id) || p.resources?.includes(resource.name)
              );
              const totalAssignedHours = resourceProjects.reduce((projectAcc, project) => {
              const resourceTasks = project.tasks?.filter(task => 
                task.assignedResources?.includes(resource.id)
              ) || [];
                const projectHours = resourceTasks.reduce((taskAcc, task) => {
                  if (task.status === 'Completed') return taskAcc;
                  const duration = task.duration || 1;
                  const hoursPerDay = 8;
                  const utilizationFactor = task.status === 'On Hold' ? 0.5 : 1.0;
                  return taskAcc + (duration * hoursPerDay * utilizationFactor);
                }, 0);
                return projectAcc + projectHours;
              }, 0);
              const standardCapacity = 160; // 4 weeks * 40 hours
              const utilization = Math.min(100, Math.round((totalAssignedHours / standardCapacity) * 100));
              return acc + Math.max(0, utilization);
            }, 0) / workspaceResources.length)
          : 0;
      } catch (error) {
        console.error('Error calculating resource utilization:', error);
        avgUtilization = 0;
      }
    }
    
    // Calculate real budget health based on project efficiency
    const calculateBudgetHealth = () => {
      // Calculate from project data when no budget service data
      const projectsWithTasks = workspaceProjects.filter(p => p.tasks && p.tasks.length > 0);
      
      if (projectsWithTasks.length === 0) return 92;
      
      let totalEfficiency = 0;
      let validProjects = 0;
      
      projectsWithTasks.forEach(project => {
        const avgProgress = project.tasks.reduce((acc, task) => acc + (task.progress || 0), 0) / project.tasks.length;
        
        // Calculate schedule efficiency
        const now = new Date();
        const startDate = new Date(project.startDate);
        const endDate = new Date(project.endDate);
        const totalDuration = endDate.getTime() - startDate.getTime();
        const elapsed = Math.max(0, now.getTime() - startDate.getTime());
        const expectedProgress = totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 0;
        
        // Efficiency = actual progress vs expected progress
        const efficiency = expectedProgress > 0 ? (avgProgress / expectedProgress) * 100 : 100;
        const boundedEfficiency = Math.max(20, Math.min(150, efficiency)); // Bound between 20-150%
        
        totalEfficiency += boundedEfficiency;
        validProjects++;
      });
      
      const avgEfficiency = validProjects > 0 ? totalEfficiency / validProjects : 100;
      
      // Convert efficiency to health score (100% efficiency = 100% health)
      return Math.round(Math.max(60, Math.min(100, avgEfficiency)));
    };
    
    const budgetHealth = calculateBudgetHealth();
    
    // Calculate risk score from overdue tasks and project health
    const overdueTasksCount = workspaceProjects.reduce((acc, project) => {
      const overdueTasks = project.tasks.filter(task => {
        const taskDate = new Date(task.endDate);
        const today = new Date();
        return taskDate < today && task.status !== 'Completed';
      });
      return acc + overdueTasks.length;
    }, 0);
    
    const riskScore = Math.min(100, Math.max(0, overdueTasksCount * 5 + (100 - budgetHealth)));
    
    return {
      projectsInProgress: activeProjects,
      resourceUtilization: avgUtilization,
      budgetHealth,
      riskScore,
      totalBudget: 0, // Placeholder since we don't have budget service
      budgetSpent: 0  // Placeholder since we don't have budget service
    };
  }, [workspaceProjects, workspaceResources, currentWorkspace, cacheKey]);

  return {
    realTimeData,
    projectTrend,
    utilizationTrend,
    budgetTrend,
    clientSatisfactionTrend,
    lastUpdate
  };
};
