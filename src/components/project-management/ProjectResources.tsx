
import React from 'react';
import { useResources } from '@/contexts/ResourceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Clock, Target, TrendingUp } from 'lucide-react';

interface ProjectResourcesProps {
  projectId: string;
}

const ProjectResources: React.FC<ProjectResourcesProps> = ({ projectId }) => {
  const { getResourcesByProject, resources } = useResources();
  
  // Get resources assigned to this project
  const projectResources = getResourcesByProject(projectId);

  // If no resources assigned, show all resources as potential candidates
  const displayResources = projectResources.length > 0 ? projectResources : resources.slice(0, 4);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Busy': return 'bg-yellow-100 text-yellow-800';
      case 'Overallocated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

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
                <p className="font-semibold">{displayResources.length}</p>
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
                <p className="font-semibold">
                  {displayResources.filter(r => r.status === 'Available').length}
                </p>
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
                <p className="font-semibold">
                  {displayResources.length > 0 
                    ? Math.round(displayResources.reduce((acc, r) => acc + r.utilization, 0) / displayResources.length)
                    : 0}%
                </p>
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
                <p className="font-semibold">
                  {displayResources.reduce((acc, r) => acc + (r.utilization * 40 / 100), 0).toFixed(0)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Details */}
      <Card>
        <CardHeader>
          <CardTitle>
            {projectResources.length > 0 ? 'Project Team Members' : 'Available Resources'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {displayResources.map((resource) => (
              <div key={resource.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {resource.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{resource.name}</h3>
                      <p className="text-sm text-muted-foreground">{resource.role}</p>
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
                  <div>
                    <p className="text-sm font-medium mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {resource.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
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
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Allocation Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Allocation Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Weekly allocation across project timeline
            </div>
            <div className="h-64 flex items-end justify-center text-muted-foreground">
              <p>Resource allocation timeline chart would be displayed here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectResources;
