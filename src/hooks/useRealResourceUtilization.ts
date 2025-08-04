import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { toast } from 'sonner';

export interface TaskUtilizationMetrics {
  task_count: number;
  task_capacity: number;
  utilization_percentage: number;
  weighted_task_load: number;
  weighted_capacity: number;
  weighted_utilization: number;
  simple_tasks: number;
  medium_tasks: number;
  complex_tasks: number;
  tasks_completed: number;
  status: 'Well Utilized' | 'Overloaded' | 'Underutilized' | 'Optimally Loaded' | 'Moderately Utilized' | 'Severely Overloaded';
  utilization_trend: number;
  optimal_task_range: [number, number];
  predicted_completion_count: number;
  bottleneck_risk: number;
  context_switch_penalty: number;
}

export interface AIAssignmentRecommendation {
  id: string;
  project_id: string;
  resource_id: string;
  skill_match_score: number;
  availability_score: number;
  task_capacity_fit_score: number;
  complexity_handling_fit_score: number;
  collaboration_fit_score: number;
  learning_opportunity_score: number;
  overall_fit_score: number;
  reasoning: any;
  // Optional fields that may not always be present
  recommended_task_count?: number;
  quality_prediction?: number;
  success_probability?: number;
  overload_risk_score?: number;
  task_completion_forecast?: number;
}

export const useRealResourceUtilization = (resourceIds: string[]) => {
  const [utilizationMetrics, setUtilizationMetrics] = useState<Record<string, TaskUtilizationMetrics>>({});
  const [aiRecommendations, setAiRecommendations] = useState<AIAssignmentRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  const calculateUtilizationForResource = async (resourceId: string): Promise<TaskUtilizationMetrics> => {
    if (!currentWorkspace) {
      return createDefaultMetrics();
    }

    try {
      // Get all tasks for this resource and categorize them
      const { data: allTasks, error: allTaskError } = await supabase
        .from('project_tasks')
        .select('id, status, complexity_score, assigned_resources, assignee_id, updated_at, created_at')
        .or(`assignee_id.eq.${resourceId},"${resourceId}"=any(assigned_resources)`);

      if (allTaskError) {
        console.error('Error fetching tasks:', allTaskError);
        return createDefaultMetrics();
      }

      const allTasksData = allTasks || [];
      console.log(`Resource ${resourceId} - Total tasks found:`, allTasksData.length, allTasksData.map(t => ({ name: t.id, status: t.status })));
      
      // Active tasks are all non-completed tasks
      const taskData = allTasksData.filter(task => task.status !== 'Completed');
      console.log(`Resource ${resourceId} - Active tasks:`, taskData.length);

      const tasks = taskData;
      const taskCount = tasks.length;
      const taskCapacity = 10; // Default capacity
      const utilizationPercentage = Math.min((taskCount / taskCapacity) * 100, 100);

      // Calculate task complexity breakdown
      let simpleTasksCount = 0;
      let mediumTasksCount = 0;
      let complexTasksCount = 0;

      tasks.forEach(task => {
        const complexity = task.complexity_score || 3;
        if (complexity <= 3) simpleTasksCount++;
        else if (complexity <= 7) mediumTasksCount++;
        else complexTasksCount++;
      });

      // Get completed tasks count (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const completedTasks = allTasksData.filter(task => 
        task.status === 'Completed' && 
        new Date(task.updated_at || task.created_at) >= thirtyDaysAgo
      );

      const tasksCompleted = completedTasks.length;

      // Determine status based on utilization
      let status: TaskUtilizationMetrics['status'];
      if (utilizationPercentage === 0) status = 'Underutilized';
      else if (utilizationPercentage <= 30) status = 'Underutilized';
      else if (utilizationPercentage <= 70) status = 'Well Utilized';
      else if (utilizationPercentage <= 90) status = 'Optimally Loaded';
      else if (utilizationPercentage <= 100) status = 'Overloaded';
      else status = 'Severely Overloaded';

      return {
        task_count: taskCount,
        task_capacity: taskCapacity,
        utilization_percentage: Math.round(utilizationPercentage),
        weighted_task_load: taskCount,
        weighted_capacity: taskCapacity,
        weighted_utilization: Math.round(utilizationPercentage),
        simple_tasks: simpleTasksCount,
        medium_tasks: mediumTasksCount,
        complex_tasks: complexTasksCount,
        tasks_completed: tasksCompleted,
        status,
        utilization_trend: 0, // Could be calculated based on historical data
        optimal_task_range: [5, 15],
        predicted_completion_count: Math.round(taskCount * 0.8), // 80% completion rate estimate
        bottleneck_risk: taskCount > 8 ? Math.min(taskCount - 5, 10) : 0,
        context_switch_penalty: Math.min(taskCount * 0.1, 3)
      };
    } catch (error) {
      console.error('Error calculating utilization:', error);
      return createDefaultMetrics();
    }
  };

  const createDefaultMetrics = (): TaskUtilizationMetrics => ({
    task_count: 0,
    task_capacity: 10,
    utilization_percentage: 0,
    weighted_task_load: 0,
    weighted_capacity: 10,
    weighted_utilization: 0,
    simple_tasks: 0,
    medium_tasks: 0,
    complex_tasks: 0,
    tasks_completed: 0,
    status: 'Underutilized',
    utilization_trend: 0,
    optimal_task_range: [5, 15],
    predicted_completion_count: 0,
    bottleneck_risk: 0,
    context_switch_penalty: 0
  });

  const loadUtilizationData = async () => {
    if (!currentWorkspace || resourceIds.length === 0) {
      setUtilizationMetrics({});
      setAiRecommendations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Calculate real-time utilization for each resource
      const metricsPromises = resourceIds.map(async (resourceId) => {
        const metrics = await calculateUtilizationForResource(resourceId);
        return { resourceId, metrics };
      });

      const calculatedMetrics = await Promise.all(metricsPromises);
      
      // Transform to metrics map
      const metricsMap: Record<string, TaskUtilizationMetrics> = {};
      calculatedMetrics.forEach(({ resourceId, metrics }) => {
        metricsMap[resourceId] = metrics;
      });

      setUtilizationMetrics(metricsMap);

      // Fetch AI recommendations
      const { data: aiData, error: aiError } = await supabase
        .from('ai_assignment_recommendations')
        .select('*')
        .in('resource_id', resourceIds)
        .eq('workspace_id', currentWorkspace.id)
        .gte('expires_at', new Date().toISOString());

      if (aiError) {
        console.error('Error fetching AI recommendations:', aiError);
        setAiRecommendations([]);
      } else {
        setAiRecommendations(aiData || []);
      }

    } catch (error) {
      console.error('Error loading utilization data:', error);
      toast.error('Failed to load resource utilization data');
    } finally {
      setLoading(false);
    }
  };

  const refreshUtilizationData = async () => {
    await loadUtilizationData();
  };

  useEffect(() => {
    loadUtilizationData();
  }, [currentWorkspace, resourceIds.join(',')]);

  return {
    utilizationMetrics,
    aiRecommendations,
    loading,
    refreshUtilizationData,
  };
};