
import { useState, useEffect } from 'react';
import { useResources as useBasicResources } from '@/hooks/useResources';
import { TaskBasedUtilizationEngine } from '@/services/TaskBasedUtilizationEngine';
import { TaskBasedAssignmentAI } from '@/services/TaskBasedAssignmentAI';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { toast } from 'sonner';
import type { ResourceProfile, TaskUtilizationMetrics, AIAssignmentRecommendation } from '@/types/enhanced-resource';
import { adaptDatabaseResourceProfile } from '@/types/database-adapters';

export const useEnhancedResources = () => {
  const basicResources = useBasicResources();
  const { currentWorkspace } = useWorkspace();
  const [utilizationMetrics, setUtilizationMetrics] = useState<Record<string, TaskUtilizationMetrics>>({});
  const [aiRecommendations, setAiRecommendations] = useState<AIAssignmentRecommendation[]>([]);
  const [resourceProfiles, setResourceProfiles] = useState<ResourceProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const utilizationEngine = new TaskBasedUtilizationEngine();
  const assignmentAI = new TaskBasedAssignmentAI();

  // Helper function to ensure resource has required array properties
  const sanitizeResource = (resource: any): any => {
    return {
      ...resource,
      skills: Array.isArray(resource.skills) ? resource.skills : [],
      currentProjects: Array.isArray(resource.currentProjects) ? resource.currentProjects : [],
      workspace_id: resource.workspace_id || currentWorkspace?.id || '',
      created_at: resource.created_at || new Date().toISOString(),
      updated_at: resource.updated_at || new Date().toISOString()
    };
  };

  // Load enhanced resource data
  const loadEnhancedData = async () => {
    if (!currentWorkspace?.id) return;
    
    try {
      setLoading(true);
      console.log('Loading enhanced resource data for workspace:', currentWorkspace.id);
      
      // Load resource profiles with proper type adaptation
      const { data: profiles, error: profilesError } = await supabase
        .from('resource_profiles')
        .select('*')
        .eq('workspace_id', currentWorkspace.id);
      
      if (profilesError) {
        console.error('Error loading resource profiles:', profilesError);
      } else if (profiles) {
        console.log('Loaded resource profiles:', profiles.length);
        const adaptedProfiles = profiles.map(profile => adaptDatabaseResourceProfile(profile));
        setResourceProfiles(adaptedProfiles);
      }

      // Load utilization metrics
      const { data: metrics, error: metricsError } = await supabase
        .from('resource_utilization_metrics')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false });

      if (metricsError) {
        console.error('Error loading utilization metrics:', metricsError);
      } else if (metrics) {
        console.log('Loaded utilization metrics:', metrics.length);
        const metricsMap = metrics.reduce((acc, metric) => {
          acc[metric.resource_id] = {
            task_count: metric.task_count,
            task_capacity: metric.task_capacity,
            utilization_percentage: metric.utilization_percentage,
            weighted_task_load: metric.weighted_task_load,
            weighted_capacity: metric.weighted_capacity,
            weighted_utilization: metric.weighted_utilization,
            simple_tasks: metric.simple_tasks,
            medium_tasks: metric.medium_tasks,
            complex_tasks: metric.complex_tasks,
            tasks_completed: metric.tasks_completed || 0, // Include tasks_completed
            status: metric.utilization_status as any,
            utilization_trend: 0,
            optimal_task_range: [5, 15] as [number, number],
            predicted_completion_count: metric.tasks_completed || 0,
            bottleneck_risk: metric.bottleneck_risk_score,
            context_switch_penalty: metric.context_switch_penalty
          };
          return acc;
        }, {} as Record<string, TaskUtilizationMetrics>);

        setUtilizationMetrics(metricsMap);
      }

      // Load AI recommendations with proper type handling
      const { data: recommendations, error: recommendationsError } = await supabase
        .from('ai_assignment_recommendations')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (recommendationsError) {
        console.error('Error loading AI recommendations:', recommendationsError);
      } else if (recommendations) {
        console.log('Loaded AI recommendations:', recommendations.length);
        const adaptedRecommendations = recommendations.map(rec => ({
          ...rec,
          reasoning: typeof rec.reasoning === 'string' ? JSON.parse(rec.reasoning) : rec.reasoning,
          alternative_assignments: typeof rec.alternative_assignments === 'string' 
            ? JSON.parse(rec.alternative_assignments) 
            : rec.alternative_assignments
        })) as AIAssignmentRecommendation[];
        
        setAiRecommendations(adaptedRecommendations);
      }

    } catch (error) {
      console.error('Error loading enhanced resource data:', error);
      toast.error('Failed to load enhanced resource data');
    } finally {
      setLoading(false);
    }
  };

  // Generate AI assignment recommendations - enhanced implementation
  const generateAssignmentRecommendations = async (projectId: string) => {
    if (!currentWorkspace?.id) return;

    try {
      console.log('Generating AI recommendations for project:', projectId);
      
      const recommendations = await assignmentAI.generateRecommendations(
        projectId, 
        currentWorkspace.id
      );
      
      if (recommendations.length > 0) {
        setAiRecommendations(prev => [...recommendations, ...prev]);
        toast.success(`Generated ${recommendations.length} AI recommendations`);
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      toast.error('Failed to generate AI recommendations');
      return [];
    }
  };

  // Update resource utilization using correct method name
  const updateResourceUtilization = async (resourceId: string) => {
    if (!currentWorkspace?.id) return;

    try {
      console.log('Updating utilization for resource:', resourceId);
      
      const metrics = await utilizationEngine.calculateTaskUtilization(
        resourceId,
        'week'
      );
      
      setUtilizationMetrics(prev => ({
        ...prev,
        [resourceId]: metrics
      }));

      return metrics;
    } catch (error) {
      console.error('Error updating resource utilization:', error);
      toast.error('Failed to update resource utilization');
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!currentWorkspace?.id) return;

    console.log('Setting up real-time subscriptions for workspace:', currentWorkspace.id);

    const channel = supabase
      .channel(`enhanced_resources_${currentWorkspace.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'resource_utilization_metrics',
          filter: `workspace_id=eq.${currentWorkspace.id}`
        },
        (payload) => {
          console.log('Utilization metrics updated:', payload);
          loadEnhancedData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_assignment_recommendations',
          filter: `workspace_id=eq.${currentWorkspace.id}`
        },
        (payload) => {
          console.log('AI recommendations updated:', payload);
          loadEnhancedData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'resource_profiles',
          filter: `workspace_id=eq.${currentWorkspace.id}`
        },
        (payload) => {
          console.log('Resource profiles updated:', payload);
          loadEnhancedData();
        }
      )
      .subscribe();

    return () => {
      console.log('Unsubscribing from real-time updates');
      supabase.removeChannel(channel);
    };
  }, [currentWorkspace?.id]);

  useEffect(() => {
    loadEnhancedData();
  }, [currentWorkspace?.id, basicResources.resources.length]);

  return {
    ...basicResources,
    utilizationMetrics,
    aiRecommendations,
    resourceProfiles,
    enhancedLoading: loading,
    generateAssignmentRecommendations,
    updateResourceUtilization,
    refreshEnhancedData: loadEnhancedData
  };
};
