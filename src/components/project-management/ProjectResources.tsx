
import React from 'react';
import { useEnhancedResources } from '@/hooks/useEnhancedResources';
import { useProject } from '@/contexts/ProjectContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Clock, Target, TrendingUp } from 'lucide-react';

interface ProjectResourcesProps {
  projectId: string;
}

const ProjectResources: React.FC<ProjectResourcesProps> = ({ projectId }) => {
  const { resources, loading } = useEnhancedResources();
  const { getProject } = useProject();
  
  // Get real project data
  const project = getProject(projectId);
  
  // Filter resources that are assigned to this project
  const projectResources = resources.filter(resource => 
    project?.resources?.includes(resource.id) || 
    project?.resources?.includes(resource.name)
  );

  // Map database resources to display format with defaults
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
    utilization: 75, // Default utilization - can be calculated from assignments
    status: 'Available' // Default status
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

  if (loading) {
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
            {displayResources.length > 0 ? 'Project Team Members' : 'Available Resources'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {displayResources.length > 0 ? displayResources.map((resource) => (
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

                <div className="space-y-2">
                  {resource.email && (
                    <div>
                      <p className="text-sm font-medium mb-1">Contact</p>
                      <p className="text-sm text-muted-foreground">{resource.email}</p>
                    </div>
                  )}
                  
                  {resource.currentProjects.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Current Projects</p>
                      <div className="flex flex-wrap gap-2">
                        {resource.currentProjects.map((project, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {project}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No resources assigned to this project yet</p>
                <p className="text-sm mt-2">
                  {resources.length > 0 
                    ? `${resources.length} resources available in workspace` 
                    : 'Create resources in the Resources section to assign them to projects'
                  }
                </p>
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
