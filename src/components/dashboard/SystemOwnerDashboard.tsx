
import React from 'react';
import { useSystemOwnerOverview } from '@/hooks/useSystemOwnerOverview';
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
  BarChart3
} from 'lucide-react';

const SystemOwnerDashboard: React.FC = () => {
  const { data, loading } = useSystemOwnerOverview();

  const systemMetrics = [
    {
      title: 'Total Workspaces',
      value: String(data?.totalWorkspaces ?? 0),
      change: '',
      icon: Building2,
      color: 'text-blue-500'
    },
    {
      title: 'Total Users',
      value: String(data?.totalUsers ?? 0),
      change: '',
      icon: Users,
      color: 'text-green-500'
    },
    {
      title: 'Active Projects',
      value: String(data?.activeProjects ?? 0),
      change: '',
      icon: FolderOpen,
      color: 'text-purple-500'
    },
  ];

  const workspaceData = (data?.workspaces ?? []).map(w => ({
    name: w.name,
    users: w.members,
    projects: w.projects,
    progress: w.progress ?? 75,
    status: w.status ?? 'active',
    lastActivity: w.lastActivity ?? '—'
  }));

  const topPerformers = (data?.topPerformers ?? []).map(p => ({
    name: p.name,
    workspace: p.workspaceName ?? '—',
    completedTasks: p.completedTasks ?? 0,
    efficiency: `${Math.round(p.efficiency ?? 0)}%`,
  }));

  const systemAlerts: { type: 'warning' | 'success' | 'info'; message: string; time: string }[] = [
  ];

  return (
    <div className="space-y-6">
      {/* System Owner Header */}
      <div className="flex items-center gap-3 mb-6">
        <Crown className="h-8 w-8 text-yellow-500" />
        <div>
          <h1 className="text-2xl font-bold">System Administrator Dashboard</h1>
          <p className="text-muted-foreground">Complete system oversight and management</p>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <IconComponent className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">{metric.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Workspace Overview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Workspace Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {workspaceData.map((workspace, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{workspace.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {workspace.users} users • {workspace.projects} projects
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={workspace.status === 'active' ? 'default' : 'secondary'}
                      >
                        {workspace.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{workspace.progress}%</span>
                    </div>
                    <Progress value={workspace.progress} className="h-2" />
                  </div>
                  
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last activity: {workspace.lastActivity}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
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
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {systemAlerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    {alert.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {alert.type === 'info' && <Activity className="h-4 w-4 text-blue-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            System Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">89%</div>
              <div className="text-sm text-muted-foreground">User Engagement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">94%</div>
              <div className="text-sm text-muted-foreground">Project Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">76%</div>
              <div className="text-sm text-muted-foreground">Resource Utilization</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemOwnerDashboard;
