
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Clock, Target, TrendingUp } from 'lucide-react';

interface ProjectResourcesProps {
  projectId: string;
}

const ProjectResources: React.FC<ProjectResourcesProps> = ({ projectId }) => {
  // Mock data - in real app, this would be fetched based on projectId
  const projectResources = [
    {
      id: 'sarah',
      name: 'Sarah Johnson',
      role: 'Frontend Developer',
      allocation: 80,
      utilization: 75,
      currentTasks: ['UI Implementation', 'Component Library'],
      hoursThisWeek: 32,
      availability: 'Available'
    },
    {
      id: 'emily',
      name: 'Emily Rodriguez',
      role: 'UX Designer',
      allocation: 60,
      utilization: 85,
      currentTasks: ['Design System', 'User Testing'],
      hoursThisWeek: 24,
      availability: 'Busy'
    },
    {
      id: 'michael',
      name: 'Michael Chen',
      role: 'Backend Developer',
      allocation: 90,
      utilization: 95,
      currentTasks: ['API Development', 'Database Design'],
      hoursThisWeek: 36,
      availability: 'Overallocated'
    },
    {
      id: 'david',
      name: 'David Kim',
      role: 'Project Manager',
      allocation: 50,
      utilization: 60,
      currentTasks: ['Project Coordination', 'Stakeholder Management'],
      hoursThisWeek: 20,
      availability: 'Available'
    }
  ];

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
                <p className="font-semibold">{projectResources.length}</p>
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
                  {projectResources.filter(r => r.availability === 'Available').length}
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
                  {Math.round(projectResources.reduce((acc, r) => acc + r.utilization, 0) / projectResources.length)}%
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
                  {projectResources.reduce((acc, r) => acc + r.hoursThisWeek, 0)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Details */}
      <Card>
        <CardHeader>
          <CardTitle>Project Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {projectResources.map((resource) => (
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
                  <Badge variant="secondary" className={getAvailabilityColor(resource.availability)}>
                    {resource.availability}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Project Allocation</p>
                    <div className="flex items-center gap-2">
                      <Progress value={resource.allocation} className="flex-1" />
                      <span className="text-sm font-medium">{resource.allocation}%</span>
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
                    <p className="text-sm font-medium mb-2">Hours This Week</p>
                    <p className="text-lg font-semibold">{resource.hoursThisWeek}h</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Current Tasks</p>
                  <div className="flex flex-wrap gap-2">
                    {resource.currentTasks.map((task, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {task}
                      </Badge>
                    ))}
                  </div>
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
