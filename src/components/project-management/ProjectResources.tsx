
import React, { useEffect, useState } from 'react';
import { useEnhancedResources } from '@/hooks/useEnhancedResources';
import { useProject } from '@/contexts/ProjectContext';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Clock, Target, TrendingUp } from 'lucide-react';
import { EventBus } from '@/services/EventBus';

interface ProjectResourcesProps {
  projectId: string;
}

const ProjectResources: React.FC<ProjectResourcesProps> = ({ projectId }) => {
  const { resources, loading } = useEnhancedResources();
  const { getProject } = useProject();
  const { tasks, loading: tasksLoading } = useTaskManagement(projectId);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Listen for real-time updates
  useEffect(() => {
    const eventBus = EventBus.getInstance();
    
    const handleResourceUpdate = (data: any) => {
      if (data.projectId === projectId || data.resourceId) {
        setRefreshTrigger(prev => prev + 1);
      }
    };

    const unsubscribers = [
      eventBus.subscribe('task_updated', handleResourceUpdate),
      eventBus.subscribe('task_created', handleResourceUpdate),
      eventBus.subscribe('task_deleted', handleResourceUpdate),
      eventBus.subscribe('resource_updated', handleResourceUpdate),
      eventBus.subscribe('resource_assigned', handleResourceUpdate),
      eventBus.subscribe('resource_unassigned', handleResourceUpdate)
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [projectId]);
  
  // Get real project data
  const project = getProject(projectId);
  
  // Get all resources assigned to this project (from project.resources OR task assignments)
  const getProjectResources = () => {
    // Get resources from project.resources field
    const resourcesFromProject = resources.filter(resource => 
      project?.resources?.includes(resource.id) || 
      project?.resources?.includes(resource.name) ||
      project?.resources?.some((projectResourceId: string) => 
        projectResourceId === resource.id || 
        projectResourceId === resource.name ||
        resource.name.toLowerCase().includes(projectResourceId.toLowerCase()) ||
        projectResourceId.toLowerCase().includes(resource.name.toLowerCase())
      )
    );
    
    // Also get resources assigned to project tasks (using actual task data from hook)
    const resourcesFromTasks = new Set<string>();
    tasks.forEach(task => {
      if (task.assignedResources) {
        task.assignedResources.forEach(resourceId => resourcesFromTasks.add(resourceId));
      }
      if (task.assignee) resourcesFromTasks.add(task.assignee);
      if (task.assignee_id) resourcesFromTasks.add(task.assignee_id);
    });
    
    const resourcesFromTaskAssignments = resources.filter(resource => 
      resourcesFromTasks.has(resource.id) || 
      resourcesFromTasks.has(resource.name) ||
      Array.from(resourcesFromTasks).some(taskResourceId => 
        taskResourceId === resource.id || 
        taskResourceId === resource.name ||
        resource.name.toLowerCase().includes(taskResourceId.toLowerCase()) ||
        taskResourceId.toLowerCase().includes(resource.name.toLowerCase())
      )
    );
    
    // Combine both sets, removing duplicates
    const allProjectResources = [...resourcesFromProject, ...resourcesFromTaskAssignments];
    const uniqueResources = allProjectResources.filter((resource, index, self) => 
      index === self.findIndex(r => r.id === resource.id)
    );
    
    console.log('Resource filtering details:', {
      resourcesFromProject: resourcesFromProject.map(r => ({ id: r.id, name: r.name })),
      resourcesFromTaskAssignments: resourcesFromTaskAssignments.map(r => ({ id: r.id, name: r.name })),
      uniqueResources: uniqueResources.map(r => ({ id: r.id, name: r.name })),
      projectResourcesField: project?.resources,
      taskResourceIds: Array.from(resourcesFromTasks),
      // Show which tasks have which resources assigned (using actual task data)
      taskAssignments: tasks.map(task => ({
        taskName: task.name,
        assignedResources: task.assignedResources,
        assignee: task.assignee,
        assignee_id: task.assignee_id
      })),
      // Show task loading status
      tasksLoading,
      tasksCount: tasks.length
    });
    
    return uniqueResources;
  };
  
  const projectResources = getProjectResources();
  
  // Check if we're showing project-specific resources
  const hasProjectResources = projectResources.length > 0;
  
  // Calculate real resource utilization based on assignments
  const calculateRealUtilization = (resource: any, projectTasks: any[]) => {
    // Get tasks assigned to this resource
    const assignedTasks = projectTasks.filter(task => 
      task.assignedResources?.includes(resource.id) || 
      task.assignee === resource.id ||
      task.assignee_id === resource.id
    );
    
    if (assignedTasks.length === 0) return 0;
    
    // Calculate total assigned hours based on task durations and progress
    const totalAssignedHours = assignedTasks.reduce((acc, task) => {
      const duration = task.duration || 1;
      const hoursPerDay = 8; // Standard work day
      const taskHours = duration * hoursPerDay;
      
      // Consider task status - completed tasks don't count towards current utilization
      if (task.status === 'Completed') return acc;
      
      // Active tasks count fully, on-hold tasks count partially
      const utilizationFactor = task.status === 'On Hold' ? 0.5 : 1.0;
      return acc + (taskHours * utilizationFactor);
    }, 0);
    
    // Standard work capacity (40 hours per week, 4 weeks = 160 hours)
    const standardCapacity = 160;
    
    // Calculate utilization percentage
    const utilization = Math.min(100, Math.round((totalAssignedHours / standardCapacity) * 100));
    return Math.max(0, utilization);
  };

  // Map database resources to display format with real calculations
  const displayResources = projectResources.map(resource => ({
    id: resource.id,
    name: resource.name || 'Unknown',
    role: resource.role || 'Team Member',
    department: resource.department || 'General',
    email: resource.email || '',
    phone: '',
    location: '',
    skills: [], // Will be enhanced later with skills table
    availability: 100, // Default availability
    currentProjects: [project?.name || ''].filter(Boolean),
    hourlyRate: resource.hourly_rate ? `$${resource.hourly_rate}/hr` : '$0/hr',
    utilization: calculateRealUtilization(resource, tasks), // Use actual tasks from hook
    status: calculateRealUtilization(resource, tasks) > 100 ? 'Overallocated' : 
             calculateRealUtilization(resource, tasks) > 80 ? 'Busy' : 'Available'
  }));

  const getAvailabilityColor = (availability: string) => {
    if (availability === 'Available') return 'bg-green-100 text-green-800';
    if (availability === 'Busy') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Calculate real metrics
  const totalResources = displayResources.length;
  const availableResources = displayResources.filter(r => r.status === 'Available').length;
  const avgUtilization = totalResources > 0 
    ? Math.round(displayResources.reduce((acc, r) => acc + r.utilization, 0) / totalResources)
    : 0;
  const totalHours = displayResources.reduce((acc, r) => acc + (r.utilization * 40 / 100), 0);

  // Debug logging
  console.log('ProjectResources Debug:', {
    projectId,
    projectName: project?.name,
    totalResourcesInWorkspace: resources.length,
    projectResourcesCount: projectResources.length,
    displayResourcesCount: displayResources.length,
    projectTasks: tasks.length, // Use actual tasks from hook
    projectResourcesField: project?.resources,
    taskAssignments: tasks.map(t => ({ 
      taskName: t.name, 
      assignedResources: t.assignedResources,
      assignee: t.assignee,
      assignee_id: t.assignee_id 
    })),
    // More detailed debugging
    allResources: resources.map(r => ({ id: r.id, name: r.name, role: r.role })),
    projectData: {
      id: project?.id,
      name: project?.name,
      resources: project?.resources,
      tasksCount: tasks.length, // Use actual tasks from hook
      tasks: tasks.map(t => ({
        id: t.id,
        name: t.name,
        assignedResources: t.assignedResources,
        assignee: t.assignee,
        assignee_id: t.assignee_id
      }))
    },
    // Test data structure
    isProjectValid: !!project,
    hasResourcesField: !!project?.resources,
    hasTasksField: tasks.length > 0, // Check if we have actual tasks
    resourcesFieldType: typeof project?.resources,
    resourcesFieldLength: project?.resources?.length || 0,
    // Detailed task analysis
    taskAnalysis: tasks.map(task => ({
      taskId: task.id,
      taskName: task.name,
      assignedResources: task.assignedResources,
      assignee: task.assignee,
      assignee_id: task.assignee_id,
      hasAssignedResources: !!task.assignedResources && task.assignedResources.length > 0,
      hasAssignee: !!task.assignee,
      hasAssigneeId: !!task.assignee_id
    })),
    // Resource matching test
    resourceMatchingTest: resources.map(resource => ({
      resourceId: resource.id,
      resourceName: resource.name,
      matchesAnyTask: tasks.some(task => 
        task.assignedResources?.includes(resource.id) ||
        task.assignee === resource.id ||
        task.assignee_id === resource.id
      ),
      matchesProjectResources: project?.resources?.includes(resource.id) || false
    })),
    // Loading states
    resourcesLoading: loading,
    tasksLoading: tasksLoading
  });

  if (loading || tasksLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading project resources...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resource Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Resources</p>
                <p className="font-semibold">{totalResources}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="font-semibold">{availableResources}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Utilization</p>
                <p className="font-semibold">{avgUtilization}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="font-semibold">{totalHours.toFixed(0)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Details */}
      <Card>
        <CardHeader>
          <CardTitle>
            {hasProjectResources 
              ? 'Project Team Members' 
              : 'Available Resources'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {hasProjectResources ? (
              displayResources.map((resource) => (
                <div key={resource.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {resource.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{resource.name}</h3>
                        <p className="text-sm text-muted-foreground">{resource.role}</p>
                        {resource.department && (
                          <p className="text-xs text-muted-foreground">{resource.department}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className={getAvailabilityColor(resource.status)}>
                      {resource.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Availability</p>
                      <div className="flex items-center gap-2">
                        <Progress value={resource.availability} className="flex-1" />
                        <span className="text-sm font-medium">{resource.availability}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Utilization Rate</p>
                      <div className="flex items-center gap-2">
                        <Progress value={resource.utilization} className="flex-1" />
                        <span className={`text-sm font-medium ${getUtilizationColor(resource.utilization)}`}>
                          {resource.utilization}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Hourly Rate</p>
                      <p className="text-lg font-semibold">{resource.hourlyRate}</p>
                    </div>
                  </div>

                  {resource.currentProjects.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Current Projects</p>
                      <div className="flex flex-wrap gap-1">
                        {resource.currentProjects.map((projectName, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {projectName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No resources assigned to this project</h3>
                    <p className="text-muted-foreground mb-4">
                      {resources.length} resources available in workspace
                    </p>
                    <div className="text-sm text-muted-foreground">
                      <p>• Assign resources to project tasks to see them here</p>
                      <p>• Resources will appear automatically when assigned to tasks</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resource Allocation Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Allocation Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Weekly allocation across project timeline
            </div>
            <div className="h-64 flex items-end justify-center text-muted-foreground bg-muted/10 rounded-lg">
              <p>Resource allocation timeline chart will be available soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectResources;
