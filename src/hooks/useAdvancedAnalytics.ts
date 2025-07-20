import { useState, useEffect, useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useResources, Resource } from '@/contexts/ResourceContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { 
  advancedAnalyticsEngine, 
  AdvancedAnalytics, 
  VelocityMetrics, 
  QualityMetrics, 
  ResourceEfficiency, 
  RiskIndicator, 
  PredictiveInsight 
} from '@/services/AdvancedAnalyticsEngine';
import { EventBus } from '@/services/EventBus';

export interface AnalyticsState {
  analytics: AdvancedAnalytics | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  cacheStats: { size: number; lastUpdate: Date };
}

export interface AnalyticsFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  projectIds?: string[];
  resourceIds?: string[];
  riskSeverity?: ('low' | 'medium' | 'high' | 'critical')[];
}

export const useAdvancedAnalytics = (filters?: AnalyticsFilters) => {
  const { projects } = useProject();
  const { resources } = useResources();
  const { currentWorkspace } = useWorkspace();
  
  const [analyticsState, setAnalyticsState] = useState<AnalyticsState>({
    analytics: null,
    isLoading: true,
    error: null,
    lastUpdate: null,
    cacheStats: { size: 0, lastUpdate: new Date(0) }
  });

  // Filter data based on provided filters
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(project => 
      currentWorkspace ? project.workspaceId === currentWorkspace.id : true
    );

    if (filters?.projectIds?.length) {
      filtered = filtered.filter(p => filters.projectIds!.includes(p.id));
    }

    if (filters?.dateRange) {
      filtered = filtered.filter(p => {
        const projectStart = new Date(p.startDate);
        const projectEnd = new Date(p.endDate);
        return projectStart >= filters.dateRange!.start && projectEnd <= filters.dateRange!.end;
      });
    }

    return filtered;
  }, [projects, currentWorkspace, filters]);

  const filteredResources = useMemo(() => {
    let filtered = resources.filter(resource => 
      currentWorkspace ? resource.workspaceId === currentWorkspace.id : true
    );

    if (filters?.resourceIds?.length) {
      filtered = filtered.filter(r => filters.resourceIds!.includes(r.id));
    }

    return filtered;
  }, [resources, currentWorkspace, filters]);

  // Generate analytics when data changes
  useEffect(() => {
    const generateAnalytics = async () => {
      if (!currentWorkspace || filteredProjects.length === 0) {
        setAnalyticsState(prev => ({
          ...prev,
          analytics: null,
          isLoading: false,
          error: 'No data available for analysis'
        }));
        return;
      }

      setAnalyticsState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        console.log('[Advanced Analytics] Generating analytics for', filteredProjects.length, 'projects and', filteredResources.length, 'resources');
        
        const analytics = await advancedAnalyticsEngine.generateAdvancedAnalytics(
          filteredProjects,
          filteredResources,
          currentWorkspace.id
        );

        // Apply additional filters to analytics results
        const filteredAnalytics = applyFiltersToAnalytics(analytics, filters);

        setAnalyticsState({
          analytics: filteredAnalytics,
          isLoading: false,
          error: null,
          lastUpdate: new Date(),
          cacheStats: advancedAnalyticsEngine.getCacheStats()
        });

        console.log('[Advanced Analytics] Analytics generated successfully with', analytics.insights.length, 'insights');
      } catch (error) {
        console.error('[Advanced Analytics] Failed to generate analytics:', error);
        setAnalyticsState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Analytics generation failed'
        }));
      }
    };

    // Debounce analytics generation to avoid excessive calls
    const timeoutId = setTimeout(generateAnalytics, 1000);
    return () => clearTimeout(timeoutId);
  }, [filteredProjects, filteredResources, currentWorkspace, filters]);

  // Listen for real-time events that should trigger analytics refresh
  useEffect(() => {
    const eventBus = EventBus.getInstance();
    
    const handleDataUpdate = () => {
      console.log('[Advanced Analytics] Real-time data update detected');
      // Clear cache to force fresh analytics generation
      advancedAnalyticsEngine.clearCache();
    };

    const unsubscribers = [
      eventBus.subscribe('task_completed', handleDataUpdate),
      eventBus.subscribe('project_updated', handleDataUpdate),
      eventBus.subscribe('resource_updated', handleDataUpdate),
      eventBus.subscribe('milestone_reached', handleDataUpdate)
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // Helper function to apply filters to analytics results
  const applyFiltersToAnalytics = (analytics: AdvancedAnalytics, filters?: AnalyticsFilters): AdvancedAnalytics => {
    if (!filters) return analytics;

    let filteredRisks = analytics.activeRisks;
    if (filters.riskSeverity?.length) {
      filteredRisks = analytics.activeRisks.filter(risk => 
        filters.riskSeverity!.includes(risk.severity)
      );
    }

    return {
      ...analytics,
      activeRisks: filteredRisks
    };
  };

  // Utility functions for specific analytics
  const getProjectVelocity = (projectId: string): VelocityMetrics | null => {
    return analyticsState.analytics?.projectVelocities.get(projectId) || null;
  };

  const getProjectQuality = (projectId: string): QualityMetrics | null => {
    return analyticsState.analytics?.projectQuality.get(projectId) || null;
  };

  const getResourceEfficiency = (resourceId: string): ResourceEfficiency | null => {
    return analyticsState.analytics?.resourceEfficiencies.find(r => r.resourceId === resourceId) || null;
  };

  const getHighPriorityInsights = (): PredictiveInsight[] => {
    if (!analyticsState.analytics) return [];
    
    return analyticsState.analytics.insights
      .filter(insight => insight.impact === 'high' && insight.confidence >= 70)
      .slice(0, 5);
  };

  const getCriticalRisks = (): RiskIndicator[] => {
    if (!analyticsState.analytics) return [];
    
    return analyticsState.analytics.activeRisks
      .filter(risk => risk.severity === 'critical' || risk.severity === 'high')
      .slice(0, 5);
  };

  const getTopPerformers = (): ResourceEfficiency[] => {
    if (!analyticsState.analytics) return [];
    
    return analyticsState.analytics.teamPerformance.topPerformers;
  };

  const getUnderPerformers = (): ResourceEfficiency[] => {
    if (!analyticsState.analytics) return [];
    
    return analyticsState.analytics.teamPerformance.underPerformers;
  };

  // Performance metrics
  const getPerformanceSummary = () => {
    if (!analyticsState.analytics) return null;

    const { workspaceVelocity, overallQuality, teamPerformance, benchmarks } = analyticsState.analytics;
    
    return {
      velocity: {
        current: workspaceVelocity.currentVelocity,
        average: workspaceVelocity.averageVelocity,
        trend: workspaceVelocity.velocityTrend,
        predictedCompletion: workspaceVelocity.predictedCompletion
      },
      quality: {
        score: overallQuality.qualityScore,
        reworkRate: overallQuality.reworkRate,
        trend: overallQuality.qualityTrend
      },
      team: {
        averageEfficiency: teamPerformance.averageEfficiency,
        utilization: teamPerformance.capacityUtilization,
        topPerformersCount: teamPerformance.topPerformers.length,
        underPerformersCount: teamPerformance.underPerformers.length
      },
      benchmarks: {
        vsIndustry: benchmarks.industryAverage ? benchmarks.workspaceAverage - benchmarks.industryAverage : 0,
        vsBest: benchmarks.teamBest - benchmarks.workspaceAverage,
        improvementPotential: benchmarks.improvementPotential
      }
    };
  };

  // Trend analysis
  const getTrendAnalysis = () => {
    if (!analyticsState.analytics) return null;

    const { workspaceVelocity, riskTrends } = analyticsState.analytics;
    
    return {
      velocity: {
        history: workspaceVelocity.velocityHistory,
        trend: workspaceVelocity.velocityTrend,
        projection: workspaceVelocity.predictedCompletion
      },
      risks: {
        history: riskTrends,
        current: analyticsState.analytics.activeRisks.reduce((sum, risk) => sum + risk.riskScore, 0) / Math.max(1, analyticsState.analytics.activeRisks.length)
      }
    };
  };

  // Refresh analytics manually
  const refreshAnalytics = () => {
    advancedAnalyticsEngine.clearCache();
    setAnalyticsState(prev => ({ ...prev, isLoading: true }));
  };

  // Export data for reports
  const exportAnalyticsData = () => {
    if (!analyticsState.analytics) return null;

    return {
      timestamp: new Date().toISOString(),
      workspace: currentWorkspace?.name || 'Unknown',
      summary: getPerformanceSummary(),
      insights: analyticsState.analytics.insights,
      risks: analyticsState.analytics.activeRisks,
      resources: analyticsState.analytics.resourceEfficiencies,
      trends: getTrendAnalysis()
    };
  };

  return {
    // Core state
    ...analyticsState,
    
    // Utility functions
    getProjectVelocity,
    getProjectQuality,
    getResourceEfficiency,
    getHighPriorityInsights,
    getCriticalRisks,
    getTopPerformers,
    getUnderPerformers,
    
    // Summary functions
    getPerformanceSummary,
    getTrendAnalysis,
    
    // Actions
    refreshAnalytics,
    exportAnalyticsData,
    
    // Metadata
    hasData: analyticsState.analytics !== null,
    projectCount: filteredProjects.length,
    resourceCount: filteredResources.length,
    insightCount: analyticsState.analytics?.insights.length || 0,
    riskCount: analyticsState.analytics?.activeRisks.length || 0
  };
};

export default useAdvancedAnalytics;