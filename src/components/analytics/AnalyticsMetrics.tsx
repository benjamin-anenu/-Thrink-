
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProject } from '@/contexts/ProjectContext';
import { useResources } from '@/contexts/ResourceContext';
import { Users, Calendar, TrendingUp, Clock } from 'lucide-react';

const AnalyticsMetrics = () => {
  const { projects } = useProject();
  const { resources } = useResources();

  // Calculate project metrics
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalProjects = projects.length;

  // Calculate resource metrics with safe defaults
  const avgUtilization = resources.length > 0 
    ? Math.round(resources.reduce((acc, r) => acc + (r.utilization || 0), 0) / resources.length)
    : 0;

  // Calculate workspace metrics
  const totalWorkspaces = 1; // Simplified for now

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProjects}</div>
          <p className="text-xs text-muted-foreground">
            {activeProjects} active, {completedProjects} completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{resources.length}</div>
          <p className="text-xs text-muted-foreground">
            Across all workspaces
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgUtilization}%</div>
          <p className="text-xs text-muted-foreground">
            Resource utilization rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Workspaces</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWorkspaces}</div>
          <p className="text-xs text-muted-foreground">
            Active workspaces
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsMetrics;
