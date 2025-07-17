
import { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useResources } from '@/contexts/ResourceContext';
import { useStakeholders } from '@/contexts/StakeholderContext';

export const useAIDashboardData = () => {
  const { projects } = useProject();
  const { resources } = useResources();
  const { stakeholders } = useStakeholders();
  
  const [dashboardData, setDashboardData] = useState({
    projects: [],
    resourcesData: [],
    stakeholdersData: [],
    insights: [],
    riskAssessment: {
      overallRisk: 'Low',
      risks: []
    },
    recommendations: []
  });

  useEffect(() => {
    // Calculate real metrics
    const activeProjects = projects.filter(p => p.status === 'Active');
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

    // Generate insights based on real data
    const insights = [
      {
        id: '1',
        type: 'success',
        title: 'Project Performance',
        description: `${activeProjects.length} active projects with average completion of ${
          activeProjects.length > 0 
            ? Math.round(activeProjects.reduce((acc, p) => acc + calculateProgress(p), 0) / activeProjects.length)
            : 0
        }%`,
        impact: 'high',
        category: 'performance'
      },
      {
        id: '2',
        type: 'warning',
        title: 'Resource Utilization',
        description: `${resources.length} resources with average utilization of ${
          resources.length > 0
            ? Math.round(resources.reduce((acc, r) => acc + calculateUtilization(r), 0) / resources.length)
            : 0
        }%`,
        impact: 'medium',
        category: 'resources'
      },
      {
        id: '3',
        type: 'info',
        title: 'Stakeholder Engagement',
        description: `${stakeholders.length} stakeholders across ${totalProjects} projects`,
        impact: 'medium',
        category: 'stakeholders'
      }
    ];

    // Calculate risk based on project health and resource utilization
    const overutilizedResources = resources.filter(r => calculateUtilization(r) > 90).length;
    const delayedProjects = projects.filter(p => calculateProgress(p) < 50 && p.status === 'Active').length;
    
    let overallRisk = 'Low';
    const risks = [];
    
    if (overutilizedResources > 0) {
      risks.push({
        id: '1',
        title: 'Resource Overutilization',
        description: `${overutilizedResources} resources are over 90% utilized`,
        severity: 'high',
        impact: 'Resource burnout and quality issues'
      });
      overallRisk = 'High';
    }
    
    if (delayedProjects > 0) {
      risks.push({
        id: '2',
        title: 'Project Delays',
        description: `${delayedProjects} projects are behind schedule`,
        severity: 'medium',
        impact: 'Timeline and budget concerns'
      });
      if (overallRisk !== 'High') overallRisk = 'Medium';
    }

    // Generate recommendations
    const recommendations = [
      {
        id: '1',
        title: 'Optimize Resource Allocation',
        description: 'Balance workload across team members to prevent burnout',
        priority: 'high',
        category: 'resources',
        actionItems: [
          'Review current assignments',
          'Redistribute high-priority tasks',
          'Consider additional resources'
        ]
      },
      {
        id: '2',
        title: 'Improve Project Tracking',
        description: 'Implement more frequent progress reviews',
        priority: 'medium',
        category: 'process',
        actionItems: [
          'Schedule weekly check-ins',
          'Update milestone tracking',
          'Enhance reporting automation'
        ]
      }
    ];

    setDashboardData({
      projects: activeProjects,
      resourcesData: resources,
      stakeholdersData: stakeholders,
      insights,
      riskAssessment: {
        overallRisk,
        risks
      },
      recommendations
    });
  }, [projects, resources, stakeholders]);

  return dashboardData;
};
