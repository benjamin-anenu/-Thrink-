
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, Calendar, Users, 
  DollarSign, Target, Clock, CheckCircle,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  color?: string;
  progress?: number;
  trend?: 'up' | 'down' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color = 'text-muted-foreground',
  progress,
  trend = 'neutral'
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{change > 0 ? '+' : ''}{change}%</span>
            {changeLabel && <span className="text-muted-foreground">from {changeLabel}</span>}
          </div>
        )}
        {progress !== undefined && (
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const DashboardMetrics = () => {
  const metrics = [
    {
      title: 'Active Projects',
      value: 12,
      change: 15.8,
      changeLabel: 'last month',
      icon: Target,
      color: 'text-blue-500',
      trend: 'up' as const
    },
    {
      title: 'Team Members',
      value: 48,
      change: 8.2,
      changeLabel: 'last quarter',
      icon: Users,
      color: 'text-green-500',
      trend: 'up' as const
    },
    {
      title: 'Budget Utilization',
      value: '$1.2M',
      change: -5.4,
      changeLabel: 'last month',
      icon: DollarSign,
      color: 'text-purple-500',
      progress: 78,
      trend: 'down' as const
    },
    {
      title: 'Avg. Project Duration',
      value: '14 weeks',
      change: -12.3,
      changeLabel: 'last quarter',
      icon: Clock,
      color: 'text-orange-500',
      trend: 'up' as const
    },
    {
      title: 'Completed This Month',
      value: 8,
      change: 25.0,
      changeLabel: 'last month',
      icon: CheckCircle,
      color: 'text-emerald-500',
      trend: 'up' as const
    },
    {
      title: 'Upcoming Deadlines',
      value: 6,
      change: 0,
      changeLabel: 'this week',
      icon: Calendar,
      color: 'text-red-500',
      trend: 'neutral' as const
    }
  ];

  const performanceIndicators = [
    {
      label: 'Project Success Rate',
      value: 94,
      target: 95,
      status: 'good'
    },
    {
      label: 'On-Time Delivery',
      value: 87,
      target: 90,
      status: 'warning'
    },
    {
      label: 'Budget Adherence',
      value: 92,
      target: 85,
      status: 'excellent'
    },
    {
      label: 'Client Satisfaction',
      value: 4.8,
      target: 4.5,
      status: 'excellent',
      isRating: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'danger': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            changeLabel={metric.changeLabel}
            icon={metric.icon}
            color={metric.color}
            progress={metric.progress}
            trend={metric.trend}
          />
        ))}
      </div>

      {/* Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Indicators
          </CardTitle>
          <CardDescription>
            Key performance metrics across all projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceIndicators.map((indicator, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{indicator.label}</span>
                  <Badge variant="outline" className={getStatusColor(indicator.status)}>
                    {indicator.status}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {indicator.isRating ? `${indicator.value}/5` : `${indicator.value}%`}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Target: {indicator.isRating ? `${indicator.target}/5` : `${indicator.target}%`}
                    </span>
                  </div>
                  
                  {!indicator.isRating && (
                    <Progress 
                      value={indicator.value} 
                      className="h-2"
                    />
                  )}
                  
                  {indicator.isRating && (
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div
                          key={star}
                          className={`w-4 h-4 rounded-full ${
                            star <= Math.floor(indicator.value)
                              ? 'bg-yellow-400'
                              : star <= indicator.value
                              ? 'bg-yellow-200'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Frequently used actions and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 px-3 py-1">
              Export Reports
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 px-3 py-1">
              Schedule Review
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 px-3 py-1">
              Update Resources
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 px-3 py-1">
              View Analytics
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 px-3 py-1">
              Send Updates
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardMetrics;
