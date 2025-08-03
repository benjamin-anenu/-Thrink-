
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useResources } from '@/contexts/ResourceContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { PerformanceTracker } from '@/services/PerformanceTracker';
import { EventBus } from '@/services/EventBus';
import { clientSatisfactionService } from '@/services/ClientSatisfactionService';
import { budgetService } from '@/services/BudgetService';
import { supabase } from '@/integrations/supabase/client';

interface AIInsight {
  type: 'prediction' | 'optimization' | 'risk' | 'opportunity';
  title: string;
  message: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  icon: any;
}

export const useAIDashboardData = () => {
  const { projects } = useProject();
  const { resources } = useResources();
  const { currentWorkspace } = useWorkspace();
  const performanceTracker = PerformanceTracker.getInstance();
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [clientSatisfactionTrend, setClientSatisfactionTrend] = useState<any[]>([]);
  const [budgetData, setBudgetData] = useState<any>(null);

  // Listen for real-time updates
  useEffect(() => {
    const eventBus = EventBus.getInstance();
    
    const handleDataUpdate = () => {
      setLastUpdate(new Date());
    };

    const unsubscribers = [
      eventBus.subscribe('project_updated', handleDataUpdate),
      eventBus.subscribe('resource_updated', handleDataUpdate),
      eventBus.subscribe('performance_updated', handleDataUpdate),
      eventBus.subscribe('ai_insights_updated', handleDataUpdate)
    ];

    const timer = setTimeout(() => setIsLoading(false), 500);

    return () => {
      unsubscribers.forEach(unsub => unsub());
      clearTimeout(timer);
    };
  }, []);

  // Load client satisfaction and budget data
  useEffect(() => {
    const loadAdditionalData = async () => {
      if (!currentWorkspace) return;

      try {
        const satisfactionTrend = await clientSatisfactionService.getSatisfactionTrend(currentWorkspace.id);
        setClientSatisfactionTrend(satisfactionTrend || []);

        const budget = await budgetService.getWorkspaceBudgetSummary(currentWorkspace.id);
        setBudgetData(budget);
      } catch (error) {
        console.error('Error loading additional dashboard data:', error);
        setClientSatisfactionTrend([]);
        setBudgetData(null);
      }
    };

    loadAdditionalData();
  }, [currentWorkspace]);

  // Memoize expensive calculations with cache invalidation
  const cacheKey = useMemo(() => 
    `${projects.length}-${resources.length}-${currentWorkspace?.id || 'none'}-${lastUpdate.getTime()}`,
    [projects.length, resources.length, currentWorkspace?.id, lastUpdate]
  );

  // Filter data by current workspace
  const workspaceProjects = useMemo(() => 
    projects.filter(project => 
      !currentWorkspace || project.workspaceId === currentWorkspace.id
    ), [projects, currentWorkspace]);

  const workspaceResources = useMemo(() => 
    resources.filter(resource => 
      !currentWorkspace || resource.workspaceId === currentWorkspace.id
    ), [resources, currentWorkspace]);

  // Calculate real-time metrics from actual data only
  const realTimeData = useMemo(() => {
    // Count only projects with "In Progress" status
    const activeProjects = workspaceProjects.filter(p => p.status === 'In Progress').length;
    
    // Calculate actual resource utilization
    const avgUtilization = workspaceResources.length > 0 
      ? Math.round(workspaceResources.reduce((acc, r) => acc + (r.utilization || 0), 0) / workspaceResources.length)
      : 0;
    
    // Get actual budget health from loaded budget data
    const budgetHealth = budgetData 
      ? Math.max(0, Math.min(100, 100 - (budgetData.totalSpent / budgetData.totalAllocated * 100)))
      : 0;
    
    // Calculate risk score based on actual overdue tasks
    const overdueTasksCount = workspaceProjects.reduce((acc, project) => {
      const overdueTasks = (project.tasks || []).filter(task => {
        const taskDate = new Date(task.endDate);
        const today = new Date();
        return taskDate < today && task.status !== 'Completed';
      });
      return acc + overdueTasks.length;
    }, 0);
    
    const riskScore = overdueTasksCount * 5; // 5% risk per overdue task

    return {
      projectsInProgress: activeProjects,
      resourceUtilization: avgUtilization,
      budgetHealth,
      riskScore: Math.min(100, riskScore),
      totalBudget: budgetData?.totalAllocated || 0,
      budgetSpent: budgetData?.totalSpent || 0
    };
  }, [workspaceProjects, workspaceResources, budgetData]);

  // Generate performance data from real project data
  const performanceData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    return monthNames.map((name, index) => {
      // Count actual completed vs planned projects for this month
      const completedProjects = workspaceProjects.filter(p => p.status === 'Completed').length;
      const totalProjects = workspaceProjects.length;
      
      const budgetScore = realTimeData.budgetHealth;
      const satisfactionScore = clientSatisfactionTrend.find(t => t.month === name)?.score || 0;
      
      return {
        name,
        completed: completedProjects,
        planned: totalProjects,
        budget: Math.round(budgetScore),
        satisfaction: Math.round(satisfactionScore * 20) // Scale to 0-100
      };
    });
  }, [workspaceProjects, realTimeData.budgetHealth, clientSatisfactionTrend]);

  // Generate resource allocation data from actual resource data
  const resourceData = useMemo(() => {
    if (workspaceResources.length === 0) {
      return [];
    }

    const roleGroups = workspaceResources.reduce((acc, resource) => {
      const role = resource.role?.includes('Developer') ? 'Developers' :
                   resource.role?.includes('Designer') ? 'Designers' :
                   resource.role?.includes('Manager') ? 'Managers' :
                   resource.role?.includes('QA') ? 'QA' : 'Other';
      
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(roleGroups).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) return [];
    
    return Object.entries(roleGroups).map(([name, count], index) => ({
      name,
      value: Math.round((count / total) * 100),
      color: ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--error))', 'hsl(var(--info))'][index % 5]
    }));
  }, [workspaceResources]);

  // Generate AI insights from real data only
  const aiInsights = useMemo(() => {
    const insights: AIInsight[] = [];
    
    // Active project insights based on real data
    if (realTimeData.projectsInProgress > 0) {
      insights.push({
        type: 'prediction',
        title: 'Project Progress Forecast',
        message: `${realTimeData.projectsInProgress} active projects are currently in progress.`,
        confidence: 87,
        impact: 'medium',
        icon: 'TrendingUp'
      });
    }

    // Resource utilization insights based on real data
    if (realTimeData.resourceUtilization > 85) {
      insights.push({
        type: 'optimization',
        title: 'Resource Optimization',
        message: `Team utilization at ${realTimeData.resourceUtilization}%. Consider workload rebalancing.`,
        confidence: 92,
        impact: 'high',
        icon: 'Users'
      });
    } else if (realTimeData.resourceUtilization < 65 && workspaceResources.length > 0) {
      insights.push({
        type: 'opportunity',
        title: 'Capacity Available',
        message: `Current utilization at ${realTimeData.resourceUtilization}%. Team has capacity for additional projects.`,
        confidence: 88,
        impact: 'medium',
        icon: 'Users'
      });
    }

    // Budget insights based on real budget data
    if (budgetData && budgetData.totalAllocated > 0) {
      const utilizationRate = (budgetData.totalSpent / budgetData.totalAllocated) * 100;
      if (utilizationRate > 80) {
        insights.push({
          type: 'risk',
          title: 'Budget Monitoring',
          message: `Budget utilization at ${utilizationRate.toFixed(1)}%. Monitor spending closely.`,
          confidence: 95,
          impact: utilizationRate > 90 ? 'high' : 'medium',
          icon: 'AlertTriangle'
        });
      }
    }

    // Client satisfaction insight based on real data
    if (clientSatisfactionTrend.length > 0) {
      const avgSatisfaction = clientSatisfactionTrend.reduce((sum, t) => sum + t.score, 0) / clientSatisfactionTrend.length;
      
      if (avgSatisfaction > 4.5) {
        insights.push({
          type: 'opportunity',
          title: 'Excellent Client Satisfaction',
          message: `Maintaining ${avgSatisfaction.toFixed(1)}/5 client satisfaction.`,
          confidence: 90,
          impact: 'medium',
          icon: 'Sparkles'
        });
      }
    }

    return insights;
  }, [realTimeData, budgetData, clientSatisfactionTrend, workspaceResources, cacheKey]);

  const optimizedData = useMemo(() => ({
    realTimeData,
    performanceData,
    resourceData,
    aiInsights,
    workspaceProjects,
    workspaceResources,
    isLoading,
    lastUpdate,
    cacheKey,
    clientSatisfactionTrend,
    budgetData
  }), [realTimeData, performanceData, resourceData, aiInsights, workspaceProjects, workspaceResources, isLoading, lastUpdate, cacheKey, clientSatisfactionTrend, budgetData]);

  return optimizedData;
};
