
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  UserX, 
  AlertTriangle, 
  TrendingUp,
  Activity,
  Clock
} from 'lucide-react';
import { useResourceDashboardData } from '@/hooks/useResourceDashboardData';

const ResourceQuickInsights = () => {
  const { metrics, loading } = useResourceDashboardData();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse bg-card/50">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const insights = [
    {
      title: 'Total Resources',
      value: metrics.totalResources,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      description: 'All team members'
    },
    {
      title: 'Available',
      value: metrics.availableResources,
      icon: UserCheck,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      description: 'Ready for assignment'
    },
    {
      title: 'Overloaded',
      value: metrics.overloadedResources,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      description: 'Need rebalancing'
    },
    {
      title: 'At Risk',
      value: metrics.resourcesAtRisk,
      icon: Activity,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      description: 'High utilization'
    }
  ];

  return (
    <Card className="mb-6 bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Quick Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Main Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {insights.map((insight, index) => {
            const IconComponent = insight.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border border-border/50 ${insight.bgColor} transition-all hover:scale-105`}
              >
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className={`h-5 w-5 ${insight.color}`} />
                  <Badge variant="secondary" className="text-xs bg-background/50">
                    {insight.value}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {insight.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {insight.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Status Indicators */}
        <div className="space-y-3">
          {/* Capacity Status */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/30">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-foreground">Resource Capacity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {metrics.allocatedResources}/{metrics.totalResources} allocated
              </span>
              <Badge 
                variant={
                  metrics.totalResources > 0 && (metrics.allocatedResources / metrics.totalResources) > 0.8 
                    ? "destructive" 
                    : "secondary"
                }
                className="text-xs"
              >
                {metrics.totalResources > 0 
                  ? Math.round((metrics.allocatedResources / metrics.totalResources) * 100)
                  : 0}%
              </Badge>
            </div>
          </div>

          {/* Alert Indicators */}
          {metrics.overloadedResources > 0 && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-sm text-red-200">
                <strong>{metrics.overloadedResources}</strong> resources are overloaded and need attention
              </span>
            </div>
          )}

          {metrics.projectsWithGaps > 0 && (
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-amber-200">
                <strong>{metrics.projectsWithGaps}</strong> projects have resource gaps
              </span>
            </div>
          )}

          {metrics.unassignedResources > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <UserX className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-200">
                <strong>{metrics.unassignedResources}</strong> resources available for new assignments
              </span>
            </div>
          )}

          {metrics.overloadedResources === 0 && metrics.projectsWithGaps === 0 && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <UserCheck className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-200">
                Resource allocation is healthy and balanced
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceQuickInsights;
