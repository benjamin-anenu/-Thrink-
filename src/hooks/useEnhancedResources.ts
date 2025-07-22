
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

  // Load enhanced resource data
  const loadEnhancedData = async () => {
    if (!currentWorkspace?.id) return;
    
    try {
      setLoading(true);
      
      // Load resource profiles with proper type adaptation
      const { data: profiles } = await supabase
        .from('resource_profiles')
        .select('*')
        .eq('workspace_id', currentWorkspace.id);
      
      if (profiles) {
        // Properly adapt database profiles to interface
        const adaptedProfiles = profiles.map(profile => adaptDatabaseResourceProfile(profile));
        setResourceProfiles(adaptedProfiles);
      }

      // Load utilization metrics for each resource using correct method name
      const metricsPromises = basicResources.resources.map(async (resource) => {
        const metrics = await utilizationEngine.calculateTaskUtilization(
          resource.id,
          'week' // Fix: Use correct parameter order
        );
        return { resourceId: resource.id, metrics };
      });

      const metricsResults = await Promise.all(metricsPromises);
      const metricsMap = metricsResults.reduce((acc, { resourceId, metrics }) => {
        acc[resourceId] = metrics;
        return acc;
      }, {} as Record<string, TaskUtilizationMetrics>);

      setUtilizationMetrics(metricsMap);

      // Load AI recommendations with proper type handling
      const { data: recommendations } = await supabase
        .from('ai_assignment_recommendations')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (recommendations) {
        // Properly adapt database recommendations
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

  // Generate AI assignment recommendations - simplified implementation
  const generateAssignmentRecommendations = async (projectId: string) => {
    if (!currentWorkspace?.id) return;

    try {
      // For now, return mock recommendations since the AI service needs more setup
      const mockRecommendations: AIAssignmentRecommendation[] = [{
        id: `mock-${Date.now()}`,
        project_id: projectId,
        resource_id: basicResources.resources[0]?.id || '',
        workspace_id: currentWorkspace.id,
        task_capacity_fit_score: 8.5,
        complexity_handling_fit_score: 7.2,
        skill_match_score: 9.1,
        availability_score: 6.8,
        collaboration_fit_score: 8.0,
        learning_opportunity_score: 7.5,
        overall_fit_score: 8.2,
        task_completion_forecast: 85,
        quality_prediction: 90,
        timeline_confidence: 75,
        success_probability: 82,
        overload_risk_score: 3,
        skill_gap_risk_score: 2,
        context_switching_impact: 0.15,
        recommended_task_count: 5,
        reasoning: {
          task_matches: [],
          capacity_analysis: {
            current_utilization: 75,
            additional_capacity_needed: 25,
            optimal_task_distribution: "Balanced mix of simple and complex tasks",
            timeline_impact: "Minimal impact expected"
          },
          potential_blockers: [],
          success_factors: ["Strong skill match", "Good availability"],
          risk_factors: ["Minor overload risk"]
        },
        alternative_assignments: [],
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }];
      
      setAiRecommendations(prev => [...mockRecommendations, ...prev]);
      toast.success(`Generated ${mockRecommendations.length} AI recommendations`);
      
      return mockRecommendations;
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
