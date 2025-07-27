
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useEnhancedResources } from '@/hooks/useEnhancedResources';
import { useProject } from '@/contexts/ProjectContext';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { EventBus } from '@/services/EventBus';
import { AvailabilityCalculationService, ResourceAvailability } from '@/services/AvailabilityCalculationService';

interface ProjectResourcesProps {
  projectId: string;
}

const ProjectResources: React.FC<ProjectResourcesProps> = ({ projectId }) => {
  const { resources, loading } = useEnhancedResources();
  const { getProject } = useProject();
  const { tasks, loading: tasksLoading } = useTaskManagement(projectId);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [availabilityData, setAvailabilityData] = useState<ResourceAvailability[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  
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

  // Load availability data when tasks or resources change
  useEffect(() => {
    const loadAvailabilityData = async () => {
      if (!projectId || tasksLoading) return;
      
      setAvailabilityLoading(true);
      try {
        const projectAvailability = await AvailabilityCalculationService.calculateProjectAvailability(projectId);
        setAvailabilityData(projectAvailability);
      } catch (error) {
        console.error('Error loading availability data:', error);
      } finally {
        setAvailabilityLoading(false);
      }
    };

    loadAvailabilityData();
  }, [projectId, tasks, refreshTrigger, tasksLoading]);
  
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
      // Note: assignee_id field doesn't exist in current schema
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
      taskAssignments: tasks.map(task => ({
        taskName: task.name,
        assignedResources: task.assignedResources
      })),
      tasksLoading,
      tasksCount: tasks.length,
      availabilityData: availabilityData.map(a => ({
        resourceId: a.resourceId,
        resourceName: a.resourceName,
        calculatedAvailability: a.calculatedAvailability,
        currentUtilization: a.currentUtilization,
        status: a.status
      }))
    });
    
    return uniqueResources;
  };
  
  const projectResources = getProjectResources();
  
  // Check if we're showing project-specific resources
  const hasProjectResources = projectResources.length > 0;

  // Map database resources to display format with real availability calculations
  const displayResources = projectResources.map(resource => {
    // Find availability data for this resource
    const availabilityInfo = availabilityData.find(a => a.resourceId === resource.id);
    
    return {
      id: resource.id,
      name: resource.name || 'Unknown',
      role: resource.role || 'Team Member',
      department: resource.department || 'General',
      email: resource.email || '',
      phone: '',
      location: '',
      skills: [], // Will be enhanced later with skills table
      availability: availabilityInfo?.calculatedAvailability || 100, // Use calculated availability
      currentProjects: [project?.name || ''].filter(Boolean),
      hourlyRate: resource.hourly_rate ? `$${resource.hourly_rate}/hr` : '$0/hr',
      utilization: availabilityInfo?.currentUtilization || 0, // Use calculated utilization
      status: availabilityInfo?.status || 'Available' // Use calculated status
    };
  });

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
  const avgAvailability = totalResources > 0
    ? Math.round(displayResources.reduce((acc, r) => acc + r.availability, 0) / totalResources)
    : 100;

  if (loading || tasksLoading || availabilityLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading project resources...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resource Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalResources}</div>
            <p className="text-xs text-muted-foreground">Total Resources</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">{availableResources}</div>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">{avgUtilization}%</div>
            <p className="text-xs text-muted-foreground">Avg Utilization</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">{avgAvailability}%</div>
            <p className="text-xs text-muted-foreground">Avg Availability</p>
          </CardContent>
        </Card>
      </div>

      {/* Resource List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {hasProjectResources ? 'Project Team Members' : 'Available Resources'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayResources.length > 0 ? (
            <div className="space-y-4">
              {displayResources.map((resource) => (
                <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {resource.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">{resource.name}</h4>
                      <p className="text-sm text-muted-foreground">{resource.role} • {resource.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Availability:</span>
                        <span className={`text-sm ${getUtilizationColor(resource.availability)}`}>
                          {resource.availability}%
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Utilization:</span>
                        <span className={`text-sm ${getUtilizationColor(resource.utilization)}`}>
                          {resource.utilization}%
                        </span>
                      </div>
                    </div>
                    <Badge className={getAvailabilityColor(resource.status)}>
                      {resource.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">No resources assigned to this project</h3>
              <p className="text-muted-foreground mb-4">{resources.length} resources available in workspace</p>
              <p>• Assign resources to project tasks to see them here</p>
              <p>• Resources will appear automatically when assigned to tasks</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectResources;
