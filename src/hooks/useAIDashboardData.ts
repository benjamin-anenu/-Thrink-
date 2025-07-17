
import { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useResources } from '@/contexts/ResourceContext';
import { useStakeholders } from '@/contexts/StakeholderContext';

export const useAIDashboardData = () => {
  const { projects } = useProject();
  const { resources } = useResources();
  const { stakeholders } = useStakeholders();
  
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Calculate real metrics
  const activeProjects = projects.filter(p => p.status === 'In Progress' || p.status === 'Planning');
  const completedProjects = projects.filter(p => p.status === 'Completed');
  const totalProjects = projects.length;
  
  // Safe arithmetic operations with proper type checking
  const calculateProgress = (project: any) => {
    const progress = project?.progress;
    return typeof progress === 'number' ? progress : 0;
  };

  const calculateUtilization = (resource: any) => {
    const utilization = resource?.utilization;
    return typeof utilization === 'number' ? utilization : 0;
  };

  // Real-time data calculations
  const realTimeData = {
    projectsInProgress: activeProjects.length,
    resourceUtilization: resources.length > 0
      ? Math.round(resources.reduce((acc, r) => acc + calculateUtilization(r), 0) / resources.length)
      : 0,
    budgetHealth: activeProjects.length > 0
      ? Math.round(activeProjects.reduce((acc, p) => acc + calculateProgress(p), 0) / activeProjects.length)
      : 100,
    riskScore: Math.max(0, Math.min(100, 
      (projects.filter(p => calculateProgress(p) < 50 && (p.status === 'In Progress' || p.status === 'Planning')).length / Math.max(1, totalProjects)) * 100
    ))
  };

  // Performance data for charts
  const performanceData = [
    { name: 'Jan', completed: 12, planned: 15, budget: 85 },
    { name: 'Feb', completed: 18, planned: 20, budget: 90 },
    { name: 'Mar', completed: 15, planned: 18, budget: 88 },
    { name: 'Apr', completed: 22, planned: 25, budget: 92 },
    { name: 'May', completed: 19, planned: 22, budget: 87 },
    { name: 'Jun', completed: 25, planned: 28, budget: 95 }
  ];

  // Resource data for charts
  const resourceData = resources.map((resource, index) => ({
    name: resource.name || `Resource ${index + 1}`,
    value: calculateUtilization(resource),
    color: `hsl(${index * 60}, 70%, 50%)`
  }));

  // AI Insights
  const aiInsights = [
    {
      type: 'prediction',
      title: 'Project Performance',
      message: `${activeProjects.length} active projects with average completion of ${
        activeProjects.length > 0 
          ? Math.round(activeProjects.reduce((acc, p) => acc + calculateProgress(p), 0) / activeProjects.length)
          : 0
      }%`,
      impact: 'high',
      confidence: 85,
      icon: 'TrendingUp'
    },
    {
      type: 'optimization',
      title: 'Resource Utilization',
      message: `${resources.length} resources with average utilization of ${realTimeData.resourceUtilization}%`,
      impact: 'medium',
      confidence: 78,
      icon: 'Users'
    },
    {
      type: 'risk',
      title: 'Risk Assessment',
      message: `Current risk score: ${realTimeData.riskScore}%`,
      impact: realTimeData.riskScore > 30 ? 'high' : 'low',
      confidence: 92,
      icon: 'AlertTriangle'
    },
    {
      type: 'opportunity',
      title: 'Stakeholder Engagement',
      message: `${stakeholders.length} stakeholders across ${totalProjects} projects`,
      impact: 'medium',
      confidence: 72,
      icon: 'Sparkles'
    }
  ];

  // Client satisfaction trend data
  const clientSatisfactionTrend = [
    { month: 'Jan', score: 4.2, responses: 15 },
    { month: 'Feb', score: 4.5, responses: 18 },
    { month: 'Mar', score: 4.3, responses: 12 },
    { month: 'Apr', score: 4.7, responses: 22 },
    { month: 'May', score: 4.6, responses: 19 },
    { month: 'Jun', score: 4.8, responses: 25 }
  ];

  // Legacy format for backward compatibility
  const dashboardData = {
    projects: activeProjects,
    resourcesData: resources,
    stakeholdersData: stakeholders,
    insights: aiInsights,
    riskAssessment: {
      overallRisk: realTimeData.riskScore > 30 ? 'High' : realTimeData.riskScore > 20 ? 'Medium' : 'Low',
      risks: []
    },
    recommendations: []
  };

  useEffect(() => {
    setLastUpdate(new Date());
  }, [projects, resources, stakeholders]);

  return {
    // New format
    realTimeData,
    performanceData,
    resourceData,
    aiInsights,
    clientSatisfactionTrend,
    isLoading,
    lastUpdate,
    // Legacy format for backward compatibility
    ...dashboardData
  };
};
