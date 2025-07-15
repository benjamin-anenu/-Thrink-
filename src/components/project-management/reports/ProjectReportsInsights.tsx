
import React, { useContext, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectContext } from '@/contexts/ProjectContext';
import { ResourceContext } from '@/contexts/ResourceContext';
import { WorkspaceContext } from '@/contexts/WorkspaceContext';
import { PerformanceTracker } from '@/services/PerformanceTracker';

interface ProjectReportsInsightsProps {
  projectId?: string;
}

const ProjectReportsInsights: React.FC<ProjectReportsInsightsProps> = ({ projectId }) => {
  const { projects } = useContext(ProjectContext);
  const { resources } = useContext(ResourceContext);
  const { currentWorkspace } = useContext(WorkspaceContext);

  const insights = useMemo(() => {
    if (!currentWorkspace) return [];

    const performanceTracker = PerformanceTracker.getInstance();
    const profiles = performanceTracker.getAllProfiles();
    
    const workspaceProjects = projects.filter(p => p.workspaceId === currentWorkspace.id);
    const workspaceResources = resources.filter(r => r.workspaceId === currentWorkspace.id);
    
    const currentProject = projectId ? projects.find(p => p.id === projectId) : null;
    const projectSpecific = currentProject !== null;

    const insights = [];

    // Project progress insight
    if (projectSpecific && currentProject) {
      const progress = currentProject.progress || 0;
      const dueDate = new Date(currentProject.dueDate);
      const today = new Date();
      const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (progress >= 70 && daysRemaining > 0) {
        insights.push({
          type: 'success',
          title: 'Project is on track',
          message: `Current progress (${progress}%) aligns well with timeline. ${daysRemaining} days remaining to completion.`,
          color: 'green'
        });
      } else if (progress < 50 && daysRemaining < 7) {
        insights.push({
          type: 'warning',
          title: 'Timeline risk detected',
          message: `Project progress (${progress}%) may not meet the deadline in ${daysRemaining} days. Consider resource reallocation.`,
          color: 'yellow'
        });
      }
    } else {
      // Workspace-wide insight
      const activeProjects = workspaceProjects.filter(p => p.status === 'active' || p.status === 'in-progress');
      const onTrackProjects = activeProjects.filter(p => (p.progress || 0) >= 70);
      
      if (onTrackProjects.length === activeProjects.length && activeProjects.length > 0) {
        insights.push({
          type: 'success',
          title: 'All projects on track',
          message: `${activeProjects.length} active projects are progressing well. Team velocity is consistent across the workspace.`,
          color: 'green'
        });
      } else if (onTrackProjects.length < activeProjects.length * 0.7) {
        insights.push({
          type: 'warning',
          title: 'Project timeline concerns',
          message: `${activeProjects.length - onTrackProjects.length} of ${activeProjects.length} projects may need attention. Consider timeline review.`,
          color: 'yellow'
        });
      }
    }

    // Resource optimization insight
    const highPerformers = profiles.filter(p => p.currentScore > 85);
    const overloadedResources = profiles.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical');
    
    if (overloadedResources.length > 0) {
      const overloadedNames = overloadedResources.slice(0, 2).map(p => p.resourceName).join(' and ');
      insights.push({
        type: 'info',
        title: 'Resource optimization opportunity',
        message: `Consider redistributing workload for ${overloadedNames} to balance team capacity and prevent burnout.`,
        color: 'blue'
      });
    } else if (highPerformers.length > 0) {
      insights.push({
        type: 'info',
        title: 'High performance team',
        message: `${highPerformers.length} team members are performing excellently. Consider leveraging their skills for mentoring.`,
        color: 'blue'
      });
    }

    // Milestone dependency insight
    if (projectSpecific && currentProject) {
      const projectResources = workspaceResources.filter(r => 
        currentProject.assignees?.includes(r.id) || 
        r.skills?.some(skill => currentProject.description?.toLowerCase().includes(skill.toLowerCase()))
      );
      
      if (projectResources.length > 0) {
        const criticalSkills = projectResources.filter(r => 
          r.skills?.some(skill => ['design', 'ui', 'ux'].includes(skill.toLowerCase()))
        );
        
        if (criticalSkills.length > 0) {
          insights.push({
            type: 'warning',
            title: 'Critical skill dependency',
            message: `${criticalSkills[0].name}'s design expertise is crucial for project success. Monitor availability closely.`,
            color: 'yellow'
          });
        }
      }
    } else {
      // Workspace skill gap analysis
      const allSkills = workspaceResources.flatMap(r => r.skills || []);
      const skillCounts = allSkills.reduce((acc, skill) => {
        acc[skill] = (acc[skill] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const criticalSkills = Object.entries(skillCounts).filter(([_, count]) => count === 1);
      if (criticalSkills.length > 0) {
        insights.push({
          type: 'warning',
          title: 'Skill dependency alert',
          message: `Single points of failure detected in ${criticalSkills[0][0]} skills. Consider cross-training team members.`,
          color: 'yellow'
        });
      }
    }

    // Default insight if no specific insights
    if (insights.length === 0) {
      insights.push({
        type: 'success',
        title: 'Tink AI Analysis Complete',
        message: 'No critical issues detected. All systems are operating within normal parameters. Continue monitoring for optimization opportunities.',
        color: 'green'
      });
    }

    return insights;
  }, [projects, resources, currentWorkspace, projectId]);

  const getInsightClass = (color: string) => {
    switch (color) {
      case 'green':
        return 'p-4 bg-green-50 border border-green-200 rounded-lg';
      case 'blue':
        return 'p-4 bg-blue-50 border border-blue-200 rounded-lg';
      case 'yellow':
        return 'p-4 bg-yellow-50 border border-yellow-200 rounded-lg';
      default:
        return 'p-4 bg-gray-50 border border-gray-200 rounded-lg';
    }
  };

  const getTextClass = (color: string) => {
    switch (color) {
      case 'green':
        return { title: 'font-medium text-green-800', description: 'text-sm text-green-700' };
      case 'blue':
        return { title: 'font-medium text-blue-800', description: 'text-sm text-blue-700' };
      case 'yellow':
        return { title: 'font-medium text-yellow-800', description: 'text-sm text-yellow-700' };
      default:
        return { title: 'font-medium text-gray-800', description: 'text-sm text-gray-700' };
    }
  };

  const getDotClass = (color: string) => {
    switch (color) {
      case 'green':
        return 'h-2 w-2 bg-green-500 rounded-full mt-2';
      case 'blue':
        return 'h-2 w-2 bg-blue-500 rounded-full mt-2';
      case 'yellow':
        return 'h-2 w-2 bg-yellow-500 rounded-full mt-2';
      default:
        return 'h-2 w-2 bg-gray-500 rounded-full mt-2';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tink AI Insights & Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className={getInsightClass(insight.color)}>
              <div className="flex items-start gap-3">
                <div className={getDotClass(insight.color)}></div>
                <div>
                  <p className={getTextClass(insight.color).title}>{insight.title}</p>
                  <p className={getTextClass(insight.color).description}>
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectReportsInsights;
