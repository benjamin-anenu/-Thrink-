
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FolderOpen, 
  Users, 
  TrendingUp, 
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { useResources } from '@/contexts/ResourceContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const SimpleDashboard: React.FC = () => {
  const { projects } = useProject();
  const { resources } = useResources();
  const { currentWorkspace } = useWorkspace();

  // Filter data by current workspace
  const workspaceProjects = projects.filter(project => 
    !currentWorkspace || project.workspaceId === currentWorkspace.id
  );
  
  const workspaceResources = resources.filter(resource => 
    !currentWorkspace || resource.workspaceId === currentWorkspace.id
  );

  // Calculate real metrics
  const totalProjects = workspaceProjects.length;
  const activeProjects = workspaceProjects.filter(p => p.status === 'In Progress').length;
  const availableResources = workspaceResources.length;
  const avgProgress = workspaceProjects.length > 0 
    ? Math.round(workspaceProjects.reduce((acc, p) => acc + p.progress, 0) / workspaceProjects.length)
    : 0;

  const quickStats = [
    {
      title: 'Total Projects',
      value: totalProjects.toString(),
      icon: FolderOpen,
      color: 'text-blue-500'
    },
    {
      title: 'Active Projects',
      value: activeProjects.toString(),
      icon: TrendingUp,
      color: 'text-green-500'
    },
    {
      title: 'Available Resources',
      value: availableResources.toString(),
      icon: Users,
      color: 'text-purple-500'
    },
    {
      title: 'Avg Progress',
      value: `${avgProgress}%`,
      icon: CheckCircle,
      color: 'text-orange-500'
    }
  ];

  // Get upcoming deadlines from real project data
  const upcomingDeadlines = workspaceProjects
    .filter(project => {
      const endDate = new Date(project.endDate);
      const today = new Date();
      const daysDiff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return daysDiff >= 0 && daysDiff <= 7; // Projects due in the next 7 days
    })
    .map(project => {
      const endDate = new Date(project.endDate);
      const today = new Date();
      const daysDiff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      let deadline = '';
      if (daysDiff === 0) deadline = 'Today';
      else if (daysDiff === 1) deadline = 'Tomorrow';
      else deadline = `In ${daysDiff} days`;
      
      let priority: 'high' | 'medium' | 'low' = 'low';
      if (daysDiff <= 1) priority = 'high';
      else if (daysDiff <= 3) priority = 'medium';
      
      return {
        name: project.name,
        deadline,
        priority
      };
    })
    .slice(0, 3); // Show only top 3

  // Get recent activity from projects (simplified)
  const recentActivity = workspaceProjects
    .slice(0, 3)
    .map(project => ({
      action: project.status === 'Completed' ? 'Project completed' : 'Status updated',
      project: project.name,
      time: '2 hours ago' // This could be enhanced with real timestamps
    }));

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingDeadlines.length > 0 ? (
                  upcomingDeadlines.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.deadline}
                        </p>
                      </div>
                      <Badge 
                        variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'secondary' : 'outline'}
                      >
                        {item.priority}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="space-y-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.project} • {activity.time}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights">
          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">AI insights will appear here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Projects Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Project details will be shown here...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimpleDashboard;
