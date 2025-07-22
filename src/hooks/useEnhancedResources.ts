import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import type { Resource } from '@/types/resource';

export const useEnhancedResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  const loadResources = async () => {
    if (!currentWorkspace) {
      setResources([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('name');

      if (error) throw error;
      
      setResources(data || []);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const refreshResources = async () => {
    await loadResources();
  };

  useEffect(() => {
    loadResources();
    
    // Set up real-time subscriptions
    const resourceSubscription = supabase
      .channel('resources_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'resources',
          filter: `workspace_id=eq.${currentWorkspace?.id}`
        },
        () => {
          loadResources();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(resourceSubscription);
    };
  }, [currentWorkspace]);

  // Create mock utilization metrics for existing resources
  const mockUtilizationMetrics = resources.reduce((acc, resource) => {
    acc[resource.id] = {
      utilization_percentage: Math.floor(Math.random() * 100),
      status: ['Available', 'Busy', 'Overloaded'][Math.floor(Math.random() * 3)],
      bottleneck_risk: Math.floor(Math.random() * 10),
      task_count: Math.floor(Math.random() * 20),
      task_capacity: Math.floor(Math.random() * 25) + 5,
      predicted_completion_count: Math.floor(Math.random() * 15)
    };
    return acc;
  }, {} as Record<string, any>);

  // Create mock AI recommendations with all expected properties
  const mockAiRecommendations = resources.slice(0, 3).map(resource => ({
    id: `rec-${resource.id}`,
    resource_id: resource.id,
    overall_fit_score: Math.floor(Math.random() * 10) + 1,
    task_completion_forecast: Math.floor(Math.random() * 100),
    predicted_completion_count: Math.floor(Math.random() * 15),
    overload_risk_score: Math.floor(Math.random() * 10),
    success_probability: Math.floor(Math.random() * 100),
    task_capacity_fit_score: Math.floor(Math.random() * 10) + 1,
    skill_match_score: Math.floor(Math.random() * 10) + 1,
    availability_score: Math.floor(Math.random() * 10) + 1,
    recommended_task_count: Math.floor(Math.random() * 10) + 1,
    quality_prediction: Math.floor(Math.random() * 100)
  }));

  return {
    resources,
    loading,
    refreshResources,
    utilizationMetrics: mockUtilizationMetrics,
    aiRecommendations: mockAiRecommendations,
    refreshEnhancedData: refreshResources,
  };
};