
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { DarkModeCard, DarkModeCardHeader, DarkModeCardContent } from '@/components/ui/dark-mode-card';
import { DarkModeBadge } from '@/components/ui/dark-mode-badge';
import { CardDescription, CardTitle } from '@/components/ui/card';
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
  color = 'text-zinc-400',
  progress,
  trend = 'neutral'
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="h-4 w-4 text-green-400" />;
      case 'down': return <ArrowDownRight className="h-4 w-4 text-red-400" />;
      default: return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  return (
    <DarkModeCard variant="elevated" compact>
      <DarkModeCardHeader>
        <div className="flex items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </DarkModeCardHeader>
      <DarkModeCardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs mt-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{change > 0 ? '+' : ''}{change}%</span>
            {changeLabel && <span className="text-zinc-400">from {changeLabel}</span>}
          </div>
        )}
        {progress !== undefined && (
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-zinc-400 mt-1">{progress}% complete</p>
          </div>
        )}
      </DarkModeCardContent>
    </DarkModeCard>
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
      color: 'text-blue-400',
      trend: 'up' as const
    },
    {
      title: 'Team Members',
      value: 48,
      change: 8.2,
      changeLabel: 'last quarter',
      icon: Users,
      color: 'text-green-400',
      trend: 'up' as const
    },
    {
      title: 'Budget Utilization',
      value: '$1.2M',
      change: -5.4,
      changeLabel: 'last month',
      icon: DollarSign,
      color: 'text-blue-500',
      progress: 78,
      trend: 'down' as const
    },
    {
      title: 'Avg. Project Duration',
      value: '14 weeks',
      change: -12.3,
      changeLabel: 'last quarter',
      icon: Clock,
      color: 'text-amber-400',
      trend: 'up' as const
    },
    {
      title: 'Completed This Month',
      value: 8,
      change: 25.0,
      changeLabel: 'last month',
      icon: CheckCircle,
      color: 'text-green-400',
      trend: 'up' as const
    },
    {
      title: 'Upcoming Deadlines',
      value: 6,
      change: 0,
      changeLabel: 'this week',
      icon: Calendar,
      color: 'text-red-400',
      trend: 'neutral' as const
    }
  ];

  const performanceIndicators = [
    {
      label: 'Project Success Rate',
      value: 94,
      target: 95,
      status: 'success'
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
      status: 'success'
    },
    {
      label: 'Client Satisfaction',
      value: 4.8,
      target: 4.5,
      status: 'success',
      isRating: true
    }
  ];

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      <DarkModeCard variant="elevated">
        <DarkModeCardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5" />
            Performance Indicators
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Key performance metrics across all projects
          </CardDescription>
        </DarkModeCardHeader>
        <DarkModeCardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceIndicators.map((indicator, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{indicator.label}</span>
                  <DarkModeBadge variant={getStatusBadgeVariant(indicator.status)} compact>
                    {indicator.status}
                  </DarkModeBadge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-foreground">
                      {indicator.isRating ? `${indicator.value}/5` : `${indicator.value}%`}
                    </span>
                    <span className="text-sm text-zinc-400">
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
                              ? 'bg-amber-500'
                              : star <= indicator.value
                              ? 'bg-amber-500/50'
                              : 'bg-zinc-700'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DarkModeCardContent>
      </DarkModeCard>

      {/* Quick Actions */}
      <DarkModeCard variant="elevated">
        <DarkModeCardHeader>
          <CardTitle className="text-foreground">Quick Actions</CardTitle>
          <CardDescription className="text-zinc-400">
            Frequently used actions and shortcuts
          </CardDescription>
        </DarkModeCardHeader>
        <DarkModeCardContent>
          <div className="flex flex-wrap gap-2">
            <DarkModeBadge variant="neutral" compact>Export Reports</DarkModeBadge>
            <DarkModeBadge variant="neutral" compact>Schedule Review</DarkModeBadge>
            <DarkModeBadge variant="neutral" compact>Update Resources</DarkModeBadge>
            <DarkModeBadge variant="neutral" compact>View Analytics</DarkModeBadge>
            <DarkModeBadge variant="neutral" compact>Send Updates</DarkModeBadge>
          </div>
        </DarkModeCardContent>
      </DarkModeCard>
    </div>
  );
};

export default DashboardMetrics;
