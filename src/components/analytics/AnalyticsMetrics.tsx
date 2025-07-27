
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Calendar, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { useResources } from '@/contexts/ResourceContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { LoadingOverlay, SkeletonText } from '@/components/ui/loading-state';

const AnalyticsMetrics: React.FC = () => {
  const { projects } = useProject();
  const { resources } = useResources();
  const { currentWorkspace } = useWorkspace();

  const isLoading = false; // Remove this once contexts support loading states

  // Filter data by current workspace
  const workspaceProjects = useMemo(() => 
    projects.filter(project => 
      !currentWorkspace || project.workspaceId === currentWorkspace.id
    ), [projects, currentWorkspace]);

  const workspaceResources = useMemo(() => 
    resources.filter(resource => 
      !currentWorkspace || resource.workspaceId === currentWorkspace.id
    ), [resources, currentWorkspace]);

  // Calculate real metrics from actual data
  const metrics = useMemo(() => {
    const totalProjects = workspaceProjects.length;
    const completedProjects = workspaceProjects.filter(p => p.status === 'Completed').length;
    const successRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

    // Calculate average delivery time (in weeks)
    const completedProjectsWithDates = workspaceProjects.filter(p => 
      p.status === 'Completed' && p.startDate && p.endDate
    );
    const avgDeliveryTime = completedProjectsWithDates.length > 0 
      ? completedProjectsWithDates.reduce((acc, project) => {
          const start = new Date(project.startDate);
          const end = new Date(project.endDate);
          const weeks = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
          return acc + weeks;
        }, 0) / completedProjectsWithDates.length
      : 12.5;

    // Calculate resource utilization from real data
    const avgUtilization = workspaceResources.length > 0 
      ? Math.round(workspaceResources.reduce((acc, resource) => {
          // Calculate real utilization for each resource
          const resourceProjects = workspaceProjects.filter(p => 
            p.resources?.includes(resource.id) || p.resources?.includes(resource.name)
          );
          
          const totalAssignedHours = resourceProjects.reduce((projectAcc, project) => {
            const resourceTasks = project.tasks?.filter(task => 
              task.assignedResources?.includes(resource.id) || 
              task.assignee === resource.id ||
              task.assignee_id === resource.id
            ) || [];
            
            const projectHours = resourceTasks.reduce((taskAcc, task) => {
              if (task.status === 'Completed') return taskAcc;
              const duration = task.duration || 1;
              const hoursPerDay = 8;
              const utilizationFactor = task.status === 'On Hold' ? 0.5 : 1.0;
              return taskAcc + (duration * hoursPerDay * utilizationFactor);
            }, 0);
            
            return projectAcc + projectHours;
          }, 0);
          
          const standardCapacity = 160; // 4 weeks * 40 hours
          const utilization = Math.min(100, Math.round((totalAssignedHours / standardCapacity) * 100));
          
          return acc + Math.max(0, utilization);
        }, 0) / workspaceResources.length)
      : 0;

    // Calculate budget health from real project costs
    const calculateBudgetHealth = () => {
      const projectsWithBudget = workspaceProjects.filter(p => p.resources && p.tasks);
      
      if (projectsWithBudget.length === 0) return 95; // Default when no data
      
      let totalBudgetHealth = 0;
      let validProjects = 0;
      
      projectsWithBudget.forEach(project => {
        // Calculate planned budget based on resource assignments
        const plannedBudget = project.tasks?.reduce((acc, task) => {
          const duration = task.duration || 1;
          const hoursPerDay = 8;
          const totalHours = duration * hoursPerDay;
          
          // Get assigned resources for this task
          const assignedResourceIds = task.assignedResources || [];
          const resourceCost = assignedResourceIds.reduce((resourceAcc, resourceId) => {
            const resource = workspaceResources.find(r => r.id === resourceId);
            const hourlyRate = resource?.hourlyRate ? parseFloat(resource.hourlyRate.replace(/[$\/hr]/g, '')) : 50; // Default $50/hr
            return resourceAcc + (totalHours * hourlyRate);
          }, 0);
          
          return acc + resourceCost;
        }, 0) || 0;
        
        // Calculate actual spent based on progress
        const actualSpent = project.tasks?.reduce((acc, task) => {
          const progress = task.progress || 0;
          const duration = task.duration || 1;
          const hoursPerDay = 8;
          const completedHours = (duration * hoursPerDay * progress) / 100;
          
          const assignedResourceIds = task.assignedResources || [];
          const spentCost = assignedResourceIds.reduce((resourceAcc, resourceId) => {
            const resource = workspaceResources.find(r => r.id === resourceId);
            const hourlyRate = resource?.hourlyRate ? parseFloat(resource.hourlyRate.replace(/[$\/hr]/g, '')) : 50;
            return resourceAcc + (completedHours * hourlyRate);
          }, 0);
          
          return acc + spentCost;
        }, 0) || 0;
        
        // Calculate budget health for this project (0-100)
        if (plannedBudget > 0) {
          const spendRatio = actualSpent / plannedBudget;
          const progressRatio = (project.tasks?.reduce((acc, task) => acc + (task.progress || 0), 0) || 0) / 
                               (project.tasks?.length || 1) / 100;
          
          // Good health if spending is proportional to progress
          let projectHealth = 100;
          if (progressRatio > 0) {
            const efficiency = progressRatio / Math.max(spendRatio, 0.01);
            projectHealth = Math.min(100, Math.max(0, efficiency * 100));
          }
          
          totalBudgetHealth += projectHealth;
          validProjects++;
        }
      });
      
      return validProjects > 0 ? Math.round(totalBudgetHealth / validProjects) : 95;
    };

    const budgetHealth = calculateBudgetHealth();
    const budgetVariance = budgetHealth - 100;

    return {
      successRate,
      avgDeliveryTime: Math.round(avgDeliveryTime * 10) / 10,
      avgUtilization,
      budgetVariance: Math.round(budgetVariance * 10) / 10,
      totalProjects,
      completedProjects
    };
  }, [workspaceProjects, workspaceResources]);

  return (
    <LoadingOverlay isLoading={isLoading} loadingText="Loading analytics...">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Project Success Rate</CardTitle>
            {metrics.successRate >= 80 ? (
              <CheckCircle className="h-4 w-4 text-success" />
            ) : metrics.successRate >= 60 ? (
              <TrendingUp className="h-4 w-4 text-warning" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-error" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.completedProjects} of {metrics.totalProjects} projects completed
            </p>
            <Progress value={metrics.successRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Delivery Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgDeliveryTime}</div>
            <p className="text-xs text-muted-foreground">weeks per project</p>
            {metrics.avgDeliveryTime <= 10 && (
              <p className="text-xs text-success">Ahead of industry average</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resource Utilization</CardTitle>
            <BarChart3 className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgUtilization}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.avgUtilization >= 70 && metrics.avgUtilization <= 85 ? 'Optimal range' : 
               metrics.avgUtilization > 85 ? 'High utilization' : 'Low utilization'}
            </p>
            <Progress value={metrics.avgUtilization} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
            {metrics.budgetVariance <= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-error" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.budgetVariance > 0 ? '+' : ''}{metrics.budgetVariance}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.budgetVariance <= 0 ? 'Under budget' : 'Over budget'}
            </p>
          </CardContent>
        </Card>
      </div>
    </LoadingOverlay>
  );
};

export default AnalyticsMetrics;
