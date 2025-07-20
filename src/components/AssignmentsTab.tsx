
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useResources } from '@/contexts/ResourceContext';
import { useProject } from '@/contexts/ProjectContext';
import { Users, Clock, Target } from 'lucide-react';

interface AssignmentsTabProps {
  onShowAssignmentModal: () => void;
}

const AssignmentsTab = ({ onShowAssignmentModal }: AssignmentsTabProps) => {
  const { resources } = useResources();
  const { projects } = useProject();

  // Calculate assignment statistics from real data
  const totalAssignments = resources.reduce((acc, resource) => acc + resource.currentProjects.length, 0);
  const activeResources = resources.filter(r => r.currentProjects.length > 0).length;
  const overallocatedResources = resources.filter(r => r.status === 'Overallocated').length;

  // Get recent assignments (resources with current projects)
  const recentAssignments = resources
    .filter(r => r.currentProjects.length > 0)
    .slice(0, 5)
    .map(resource => ({
      resourceName: resource.name,
      projectName: resource.currentProjects[0], // Show first project
      role: resource.role,
      utilization: resource.utilization,
      status: resource.status
    }));

  return (
    <div className="space-y-6">
      {/* Assignment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Assignments</p>
                <p className="font-semibold">{totalAssignments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Resources</p>
                <p className="font-semibold">{activeResources}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Overallocated</p>
                <p className="font-semibold">{overallocatedResources}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assignments</CardTitle>
          <CardDescription>
            Current resource assignments and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentAssignments.length > 0 ? (
            <div className="space-y-4">
              {recentAssignments.map((assignment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{assignment.resourceName}</p>
                      <p className="text-sm text-muted-foreground">{assignment.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">{assignment.projectName}</p>
                      <p className="text-xs text-muted-foreground">{assignment.utilization}% utilized</p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={
                        assignment.status === 'Available' ? 'bg-green-100 text-green-800' :
                        assignment.status === 'Busy' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }
                    >
                      {assignment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No current assignments found.
              </p>
              <Button onClick={onShowAssignmentModal}>
                Create New Assignment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Management</CardTitle>
          <CardDescription>
            Manage task assignments and workload distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={onShowAssignmentModal}>
              Create New Assignment
            </Button>
            <Button variant="outline">
              View All Assignments
            </Button>
            <Button variant="outline">
              Resource Utilization Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentsTab;
