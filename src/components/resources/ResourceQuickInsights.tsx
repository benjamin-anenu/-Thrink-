
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, AlertTriangle, UserX, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useResourceDashboardData } from '@/hooks/useResourceDashboardData';
import { darkModeColors } from '@/utils/darkModeColors';

const ResourceQuickInsights: React.FC = () => {
  const { metrics, loading } = useResourceDashboardData();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const insights = [
    {
      title: 'Available Resources',
      value: metrics.availableResources,
      subtitle: `${metrics.totalResources} total resources`,
      change: '+12%',
      trend: 'up',
      icon: Users,
      iconBg: 'bg-blue-500/20 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      status: metrics.availableResources > 0 ? 'Ready' : 'None Available',
      statusColor: metrics.availableResources > 0 
        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50' 
        : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-600/50'
    },
    {
      title: 'Projects with Resource Gaps',
      value: metrics.projectsWithGaps,
      subtitle: 'Need resource allocation',
      change: '-8%',
      trend: 'down',
      icon: AlertTriangle,
      iconBg: 'bg-amber-500/20 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      status: metrics.projectsWithGaps > 0 ? 'Action Required' : 'All Covered',
      statusColor: metrics.projectsWithGaps > 0 
        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50' 
        : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50'
    },
    {
      title: 'Unassigned Resources',
      value: metrics.unassignedResources,
      subtitle: 'Without active projects',
      change: '+5%',
      trend: 'up',
      icon: UserX,
      iconBg: 'bg-purple-500/20 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      status: metrics.unassignedResources > 0 ? 'Available for Assignment' : 'All Assigned',
      statusColor: metrics.unassignedResources > 0 
        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50' 
        : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {insights.map((insight, index) => {
        const IconComponent = insight.icon;
        const TrendIcon = insight.trend === 'up' ? TrendingUp : TrendingUp;
        
        return (
          <Card key={index} className="bg-card border-border hover:shadow-lg transition-all duration-200 group dark:bg-zinc-900/50 dark:border-zinc-700/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${insight.iconBg} group-hover:scale-110 transition-transform duration-200`}>
                  <IconComponent className={`h-6 w-6 ${insight.iconColor}`} />
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm">
                    <TrendIcon className={`h-3 w-3 ${insight.trend === 'up' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'} ${insight.trend === 'down' && 'rotate-180'}`} />
                    <span className={`font-medium ${insight.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {insight.change}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">vs last month</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground dark:text-zinc-400 mb-1">
                      {insight.title}
                    </h3>
                    <div className="text-3xl font-bold text-foreground dark:text-zinc-100">
                      {insight.value}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-muted-foreground dark:text-zinc-400">
                    {insight.subtitle}
                  </p>
                  <Badge 
                    className={`${insight.statusColor} text-xs px-2 py-1 font-medium border`}
                    variant="secondary"
                  >
                    {insight.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ResourceQuickInsights;
