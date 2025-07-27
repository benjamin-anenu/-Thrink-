
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProject } from '@/contexts/ProjectContext';
import { useResources } from '@/contexts/ResourceContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { AvailabilityCalculationService } from '@/services/AvailabilityCalculationService';
import { TrendingUp, TrendingDown, Target, Clock, DollarSign, Users } from 'lucide-react';

const AnalyticsMetrics: React.FC = () => {
  const { projects } = useProject();
  const { resources } = useResources();
  const { currentWorkspace } = useWorkspace();

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

    // Calculate resource utilization from real data using the new service
    const calculateResourceUtilization = async () => {
      if (!currentWorkspace) return 0;
      
      try {
        const availabilities = await AvailabilityCalculationService.calculateWorkspaceAvailability(
          currentWorkspace.id
        );
        
        if (availabilities.length === 0) return 0;
        
        const avgUtilization = availabilities.reduce((acc, resource) => 
          acc + resource.currentUtilization, 0) / availabilities.length;
        
        return Math.round(avgUtilization);
      } catch (error) {
        console.error('Error calculating resource utilization:', error);
        return 0;
      }
    };

    // Calculate budget health from real data
    const calculateBudgetHealth = () => {
      const projectsWithBudget = workspaceProjects.filter(p => p.resources && p.tasks);
      if (projectsWithBudget.length === 0) return 95;
      
      let totalBudgetHealth = 0;
      let validProjects = 0;
      
      projectsWithBudget.forEach(project => {
        // Calculate planned budget based on resource hourly rates
        const plannedBudget = project.tasks?.reduce((acc, task) => {
          const duration = task.duration || 1;
          const hoursPerDay = 8;
          const totalHours = duration * hoursPerDay;
          
          const assignedResourceIds = task.assignedResources || [];
          const taskCost = assignedResourceIds.reduce((resourceAcc, resourceId) => {
            const resource = workspaceResources.find(r => r.id === resourceId);
            const hourlyRate = resource?.hourlyRate ? parseFloat(resource.hourlyRate.replace(/[$\/hr]/g, '')) : 50;
            return resourceAcc + (totalHours * hourlyRate);
          }, 0);
          
          return acc + taskCost;
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

    return {
      totalProjects,
      completedProjects,
      successRate,
      avgDeliveryTime,
      budgetHealth,
      calculateResourceUtilization
    };
  }, [workspaceProjects, workspaceResources, currentWorkspace]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalProjects}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.completedProjects} completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.successRate}%</div>
          <p className="text-xs text-muted-foreground">
            Project completion rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Delivery Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.avgDeliveryTime}w</div>
          <p className="text-xs text-muted-foreground">
            Average project duration
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.budgetHealth}%</div>
          <p className="text-xs text-muted-foreground">
            Spending efficiency
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsMetrics;
