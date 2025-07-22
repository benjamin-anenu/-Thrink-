
import { useState, useEffect } from 'react';
import { useResources as useBasicResources } from '@/hooks/useResources';
import { TaskBasedUtilizationEngine } from '@/services/TaskBasedUtilizationEngine';
import { TaskBasedAssignmentAI } from '@/services/TaskBasedAssignmentAI';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { toast } from 'sonner';
import type { ResourceProfile, TaskUtilizationMetrics, AIAssignmentRecommendation } from '@/types/enhanced-resource';

export const useEnhancedResources = () => {
  const basicResources = useBasicResources();
  const { currentWorkspace } = useWorkspace();
  const [utilizationMetrics, setUtilizationMetrics] = useState<Record<string, TaskUtilizationMetrics>>({});
  const [aiRecommendations, setAiRecommendations] = useState<AIAssignmentRecommendation[]>([]);
  const [resourceProfiles, setResourceProfiles] = useState<ResourceProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const utilizationEngine = new TaskBasedUtilizationEngine();
  const assignmentAI = new TaskBasedAssignmentAI();

  // Load enhanced resource data
  const loadEnhancedData = async () => {
    if (!currentWorkspace?.id) return;
    
    try {
      setLoading(true);
      
      // Load resource profiles
      const { data: profiles } = await supabase
        .from('resource_profiles')
        .select('*')
        .eq('workspace_id', currentWorkspace.id);
      
      if (profiles) {
        setResourceProfiles(profiles);
      }

      // Load utilization metrics for each resource
      const metricsPromises = basicResources.resources.map(async (resource) => {
        const metrics = await utilizationEngine.calculateResourceUtilization(
          resource.id,
          currentWorkspace.id,
          'week'
        );
        return { resourceId: resource.id, metrics };
      });

      const metricsResults = await Promise.all(metricsPromises);
      const metricsMap = metricsResults.reduce((acc, { resourceId, metrics }) => {
        acc[resourceId] = metrics;
        return acc;
      }, {} as Record<string, TaskUtilizationMetrics>);

      setUtilizationMetrics(metricsMap);

      // Load AI recommendations
      const { data: recommendations } = await supabase
        .from('ai_assignment_recommendations')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (recommendations) {
        setAiRecommendations(recommendations);
      }

    } catch (error) {
      console.error('Error loading enhanced resource data:', error);
      toast.error('Failed to load enhanced resource data');
    } finally {
      setLoading(false);
    }
  };

  // Generate AI assignment recommendations
  const generateAssignmentRecommendations = async (projectId: string) => {
    if (!currentWorkspace?.id) return;

    try {
      const recommendations = await assignmentAI.generateRecommendations(
        projectId,
        currentWorkspace.id
      );
      
      setAiRecommendations(prev => [...recommendations, ...prev]);
      toast.success(`Generated ${recommendations.length} AI recommendations`);
      
      return recommendations;
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      toast.error('Failed to generate AI recommendations');
      return [];
    }
  };

  // Update resource utilization
  const updateResourceUtilization = async (resourceId: string) => {
    if (!currentWorkspace?.id) return;

    try {
      const metrics = await utilizationEngine.calculateResourceUtilization(
        resourceId,
        currentWorkspace.id,
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
