
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  UserCheck,
  Calendar
} from 'lucide-react';
import { useEnhancedResources } from '@/hooks/useEnhancedResources';

const ResourceDashboard: React.FC = () => {
  const { resources, utilizationMetrics, loading } = useEnhancedResources();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalResources = resources.length;
  const activeResources = resources.filter(r => r.workspace_id).length;
  const utilizationData = Object.values(utilizationMetrics);
  const overloadedCount = utilizationData.filter(u => u.status === 'Overloaded').length;
  const wellUtilizedCount = utilizationData.filter(u => u.status === 'Well Utilized').length;
  const avgUtilization = utilizationData.length > 0 
    ? utilizationData.reduce((sum, u) => sum + u.utilization_percentage, 0) / utilizationData.length 
    : 0;

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResources}</div>
            <p className="text-xs text-muted-foreground">
              {activeResources} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getUtilizationColor(avgUtilization)}`}>
              {Math.round(avgUtilization)}%
            </div>
            <Progress value={avgUtilization} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Well Utilized</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{wellUtilizedCount}</div>
            <p className="text-xs text-muted-foreground">
              {totalResources > 0 ? Math.round((wellUtilizedCount / totalResources) * 100) : 0}% of team
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overloaded</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overloadedCount}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resource Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Resource Status
            </CardTitle>
            <CardDescription>
              Current status distribution of your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {utilizationData.slice(0, 5).map((resource, index) => {
                const resourceData = resources.find(r => r.id === Object.keys(utilizationMetrics)[index]);
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-sm font-medium">
                        {resourceData?.name || 'Unknown Resource'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        resource.status === 'Overloaded' ? 'destructive' :
                        resource.status === 'Well Utilized' ? 'default' : 'secondary'
                      }>
                        {resource.status}
                      </Badge>
                      <span className={`text-sm ${getUtilizationColor(resource.utilization_percentage)}`}>
                        {Math.round(resource.utilization_percentage)}%
                      </span>
                    </div>
                  </div>
                );
              })}
              {utilizationData.length === 0 && (
                <p className="text-sm text-muted-foreground">No utilization data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Workload Distribution
            </CardTitle>
            <CardDescription>
              Task capacity and current load
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {utilizationData.slice(0, 5).map((resource, index) => {
                const resourceData = resources.find(r => r.id === Object.keys(utilizationMetrics)[index]);
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {resourceData?.name || 'Unknown Resource'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {resource.task_count}/{resource.task_capacity} tasks
                      </span>
                    </div>
                    <Progress 
                      value={((resource.task_count || 0) / (resource.task_capacity || 1)) * 100} 
                      className="h-2"
                    />
                  </div>
                );
              })}
              {utilizationData.length === 0 && (
                <p className="text-sm text-muted-foreground">No workload data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResourceDashboard;
