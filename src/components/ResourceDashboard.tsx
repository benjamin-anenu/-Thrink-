
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useResourceDashboardData } from '@/hooks/useResourceDashboardData';
import { 
  Users, 
  UserCheck, 
  UserX, 
  AlertTriangle, 
  TrendingUp,
  AlertCircle,
  Activity
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  description,
  trend
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className={`flex items-center gap-1 text-xs mt-2 ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`h-3 w-3 ${trend.isPositive ? '' : 'rotate-180'}`} />
            <span>{Math.abs(trend.value)}% from last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ResourceDashboard: React.FC = () => {
  const { metrics, loading } = useResourceDashboardData();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(7)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-4 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getUtilizationColor = (allocated: number, total: number) => {
    const percentage = total > 0 ? (allocated / total) * 100 : 0;
    if (percentage > 80) return 'text-red-600';
    if (percentage > 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const utilizationPercentage = metrics.totalResources > 0 
    ? ((metrics.allocatedResources + metrics.overloadedResources) / metrics.totalResources) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Resources"
          value={metrics.totalResources}
          icon={Users}
          color="text-blue-500"
          description="All resources in workspace"
        />

        <MetricCard
          title="Available Resources"
          value={metrics.availableResources}
          icon={UserCheck}
          color="text-green-500"
          description="Ready for new assignments"
        />

        <MetricCard
          title="Allocated Resources"
          value={metrics.allocatedResources}
          icon={Activity}
          color={getUtilizationColor(metrics.allocatedResources, metrics.totalResources)}
          description="Currently working on projects"
        />

        <MetricCard
          title="Overloaded Resources"
          value={metrics.overloadedResources}
          icon={AlertTriangle}
          color="text-red-500"
          description="Utilization > 100%"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Unassigned Resources"
          value={metrics.unassignedResources}
          icon={UserX}
          color="text-orange-500"
          description="Not assigned to any project"
        />

        <MetricCard
          title="Projects with Resource Gaps"
          value={metrics.projectsWithGaps}
          icon={AlertCircle}
          color="text-yellow-500"
          description="Projects needing more resources"
        />

        <MetricCard
          title="Resources at Risk"
          value={metrics.resourcesAtRisk}
          icon={AlertTriangle}
          color="text-red-500"
          description="High utilization or bottleneck risk"
        />
      </div>

      {/* Utilization Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resource Utilization Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Utilization</span>
              <span className="font-medium">{utilizationPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={utilizationPercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{metrics.availableResources}</div>
              <div className="text-xs text-muted-foreground">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{metrics.allocatedResources}</div>
              <div className="text-xs text-muted-foreground">Allocated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{metrics.overloadedResources}</div>
              <div className="text-xs text-muted-foreground">Overloaded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{metrics.unassignedResources}</div>
              <div className="text-xs text-muted-foreground">Unassigned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights with Dark Theme Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.overloadedResources > 0 && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 dark:bg-red-900/20 border border-red-700/30 dark:border-red-700/30 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-400 dark:text-red-400" />
                <span className="text-sm text-foreground">
                  <strong>{metrics.overloadedResources}</strong> resources are overloaded and may need workload redistribution
                </span>
              </div>
            )}
            
            {metrics.projectsWithGaps > 0 && (
              <div className="flex items-center gap-2 p-3 bg-amber-900/20 dark:bg-amber-900/20 border border-amber-700/30 dark:border-amber-700/30 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-400 dark:text-amber-400" />
                <span className="text-sm text-foreground">
                  <strong>{metrics.projectsWithGaps}</strong> projects have resource gaps that need attention
                </span>
              </div>
            )}

            {metrics.unassignedResources > 0 && (
              <div className="flex items-center gap-2 p-3 bg-blue-900/20 dark:bg-blue-900/20 border border-blue-700/30 dark:border-blue-700/30 rounded-lg">
                <Users className="h-4 w-4 text-blue-400 dark:text-blue-400" />
                <span className="text-sm text-foreground">
                  <strong>{metrics.unassignedResources}</strong> resources are available for new project assignments
                </span>
              </div>
            )}

            {metrics.overloadedResources === 0 && metrics.projectsWithGaps === 0 && utilizationPercentage > 70 && utilizationPercentage < 85 && (
              <div className="flex items-center gap-2 p-3 bg-green-900/20 dark:bg-green-900/20 border border-green-700/30 dark:border-green-700/30 rounded-lg">
                <UserCheck className="h-4 w-4 text-green-400 dark:text-green-400" />
                <span className="text-sm text-foreground">
                  Resource allocation looks healthy with {utilizationPercentage.toFixed(1)}% utilization
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceDashboard;
