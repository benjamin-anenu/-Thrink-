
import { useState, useEffect, useMemo } from 'react';
import { PerformanceTracker } from '@/services/PerformanceTracker';
import { aiInsightsService } from '@/services/AIInsightsService';
import { useProject } from '@/contexts/ProjectContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { EventBus } from '@/services/EventBus';

export interface ProjectInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  category: 'performance' | 'risk' | 'optimization' | 'deadline';
  title: string;
  description: string;
  actionable: boolean;
  projectId?: string;
  resourceId?: string;
}

export interface ProjectInsightsData {
  insights: ProjectInsight[];
  teamPerformance: {
    averageScore: number;
    trend: 'improving' | 'stable' | 'declining';
    highPerformers: number;
    lowPerformers: number;
    riskFactors: string[];
  };
  deadlineStatus: {
    onTrack: number;
    atRisk: number;
    overdue: number;
    upcomingDeadlines: number;
  };
  recommendations: string[];
  isLoading: boolean;
  error: string | null;
}

export const useProjectInsights = (projectId?: string) => {
  const [data, setData] = useState<ProjectInsightsData>({
    insights: [],
    teamPerformance: {
      averageScore: 0,
      trend: 'stable',
      highPerformers: 0,
      lowPerformers: 0,
      riskFactors: []
    },
    deadlineStatus: {
      onTrack: 0,
      atRisk: 0,
      overdue: 0,
      upcomingDeadlines: 0
    },
    recommendations: [],
    isLoading: true,
    error: null
  });

  const { projects } = useProject();
  const { currentWorkspace } = useWorkspace();
  const performanceTracker = PerformanceTracker.getInstance();
  const eventBus = EventBus.getInstance();

  // Filter projects by workspace if no specific projectId is provided
  const workspaceProjects = useMemo(() => {
    return projects.filter(project => 
      project.workspace_id === currentWorkspace?.id &&
      (!projectId || project.id === projectId)
    );
  }, [projects, currentWorkspace?.id, projectId]);

  const generateInsights = (targetProjectId?: string) => {
    try {
      const insights: ProjectInsight[] = [];
      const projectsToAnalyze = targetProjectId 
        ? workspaceProjects.filter(p => p.id === targetProjectId)
        : workspaceProjects;

      // Performance insights
      let totalScore = 0;
      let projectCount = 0;
      let highPerformers = 0;
      let lowPerformers = 0;
      const riskFactors: string[] = [];

      // Deadline analysis
      let onTrack = 0;
      let atRisk = 0;
      let overdue = 0;
      let upcomingDeadlines = 0;

      projectsToAnalyze.forEach(project => {
        projectCount++;

        // Get AI insights for this project
        const aiInsights = aiInsightsService.getProjectInsights(project.id);
        aiInsights.forEach(aiInsight => {
          insights.push({
            id: aiInsight.id,
            type: aiInsight.type === 'risk' ? 'warning' : aiInsight.type === 'opportunity' ? 'success' : 'info',
            category: aiInsight.category as any,
            title: aiInsight.title,
            description: aiInsight.description,
            actionable: aiInsight.status === 'active',
            projectId: project.id
          });
        });

        // Get performance insights
        const performanceInsights = performanceTracker.getProjectPerformanceInsights(project.id);
        if (performanceInsights) {
          totalScore += performanceInsights.averagePerformance;
          
          if (performanceInsights.averagePerformance > 80) {
            highPerformers++;
            insights.push({
              id: `perf-high-${project.id}`,
              type: 'success',
              category: 'performance',
              title: 'High Team Performance',
              description: `${project.name} team is performing exceptionally well (${performanceInsights.averagePerformance.toFixed(1)}/100)`,
              actionable: false,
              projectId: project.id
            });
          } else if (performanceInsights.averagePerformance < 60) {
            lowPerformers++;
            insights.push({
              id: `perf-low-${project.id}`,
              type: 'warning',
              category: 'performance',
              title: 'Performance Concern',
              description: `${project.name} team performance is below expectations (${performanceInsights.averagePerformance.toFixed(1)}/100)`,
              actionable: true,
              projectId: project.id
            });
          }

          riskFactors.push(...performanceInsights.riskFactors);
          performanceInsights.recommendations.forEach(rec => {
            insights.push({
              id: `rec-${project.id}-${Date.now()}`,
              type: 'info',
              category: 'optimization',
              title: 'Optimization Opportunity',
              description: rec,
              actionable: true,
              projectId: project.id
            });
          });
        }

        // Deadline analysis
        const today = new Date();
        const projectEndDate = new Date(project.end_date);
        const daysToDeadline = Math.ceil((projectEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (project.status === 'completed') {
          onTrack++;
        } else if (daysToDeadline < 0) {
          overdue++;
          insights.push({
            id: `deadline-overdue-${project.id}`,
            type: 'error',
            category: 'deadline',
            title: 'Project Overdue',
            description: `${project.name} is ${Math.abs(daysToDeadline)} days overdue`,
            actionable: true,
            projectId: project.id
          });
        } else if (daysToDeadline <= 7) {
          upcomingDeadlines++;
          insights.push({
            id: `deadline-upcoming-${project.id}`,
            type: 'warning',
            category: 'deadline',
            title: 'Upcoming Deadline',
            description: `${project.name} deadline is in ${daysToDeadline} days`,
            actionable: true,
            projectId: project.id
          });
        } else if ((project.progress || 0) > (1 - daysToDeadline / 100) * 100) {
          onTrack++;
        } else {
          atRisk++;
          insights.push({
            id: `deadline-risk-${project.id}`,
            type: 'warning',
            category: 'deadline',
            title: 'Schedule Risk',
            description: `${project.name} may miss deadline based on current progress`,
            actionable: true,
            projectId: project.id
          });
        }
      });

      // Generate recommendations
      const recommendations: string[] = [];
      if (lowPerformers > 0) {
        recommendations.push('Review workload distribution and provide additional support');
      }
      if (overdue > 0) {
        recommendations.push('Implement deadline tracking and escalation procedures');
      }
      if (totalScore / Math.max(projectCount, 1) > 85) {
        recommendations.push('Consider expanding project scope or taking on additional initiatives');
      }

      const averageScore = projectCount > 0 ? totalScore / projectCount : 75;
      const trend = highPerformers > lowPerformers ? 'improving' : lowPerformers > highPerformers ? 'declining' : 'stable';

      setData({
        insights: insights.sort((a, b) => {
          const typeOrder = { error: 0, warning: 1, success: 2, info: 3 };
          return typeOrder[a.type] - typeOrder[b.type];
        }),
        teamPerformance: {
          averageScore,
          trend,
          highPerformers,
          lowPerformers,
          riskFactors: [...new Set(riskFactors)]
        },
        deadlineStatus: {
          onTrack,
          atRisk,
          overdue,
          upcomingDeadlines
        },
        recommendations,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('[useProjectInsights] Error generating insights:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load insights'
      }));
    }
  };

  useEffect(() => {
    if (currentWorkspace && workspaceProjects.length > 0) {
      generateInsights(projectId);
    }
  }, [currentWorkspace, workspaceProjects, projectId]);

  // Listen for real-time updates
  useEffect(() => {
    const handleInsightsUpdate = () => {
      generateInsights(projectId);
    };

    const unsubscribe = eventBus.subscribe('ai_insights_updated', handleInsightsUpdate);
    const unsubscribePerf = eventBus.subscribe('performance_updated', handleInsightsUpdate);
    const unsubscribeRisk = eventBus.subscribe('risk_event', handleInsightsUpdate);

    return () => {
      unsubscribe();
      unsubscribePerf();
      unsubscribeRisk();
    };
  }, [projectId]);

  return data;
};
