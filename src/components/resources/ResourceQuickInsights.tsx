
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  AlertTriangle, 
  TrendingUp,
  Activity,
  Clock
} from 'lucide-react';
import { useResourceDashboardData } from '@/hooks/useResourceDashboardData';

const ResourceQuickInsights: React.FC = () => {
  const { metrics, loading } = useResourceDashboardData();

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const insights = [];

  // Resource availability insight
  if (metrics.availableResources > 0) {
    insights.push({
      type: 'positive',
      icon: UserCheck,
      text: `${metrics.availableResources} resources are available for new assignments`
    });
  }

  // Overloaded resources alert
  if (metrics.overloadedResources > 0) {
    insights.push({
      type: 'warning',
      icon: AlertTriangle,
      text: `${metrics.overloadedResources} resources are overloaded and need attention`
    });
  }

  // Project gaps alert
  if (metrics.projectsWithGaps > 0) {
    insights.push({
      type: 'info',
      icon: Clock,
      text: `${metrics.projectsWithGaps} projects have resource gaps`
    });
  }

  // Unassigned resources
  if (metrics.unassignedResources > 0) {
    insights.push({
      type: 'info',
      icon: Users,
      text: `${metrics.unassignedResources} resources are not assigned to any project`
    });
  }

  // Overall health insight
  const utilizationRate = metrics.totalResources > 0 
    ? ((metrics.allocatedResources + metrics.overloadedResources) / metrics.totalResources) * 100 
    : 0;

  if (utilizationRate > 80 && metrics.overloadedResources === 0) {
    insights.push({
      type: 'positive',
      icon: TrendingUp,
      text: `Resource utilization is healthy at ${utilizationRate.toFixed(0)}%`
    });
  } else if (utilizationRate < 50) {
    insights.push({
      type: 'info',
      icon: Activity,
      text: `Resource utilization is low at ${utilizationRate.toFixed(0)}%`
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: 'neutral',
      icon: Users,
      text: 'Add resources to your workspace to see insights'
    });
  }

  const getBadgeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'positive': return 'default';
      case 'warning': return 'destructive';
      case 'info': return 'secondary';
      default: return 'outline';
    }
  };

  const getIconColor = (type: string): string => {
    switch (type) {
      case 'positive': return 'text-green-500';
      case 'warning': return 'text-red-500';
      case 'info': return 'text-blue-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Quick Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => {
            const IconComponent = insight.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
                <IconComponent className={`h-4 w-4 mt-0.5 ${getIconColor(insight.type)}`} />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{insight.text}</p>
                </div>
                <Badge variant={getBadgeVariant(insight.type)} className="ml-2">
                  {insight.type}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceQuickInsights;
