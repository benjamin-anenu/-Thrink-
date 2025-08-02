
import React from 'react';
import { useProjectResources } from '@/hooks/useProjectResources';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Clock, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { LoadingState } from '@/components/ui/loading-state';

interface ProjectResourcesProps {
  projectId: string;
}

const ProjectResources: React.FC<ProjectResourcesProps> = ({ projectId }) => {
  const { resources, loading } = useProjectResources(projectId);

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Busy': return 'bg-yellow-100 text-yellow-800';
      case 'Overloaded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return <LoadingState>Loading project resources...</LoadingState>;
  }

  // Calculate metrics
  const totalResources = resources.length;
  const availableResources = resources.filter(r => r.status === 'Available').length;
  const overloadedResources = resources.filter(r => r.status === 'Overloaded').length;
  const avgUtilization = totalResources > 0 
    ? Math.round(resources.reduce((acc, r) => acc + r.utilization, 0) / totalResources)
    : 0;
  const totalActiveTasks = resources.reduce((acc, r) => acc + r.active_task_count, 0);

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
                <p className="text-2xl font-semibold">{totalResources}</p>
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
                <p className="text-2xl font-semibold">{availableResources}</p>
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
                <p className="text-2xl font-semibold">{avgUtilization}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Tasks</p>
                <p className="text-2xl font-semibold">{totalActiveTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Project Team Members
            {overloadedResources > 0 && (
              <Badge variant="destructive" className="ml-2">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {overloadedResources} Overloaded
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {resources.length > 0 ? resources.map((resource) => (
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Task Load</p>
                    <div className="text-sm text-muted-foreground">
                      <div>{resource.active_task_count} active</div>
                      <div>{resource.task_count} total</div>
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
                    <p className="text-sm font-medium mb-2">Availability</p>
                    <div className="flex items-center gap-2">
                      <Progress value={resource.availability} className="flex-1" />
                      <span className="text-sm font-medium">{resource.availability}%</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Hourly Rate</p>
                    <p className="text-lg font-semibold">
                      {resource.hourly_rate > 0 ? `$${resource.hourly_rate}/hr` : 'Not set'}
                    </p>
                  </div>
                </div>

                {resource.email && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-1">Contact</p>
                    <p className="text-sm text-muted-foreground">{resource.email}</p>
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Resources Assigned</h3>
                <p className="text-sm">
                  No resources have been assigned to tasks in this project yet.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectResources;
