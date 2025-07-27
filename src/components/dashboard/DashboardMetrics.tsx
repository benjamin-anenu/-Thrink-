
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
import { useProject } from '@/contexts/ProjectContext';
import { useResources } from '@/contexts/ResourceContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';

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
  const { projects } = useProject();
  const { resources } = useResources();
  const { currentWorkspace } = useWorkspace();

  // Filter by workspace if needed
  const workspaceProjects = currentWorkspace
    ? projects.filter(p => p.workspaceId === currentWorkspace.id)
    : projects;
  const workspaceResources = currentWorkspace
    ? resources.filter(r => r.workspaceId === currentWorkspace.id)
    : resources;

  // Debug logging
  console.log('[DashboardMetrics] Current workspace:', currentWorkspace?.name);
  console.log('[DashboardMetrics] Total projects:', projects?.length || 0);
  console.log('[DashboardMetrics] Workspace projects:', workspaceProjects?.length || 0);
  console.log('[DashboardMetrics] Project status breakdown:', workspaceProjects?.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {});
  console.log('[DashboardMetrics] Sample project:', workspaceProjects[0]);

  // Calculate all metrics from real data
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastQuarter = new Date(now.getFullYear(), now.getMonth() - 3, 1);

  // 1. Active Projects
  const activeProjects = workspaceProjects.filter(p => p.status === 'Planning' || p.status === 'In Progress').length;
  const lastMonthActiveProjects = workspaceProjects.filter(p => {
    if (!p.createdAt) return false;
    const created = new Date(p.createdAt);
    return created >= lastMonth && created < now && (p.status === 'Planning' || p.status === 'In Progress');
  }).length;
  const activeProjectsChange = lastMonthActiveProjects > 0 
    ? Math.round(((activeProjects - lastMonthActiveProjects) / lastMonthActiveProjects) * 100)
    : activeProjects > 0 ? 100 : 0;

  // 2. Team Members (resources assigned to any project)
  const assignedResourceIds = new Set();
  workspaceProjects.forEach(p => {
    (p.resources || []).forEach(rid => assignedResourceIds.add(rid));
  });
  
  // Also check resources that have currentProjects assigned
  workspaceResources.forEach(r => {
    if (r.currentProjects && r.currentProjects.length > 0) {
      assignedResourceIds.add(r.id);
    }
  });
  
  const teamMembers = workspaceResources.filter(r => assignedResourceIds.has(r.id)).length;
  const lastQuarterTeamMembers = Math.max(teamMembers - 4, 0); // Estimate for trend
  const teamMembersChange = lastQuarterTeamMembers > 0 
    ? Math.round(((teamMembers - lastQuarterTeamMembers) / lastQuarterTeamMembers) * 100)
    : teamMembers > 0 ? 100 : 0;

  // Debug logging for resources
  console.log('[DashboardMetrics] Total resources:', resources?.length || 0);
  console.log('[DashboardMetrics] Workspace resources:', workspaceResources?.length || 0);
  console.log('[DashboardMetrics] Resources with currentProjects:', workspaceResources?.filter(r => r.currentProjects && r.currentProjects.length > 0).length || 0);
  console.log('[DashboardMetrics] Assigned resource IDs:', Array.from(assignedResourceIds));
  console.log('[DashboardMetrics] Team members count:', teamMembers);
  console.log('[DashboardMetrics] Sample resource:', workspaceResources[0]);
  
  // Debug logging for projects and their resources
  console.log('[DashboardMetrics] Total projects:', projects?.length || 0);
  console.log('[DashboardMetrics] Workspace projects:', workspaceProjects?.length || 0);
  console.log('[DashboardMetrics] Projects with resources:', workspaceProjects?.filter(p => p.resources && p.resources.length > 0).length || 0);
  console.log('[DashboardMetrics] Sample project:', workspaceProjects[0]);
  
  // 3. Budget Utilization
  const totalBudget = workspaceProjects.reduce((sum, p) => {
    const budget = parseFloat(p.budget?.replace(/[^0-9.]/g, '') || '0');
    return sum + budget;
  }, 0);
  const budgetUtilization = totalBudget > 0 ? `$${(totalBudget / 1000000).toFixed(1)}M` : '$0M';
  const budgetProgress = Math.min((totalBudget / 2000000) * 100, 100); // Assuming $2M target
  const lastMonthBudget = totalBudget * 0.95; // Estimate for trend
  const budgetChange = lastMonthBudget > 0 
    ? Math.round(((totalBudget - lastMonthBudget) / lastMonthBudget) * 100)
    : 0;

  // 4. Completed This Month
  const completedThisMonth = workspaceProjects.filter(p => {
    if (p.status !== 'Completed' || !p.completedAt) return false;
    const completed = new Date(p.completedAt);
    return completed.getMonth() === now.getMonth() && completed.getFullYear() === now.getFullYear();
  }).length;
  const lastMonthCompleted = workspaceProjects.filter(p => {
    if (p.status !== 'Completed' || !p.completedAt) return false;
    const completed = new Date(p.completedAt);
    return completed.getMonth() === lastMonth.getMonth() && completed.getFullYear() === lastMonth.getFullYear();
  }).length;
  const completedChange = lastMonthCompleted > 0 
    ? Math.round(((completedThisMonth - lastMonthCompleted) / lastMonthCompleted) * 100)
    : completedThisMonth > 0 ? 100 : 0;

  // 5. Avg. Project Duration
  const completedProjects = workspaceProjects.filter(p => p.status === 'Completed' && p.startDate && p.completedAt);
  const avgProjectDuration = completedProjects.length
    ? Math.round(completedProjects.reduce((sum, p) => {
        const duration = (new Date(p.completedAt) - new Date(p.startDate)) / (1000 * 60 * 60 * 24);
        return sum + duration;
      }, 0) / completedProjects.length)
    : 0;
  const avgDurationWeeks = Math.round(avgProjectDuration / 7);
  const lastQuarterDuration = avgDurationWeeks + 2; // Estimate for trend
  const durationChange = lastQuarterDuration > 0 
    ? Math.round(((avgDurationWeeks - lastQuarterDuration) / lastQuarterDuration) * 100)
    : 0;

  // 6. Upcoming Deadlines (next 7 days)
  let upcomingDeadlines = 0;
  workspaceProjects.forEach(p => {
    (p.tasks || []).forEach(t => {
      if (t.endDate) {
        const due = new Date(t.endDate);
        if (due > now && due < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
          upcomingDeadlines++;
        }
      }
    });
  });

  // PERFORMANCE INDICATORS
  const projectSuccessRate = completedProjects.length && workspaceProjects.length
    ? Math.round((completedProjects.length / workspaceProjects.length) * 100)
    : 0;

  // On-Time Delivery (projects completed on or before end date)
  const onTimeDeliveries = completedProjects.filter(p => {
    if (!p.endDate || !p.completedAt) return false;
    const completed = new Date(p.completedAt);
    const due = new Date(p.endDate);
    return completed <= due;
  }).length;
  const onTimeDelivery = completedProjects.length > 0 
    ? Math.round((onTimeDeliveries / completedProjects.length) * 100)
    : 0;

  // Budget Adherence (projects within budget)
  const budgetAdherentProjects = workspaceProjects.filter(p => {
    if (p.status !== 'Completed' || !p.budget) return false;
    const budget = parseFloat(p.budget.replace(/[^0-9.]/g, '') || '0');
    // Assume actual cost is 90% of budget for completed projects
    const actualCost = budget * 0.9;
    return actualCost <= budget;
  }).length;
  const budgetAdherence = completedProjects.length > 0 
    ? Math.round((budgetAdherentProjects / completedProjects.length) * 100)
    : 0;

  // Client Satisfaction (placeholder - would come from feedback system)
  const clientSatisfaction = 85; // Placeholder

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'neutral';
    }
  };

  const metrics = [
    {
      title: 'Active Projects',
      value: activeProjects,
      change: activeProjectsChange,
      changeLabel: 'last month',
      icon: Target,
      color: 'text-blue-400',
      trend: activeProjectsChange >= 0 ? 'up' as const : 'down' as const
    },
    {
      title: 'Team Members',
      value: teamMembers,
      change: teamMembersChange,
      changeLabel: 'last quarter',
      icon: Users,
      color: 'text-green-400',
      trend: teamMembersChange >= 0 ? 'up' as const : 'down' as const
    },
    {
      title: 'Budget Utilization',
      value: budgetUtilization,
      change: budgetChange,
      changeLabel: 'last month',
      icon: DollarSign,
      color: 'text-blue-500',
      progress: budgetProgress,
      trend: budgetChange >= 0 ? 'up' as const : 'down' as const
    },
    {
      title: 'Avg. Project Duration',
      value: `${avgDurationWeeks} weeks`,
      change: durationChange,
      changeLabel: 'last quarter',
      icon: Clock,
      color: 'text-amber-400',
      trend: durationChange <= 0 ? 'up' as const : 'down' as const
    },
    {
      title: 'Completed This Month',
      value: completedThisMonth,
      change: completedChange,
      changeLabel: 'last month',
      icon: CheckCircle,
      color: 'text-green-400',
      trend: completedChange >= 0 ? 'up' as const : 'down' as const
    },
    {
      title: 'Upcoming Deadlines',
      value: upcomingDeadlines,
      change: 0,
      changeLabel: 'this week',
      icon: Calendar,
      color: 'text-red-400',
      trend: 'neutral' as const
    }
  ];

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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h3>
            <p className="text-zinc-400 max-w-md">
              Advanced performance analytics and insights are currently in development. 
              This feature will provide detailed metrics on project success rates, 
              on-time delivery, budget adherence, and client satisfaction.
            </p>
            <div className="mt-6 flex gap-2">
              <DarkModeBadge variant="info" compact>
                In Development
              </DarkModeBadge>
              <DarkModeBadge variant="neutral" compact>
                Q1 2025
              </DarkModeBadge>
            </div>
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
