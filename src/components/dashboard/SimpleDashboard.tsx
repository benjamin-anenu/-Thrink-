
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
import { useRealTimeDashboardData } from '@/hooks/useRealTimeDashboardData';
import { Skeleton } from '@/components/ui/skeleton';

const SimpleDashboard: React.FC = () => {
  const { stats, loading } = useRealTimeDashboardData();

  const quickStats = [
    {
      title: 'Total Projects',
      value: stats.totalProjects.toString(),
      icon: FolderOpen,
      color: 'text-blue-500'
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects.toString(),
      icon: TrendingUp,
      color: 'text-green-500'
    },
    {
      title: 'Available Resources',
      value: stats.availableResources.toString(),
      icon: Users,
      color: 'text-purple-500'
    },
    {
      title: 'Avg Progress',
      value: `${stats.avgProgress}%`,
      icon: CheckCircle,
      color: 'text-orange-500'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Quick Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Main Content Skeleton */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
                {stats.upcomingDeadlines.length > 0 ? (
                  stats.upcomingDeadlines.map((item, index) => (
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
                  <p className="text-muted-foreground text-center py-4">
                    No upcoming deadlines in the next 7 days
                  </p>
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
                {stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity, index) => (
                    <div key={index} className="space-y-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.project} • {activity.time}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No recent activity to display
                  </p>
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
