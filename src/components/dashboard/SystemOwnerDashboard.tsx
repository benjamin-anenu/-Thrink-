
import React, { useMemo, useState } from 'react';
import { useSystemOwnerOverview, SystemOwnerFilters } from '@/hooks/useSystemOwnerOverview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown,
  Users,
  Building2,
  FolderOpen,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import SystemOwnerFiltersPanel from './SystemOwnerFilters';
import SystemOwnerProjectList from './SystemOwnerProjectList';

const SystemOwnerDashboard: React.FC = () => {
  const [filters, setFilters] = useState<SystemOwnerFilters>({ workspaceIds: [] });
  const { data, loading } = useSystemOwnerOverview(filters);

  const systemMetrics = useMemo(() => ([
    {
      title: 'Active Projects',
      value: String(data?.activeProjects ?? 0),
      icon: FolderOpen,
    },
    {
      title: 'At-Risk Projects',
      value: String(data?.atRiskProjects ?? 0),
      icon: AlertTriangle,
    },
    {
      title: 'Open Issues',
      value: String(data?.openIssues ?? 0),
      icon: Activity,
    },
    {
      title: 'Overdue Tasks',
      value: String(data?.overdueTasks ?? 0),
      icon: Clock,
    },
    {
      title: 'Tasks Due Today',
      value: String(data?.tasksDueToday ?? 0),
      icon: Clock,
    },
    {
      title: 'Escalations (7d)',
      value: String(data?.escalationsLast7 ?? 0),
      icon: AlertTriangle,
    },
  ]), [data]);

  const topPerformers = (data?.topPerformers ?? []).map(p => ({
    name: p.name,
    workspace: p.workspaceName ?? '—',
    completedTasks: p.completedTasks ?? 0,
    efficiency: `${Math.round(p.efficiency ?? 0)}%`,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Crown className="h-8 w-8 text-yellow-500" />
        <div>
          <h1 className="text-2xl font-bold">System Administrator Dashboard</h1>
          <p className="text-muted-foreground">Real-time portfolio oversight across all workspaces</p>
        </div>
      </div>

      {/* Filters */}
      <SystemOwnerFiltersPanel
        workspaces={data?.workspaces ?? []}
        value={{
          workspaceIds: filters.workspaceIds ?? [],
          dateFrom: (filters as any).dateFrom,
          dateTo: (filters as any).dateTo,
          search: (filters as any).search,
        }}
        onChange={(v) => setFilters({ ...filters, ...v })}
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {systemMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projects list */}
        <div className="lg:col-span-2">
          <SystemOwnerProjectList projects={data?.projectsDetails ?? []} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Workspace Snapshot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Workspace Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(data?.workspaces ?? []).map((w) => (
                <div key={w.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{w.name}</p>
                    <p className="text-sm text-muted-foreground">{w.members} users • {w.projects} projects</p>
                  </div>
                  <Badge variant={(w.status ?? 'active') === 'active' ? 'default' : 'secondary'}>{w.status ?? 'active'}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topPerformers.map((user, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.workspace}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{user.completedTasks} tasks</p>
                    <p className="text-sm text-green-500">{user.efficiency}</p>
                  </div>
                </div>
              ))}
              {topPerformers.length === 0 && (
                <div className="text-sm text-muted-foreground">No performance data yet.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SystemOwnerDashboard;
