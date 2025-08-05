
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mx-4 md:mx-0">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="min-h-[80px]">
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
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 mx-4 md:mx-0">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mx-4 md:mx-0">
        {quickStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="min-h-[80px] animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <IconComponent className={`h-5 w-5 md:h-4 md:w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-xl lg:text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <div className="mx-4 md:mx-0">
        <Tabs defaultValue="overview" className="space-y-4">
          {/* Mobile: Scrollable tabs, Desktop: Grid layout */}
          <div className="overflow-x-auto md:overflow-visible">
            <TabsList className="grid w-full grid-cols-4 min-w-[350px] md:min-w-0 h-12 md:h-10">
              <TabsTrigger value="overview" className="text-xs md:text-sm min-h-[44px] md:min-h-[36px]">Overview</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs md:text-sm min-h-[44px] md:min-h-[36px]">Analytics</TabsTrigger>
              <TabsTrigger value="ai-insights" className="text-xs md:text-sm min-h-[44px] md:min-h-[36px]">AI Insights</TabsTrigger>
              <TabsTrigger value="projects" className="text-xs md:text-sm min-h-[44px] md:min-h-[36px]">Projects</TabsTrigger>
            </TabsList>
          </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {/* Upcoming Deadlines */}
            <Card className="animate-fade-in">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 space-y-3">
                {stats.upcomingDeadlines.length > 0 ? (
                  stats.upcomingDeadlines.map((item, index) => (
                    <div key={index} className="flex items-center justify-between min-h-[44px] p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-sm md:text-base">{item.name}</p>
                        <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.deadline}
                        </p>
                      </div>
                      <Badge 
                        variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'secondary' : 'outline'}
                        className="ml-2 text-xs"
                      >
                        {item.priority}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8 text-sm md:text-base">
                    No upcoming deadlines in the next 7 days
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="animate-fade-in">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 space-y-3">
                {stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity, index) => (
                    <div key={index} className="space-y-1 min-h-[44px] p-2 rounded-lg hover:bg-muted/50 transition-colors flex flex-col justify-center">
                      <p className="font-medium text-sm md:text-base">{activity.action}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {activity.project} • {activity.time}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8 text-sm md:text-base">
                    No recent activity to display
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="animate-fade-in">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">Analytics</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <p className="text-muted-foreground text-sm md:text-base">Analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights">
          <Card className="animate-fade-in">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">AI Insights</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <p className="text-muted-foreground text-sm md:text-base">AI insights will appear here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card className="animate-fade-in">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">Projects Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <p className="text-muted-foreground text-sm md:text-base">Project details will be shown here...</p>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SimpleDashboard;
