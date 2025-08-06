
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
import { MobileEnhancedCard } from '@/components/mobile/MobileEnhancedCard';
import { useIsMobile } from '@/hooks/use-mobile';

const SimpleDashboard: React.FC = () => {
  const { stats, loading } = useRealTimeDashboardData();
  const isMobile = useIsMobile();

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
      {/* Quick Stats - 2x2 Grid on Mobile */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mobile-grid-spacing">
        {quickStats.map((stat, index) => {
          const IconComponent = stat.icon;
          const CardComponent = isMobile ? MobileEnhancedCard : Card;
          return (
            <CardComponent 
              key={index} 
              className="mobile-stat-card mobile-entrance-animation"
              elevation={isMobile ? 2 : undefined}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 mobile-card-header">
                <CardTitle className="mobile-stat-title">{stat.title}</CardTitle>
                <IconComponent className={`mobile-stat-icon ${stat.color}`} />
              </CardHeader>
              <CardContent className="mobile-card-content">
                <div className="mobile-stat-value">{stat.value}</div>
              </CardContent>
            </CardComponent>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <div className="mx-2 md:mx-0">
        <Tabs defaultValue="overview" className="space-y-4">
          {/* Mobile: Stack tabs vertically, Desktop: Grid layout */}
          <div className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto md:h-10 gap-1 md:gap-0 p-1">
              <TabsTrigger value="overview" className="text-xs md:text-sm min-h-[44px] md:min-h-[36px] px-2">Overview</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs md:text-sm min-h-[44px] md:min-h-[36px] px-2">Analytics</TabsTrigger>
              <TabsTrigger value="ai-insights" className="text-xs md:text-sm min-h-[44px] md:min-h-[36px] px-2">AI Insights</TabsTrigger>
              <TabsTrigger value="projects" className="text-xs md:text-sm min-h-[44px] md:min-h-[36px] px-2">Projects</TabsTrigger>
            </TabsList>
          </div>

        <TabsContent value="overview" className="space-y-3 md:space-y-4">
          <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-2">
            {/* Upcoming Deadlines */}
            <Card className="animate-fade-in">
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="flex items-center gap-2 text-sm md:text-lg">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0 space-y-2 md:space-y-3">
                {stats.upcomingDeadlines.length > 0 ? (
                  stats.upcomingDeadlines.map((item, index) => (
                    <div key={index} className="flex items-center justify-between min-h-[44px] p-2 md:p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs md:text-base truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{item.deadline}</span>
                        </p>
                      </div>
                      <Badge 
                        variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'secondary' : 'outline'}
                        className="ml-2 text-xs flex-shrink-0"
                      >
                        {item.priority}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4 md:py-8 text-xs md:text-base">
                    No upcoming deadlines in the next 7 days
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="animate-fade-in">
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="flex items-center gap-2 text-sm md:text-lg">
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0 space-y-2 md:space-y-3">
                {stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity, index) => (
                    <div key={index} className="space-y-1 min-h-[44px] p-2 rounded-lg hover:bg-muted/50 transition-colors flex flex-col justify-center">
                      <p className="font-medium text-xs md:text-base">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.project} • {activity.time}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4 md:py-8 text-xs md:text-base">
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
