import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/ui/status-badge';
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
      case 'up': return <ArrowUpRight className="h-4 w-4 text-success" />;
      case 'down': return <ArrowDownRight className="h-4 w-4 text-error" />;
      default: return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-success';
      case 'down': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-lg bg-card border-border">
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
      color: 'text-info',
      trend: 'up' as const
    },
    {
      title: 'Team Members',
      value: 48,
      change: 8.2,
      changeLabel: 'last quarter',
      icon: Users,
      color: 'text-success',
      trend: 'up' as const
    },
    {
      title: 'Budget Utilization',
      value: '$1.2M',
      change: -5.4,
      changeLabel: 'last month',
      icon: DollarSign,
      color: 'text-primary',
      progress: 78,
      trend: 'down' as const
    },
    {
      title: 'Avg. Project Duration',
      value: '14 weeks',
      change: -12.3,
      changeLabel: 'last quarter',
      icon: Clock,
      color: 'text-warning',
      trend: 'up' as const
    },
    {
      title: 'Completed This Month',
      value: 8,
      change: 25.0,
      changeLabel: 'last month',
      icon: CheckCircle,
      color: 'text-success',
      trend: 'up' as const
    },
    {
      title: 'Upcoming Deadlines',
      value: 6,
      change: 0,
      changeLabel: 'this week',
      icon: Calendar,
      color: 'text-error',
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

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'info';
      case 'warning': return 'warning';
      case 'danger': return 'error';
      default: return 'default';
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
      <Card className="bg-card border-border">
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
                  <StatusBadge variant={getStatusBadgeVariant(indicator.status)}>
                    {indicator.status}
                  </StatusBadge>
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
                              ? 'bg-warning'
                              : star <= indicator.value
                              ? 'bg-warning/50'
                              : 'bg-muted'
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
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Frequently used actions and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <StatusBadge variant="default">Export Reports</StatusBadge>
            <StatusBadge variant="default">Schedule Review</StatusBadge>
            <StatusBadge variant="default">Update Resources</StatusBadge>
            <StatusBadge variant="default">View Analytics</StatusBadge>
            <StatusBadge variant="default">Send Updates</StatusBadge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardMetrics;
