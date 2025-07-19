
import { useState, useEffect } from 'react';
import { useResources } from '@/contexts/ResourceContext';
import { useProjects } from '@/hooks/useProjects';

export interface ResourceMetrics {
  totalResources: number;
  overallocatedCount: number;
  underutilizedCount: number;
  availableCount: number;
  avgUtilization: number;
}

export interface AssignmentSuggestion {
  taskId: string;
  taskName: string;
  suggestedResourceId: string;
  suggestedResourceName: string;
  confidence: number;
  reason: string;
  skillMatch: string[];
}

export const useResourceAssignments = () => {
  const { resources } = useResources();
  const { projects } = useProjects();
  const [metrics, setMetrics] = useState<ResourceMetrics>({
    totalResources: 0,
    overallocatedCount: 0,
    underutilizedCount: 0,
    availableCount: 0,
    avgUtilization: 0
  });
  const [suggestions, setSuggestions] = useState<AssignmentSuggestion[]>([]);

  const calculateMetrics = () => {
    if (!resources.length) return;

    const totalResources = resources.length;
    
    // Calculate utilization based on current assignments
    const resourceUtilization = resources.map(resource => {
      // Get projects that include this resource
      const currentProjects = projects.filter(project => {
        // Check if project has a resources array and includes this resource's ID
        return Array.isArray(project.resources) && project.resources.includes(resource.id);
      });
      
      const utilization = Math.min(currentProjects.length * 30, 100); // 30% per project, max 100%
      
      return {
        ...resource,
        calculatedUtilization: utilization
      };
    });

    const overallocatedCount = resourceUtilization.filter(r => r.calculatedUtilization > 80).length;
    const underutilizedCount = resourceUtilization.filter(r => r.calculatedUtilization < 40).length;
    const availableCount = resourceUtilization.filter(r => r.calculatedUtilization <= 60).length;
    const avgUtilization = Math.round(
      resourceUtilization.reduce((sum, r) => sum + r.calculatedUtilization, 0) / totalResources
    );

    setMetrics({
      totalResources,
      overallocatedCount,
      underutilizedCount,
      availableCount,
      avgUtilization
    });
  };

  const generateAssignmentSuggestions = () => {
    if (!resources.length || !projects.length) return;

    const suggestions: AssignmentSuggestion[] = [];
    
    // Generate AI suggestions based on resource skills and availability
    resources.forEach(resource => {
      // Find unassigned tasks that might match this resource
      const mockSuggestion: AssignmentSuggestion = {
        taskId: `task-${Math.random().toString(36).substr(2, 9)}`,
        taskName: `${resource.role} Task Assignment`,
        suggestedResourceId: resource.id,
        suggestedResourceName: resource.name,
        confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
        reason: `Best skill match for ${resource.role} with current availability`,
        skillMatch: [resource.role?.toLowerCase() || 'general']
      };

      if (suggestions.length < 5) { // Limit to 5 suggestions
        suggestions.push(mockSuggestion);
      }
    });

    setSuggestions(suggestions);
  };

  useEffect(() => {
    calculateMetrics();
    generateAssignmentSuggestions();
  }, [resources, projects]);

  return {
    metrics,
    suggestions,
    refreshMetrics: calculateMetrics
  };
};
