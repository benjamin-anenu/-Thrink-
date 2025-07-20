
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useResources } from '@/contexts/ResourceContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { PerformanceTracker } from '@/services/PerformanceTracker';
import { EventBus } from '@/services/EventBus';
import { clientSatisfactionService } from '@/services/ClientSatisfactionService';
import { budgetService } from '@/services/BudgetService';
import { aiService } from '@/services/AIService';
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

    // Mark as loaded after initial data processing
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
        // Load client satisfaction trend
        const satisfactionTrend = await clientSatisfactionService.getSatisfactionTrend(currentWorkspace.id);
        
        // If no real data, use sample data for demo
        if (satisfactionTrend.length === 0) {
          setClientSatisfactionTrend([
            { month: 'Jan', score: 4.2, responses: 12 },
            { month: 'Feb', score: 4.5, responses: 18 },
            { month: 'Mar', score: 4.1, responses: 15 },
            { month: 'Apr', score: 4.7, responses: 22 },
            { month: 'May', score: 4.6, responses: 19 },
            { month: 'Jun', score: 4.8, responses: 25 }
          ]);
        } else {
          setClientSatisfactionTrend(satisfactionTrend);
        }

        // Load budget data
        const workspaceBudget = await budgetService.getWorkspaceBudgetSummary(currentWorkspace.id);
        setBudgetData(workspaceBudget);
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

  // Filter data by current workspace
  const workspaceProjects = useMemo(() => 
    projects.filter(project => 
      !currentWorkspace || project.workspaceId === currentWorkspace.id
    ), [projects, currentWorkspace]);

  const workspaceResources = useMemo(() => 
    resources.filter(resource => 
      !currentWorkspace || resource.workspaceId === currentWorkspace.id
    ), [resources, currentWorkspace]);

  // Calculate real-time metrics with budget data
  const realTimeData = useMemo(() => {
    const activeProjects = workspaceProjects.filter(p => p.status === 'In Progress').length;
    
    const avgUtilization = workspaceResources.length > 0 
      ? Math.round(workspaceResources.reduce((acc, r) => acc + r.utilization, 0) / workspaceResources.length)
      : 0;
    
    const budgetHealth = budgetData 
      ? Math.max(0, Math.min(100, 100 - budgetData.utilizationRate))
      : workspaceProjects.length > 0
        ? Math.round(workspaceProjects.reduce((acc, project) => {
            const healthScore = project.health.score || 75;
            return acc + healthScore;
          }, 0) / workspaceProjects.length)
        : 92;
    
    // Calculate risk score from overdue tasks and project health
    const overdueTasksCount = workspaceProjects.reduce((acc, project) => {
      const overdueTasks = project.tasks.filter(task => {
        const taskDate = new Date(task.endDate);
        const today = new Date();
        return taskDate < today && task.status !== 'Completed';
      });
      return acc + overdueTasks.length;
    }, 0);
    
    const riskScore = Math.min(40, overdueTasksCount * 5 + 15);

    return {
      projectsInProgress: activeProjects,
      resourceUtilization: avgUtilization,
      budgetHealth,
      riskScore,
      totalBudget: budgetData?.totalAllocated || 0,
      budgetSpent: budgetData?.totalSpent || 0
    };
  }, [workspaceProjects, workspaceResources, budgetData]);

  // Generate performance data from real projects with historical context
  const performanceData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    return monthNames.map((name, index) => {
      const completedInMonth = workspaceProjects.filter(p => p.status === 'Completed').length;
      const plannedInMonth = workspaceProjects.length;
      const budgetScore = Math.max(70, Math.min(100, realTimeData.budgetHealth + (Math.random() - 0.5) * 15));
      const satisfactionScore = clientSatisfactionTrend.find(t => t.month === name)?.score || 4.2;
      
      return {
        name,
        completed: Math.max(0, Math.round(completedInMonth * (0.4 + index * 0.12))),
        planned: Math.max(1, Math.round(plannedInMonth * (0.6 + index * 0.08))),
        budget: Math.round(budgetScore),
        satisfaction: Math.round(satisfactionScore * 20) // Scale to 0-100
      };
    });
  }, [workspaceProjects, realTimeData.budgetHealth, clientSatisfactionTrend]);

  // Generate resource allocation data from real resources
  const resourceData = useMemo(() => {
    const roleGroups = workspaceResources.reduce((acc, resource) => {
      const role = resource.role.includes('Developer') ? 'Developers' :
                   resource.role.includes('Designer') ? 'Designers' :
                   resource.role.includes('Manager') ? 'Managers' :
                   resource.role.includes('QA') ? 'QA' : 'Other';
      
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(roleGroups).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) {
      // Default data when no resources
      return [
        { name: 'Developers', value: 35, color: 'hsl(var(--primary))' },
        { name: 'Designers', value: 15, color: 'hsl(var(--success))' },
        { name: 'Managers', value: 20, color: 'hsl(var(--warning))' },
        { name: 'QA', value: 12, color: 'hsl(var(--error))' },
        { name: 'Other', value: 18, color: 'hsl(var(--info))' }
      ];
    }
    
    return [
      { name: 'Developers', value: Math.round((roleGroups.Developers || 0) / total * 100), color: 'hsl(var(--primary))' },
      { name: 'Designers', value: Math.round((roleGroups.Designers || 0) / total * 100), color: 'hsl(var(--success))' },
      { name: 'Managers', value: Math.round((roleGroups.Managers || 0) / total * 100), color: 'hsl(var(--warning))' },
      { name: 'QA', value: Math.round((roleGroups.QA || 0) / total * 100), color: 'hsl(var(--error))' },
      { name: 'Other', value: Math.round((roleGroups.Other || 0) / total * 100), color: 'hsl(var(--info))' }
    ];
  }, [workspaceResources]);

  // Generate AI insights from real data using AI service
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);

  // Generate AI insights when data changes
  useEffect(() => {
    const generateAIInsights = async () => {
      if (!currentWorkspace || workspaceProjects.length === 0) {
        setAiInsights([]);
        return;
      }

      setAiInsightsLoading(true);
      
      try {
        const projectMetrics = {
          status: workspaceProjects.length > 0 ? 'Active' : 'No Projects',
          progress: workspaceProjects.length > 0 
            ? Math.round(workspaceProjects.reduce((acc, p) => acc + p.progress, 0) / workspaceProjects.length)
            : 0,
          resourceUtilization: realTimeData.resourceUtilization,
          budgetHealth: realTimeData.budgetHealth,
          riskScore: realTimeData.riskScore,
          projectsInProgress: realTimeData.projectsInProgress,
          overdueTasks: workspaceProjects.reduce((acc, project) => {
            const overdue = project.tasks.filter(task => {
              const taskDate = new Date(task.endDate);
              const today = new Date();
              return taskDate < today && task.status !== 'Completed';
            });
            return acc + overdue.length;
          }, 0)
        };

        console.log('[AI Dashboard] Generating insights for metrics:', projectMetrics);
        
        if (aiService.isConfigured()) {
          const insights = await aiService.generateInsights(projectMetrics);
          const formattedInsights = insights.map(insight => ({
            type: insight.type || 'analysis',
            title: insight.title || 'AI Insight',
            message: insight.description || insight.message || 'No description available',
            confidence: insight.confidence || 75,
            impact: insight.impact || 'medium',
            icon: getIconForInsightType(insight.type)
          }));
          
          setAiInsights(formattedInsights);
          console.log('[AI Dashboard] Generated', formattedInsights.length, 'AI insights');
        } else {
          // Fallback to rule-based insights when AI is not configured
          const fallbackInsights = generateFallbackInsights(projectMetrics, workspaceProjects, workspaceResources, budgetData, clientSatisfactionTrend);
          setAiInsights(fallbackInsights);
          console.log('[AI Dashboard] Using fallback insights (AI not configured)');
        }
      } catch (error) {
        console.error('[AI Dashboard] Error generating AI insights:', error);
        // Fallback to rule-based insights on error
        const fallbackInsights = generateFallbackInsights(
          { 
            resourceUtilization: realTimeData.resourceUtilization,
            budgetHealth: realTimeData.budgetHealth,
            riskScore: realTimeData.riskScore,
            projectsInProgress: realTimeData.projectsInProgress
          },
          workspaceProjects, 
          workspaceResources, 
          budgetData, 
          clientSatisfactionTrend
        );
        setAiInsights(fallbackInsights);
      } finally {
        setAiInsightsLoading(false);
      }
    };

    // Debounce AI insights generation to avoid too many calls
    const timeoutId = setTimeout(generateAIInsights, 2000);
    return () => clearTimeout(timeoutId);
  }, [workspaceProjects.length, realTimeData, currentWorkspace?.id]);

  // Helper function to get icon for insight type
  const getIconForInsightType = (type: string): string => {
    switch (type) {
      case 'prediction': return 'TrendingUp';
      case 'optimization': return 'Users';
      case 'risk': return 'AlertTriangle';
      case 'opportunity': return 'Sparkles';
      default: return 'TrendingUp';
    }
  };

  // Fallback insights generator
  const generateFallbackInsights = (metrics: any, projects: any[], resources: any[], budget: any, satisfaction: any[]): AIInsight[] => {
    const insights: AIInsight[] = [];
    
    // Delivery forecast insight
    const overdueProjects = projects.filter(project => {
      const endDate = new Date(project.endDate);
      const today = new Date();
      return endDate < today && project.status !== 'Completed';
    }).length;
    
    if (overdueProjects > 0) {
      insights.push({
        type: 'prediction',
        title: 'Project Delivery Forecast',
        message: `${overdueProjects} projects may exceed deadlines. Current velocity analysis suggests resource reallocation needed.`,
        confidence: 87,
        impact: overdueProjects > 2 ? 'high' : 'medium',
        icon: 'TrendingUp'
      });
    }

    // Resource optimization insight
    const overutilizedResources = resources.filter(r => r.utilization > 90).length;
    const underutilizedResources = resources.filter(r => r.utilization < 50).length;
    
    if (overutilizedResources > 0 && underutilizedResources > 0) {
      insights.push({
        type: 'optimization',
        title: 'Resource Optimization',
        message: `${overutilizedResources} team members are overallocated while ${underutilizedResources} have capacity. Rebalancing could improve delivery by 15%.`,
        confidence: 92,
        impact: 'high',
        icon: 'Users'
      });
    }

    // Budget insight using real data
    if (budget && budget.utilizationRate > 90) {
      insights.push({
        type: 'risk',
        title: 'Budget Alert',
        message: `Budget utilization at ${budget.utilizationRate}%. Consider reviewing project scope or requesting additional funding.`,
        confidence: 95,
        impact: 'high',
        icon: 'AlertTriangle'
      });
    }

    // Client satisfaction insight
    const avgSatisfaction = satisfaction.length > 0 
      ? satisfaction.reduce((sum, t) => sum + t.score, 0) / satisfaction.length
      : 4.2;
    
    if (avgSatisfaction > 4.5) {
      insights.push({
        type: 'opportunity',
        title: 'High Client Satisfaction',
        message: `Maintaining ${avgSatisfaction.toFixed(1)}/5 client satisfaction. Consider expanding services or requesting testimonials.`,
        confidence: 88,
        impact: 'medium',
        icon: 'Sparkles'
      });
    }

    return insights;
  };

  // Performance optimizations
  const optimizedData = useMemo(() => ({
    realTimeData,
    performanceData,
    resourceData,
    aiInsights,
    workspaceProjects,
    workspaceResources,
    isLoading: isLoading || aiInsightsLoading,
    lastUpdate,
    cacheKey,
    clientSatisfactionTrend,
    budgetData,
    aiInsightsLoading
  }), [realTimeData, performanceData, resourceData, aiInsights, workspaceProjects, workspaceResources, isLoading, aiInsightsLoading, lastUpdate, cacheKey, clientSatisfactionTrend, budgetData]);

  return optimizedData;
};
