
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import TinkAssistant from '@/components/TinkAssistant';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import AIInsights from '@/components/dashboard/AIInsights';
import AIProjectDashboard from '@/components/AIProjectDashboard';
import ProjectDisplay from '@/components/dashboard/ProjectDisplay';
import AdvancedAnalyticsDashboard from '@/components/analytics/AdvancedAnalyticsDashboard';
import SmartAnalyticsWidgets from '@/components/analytics/SmartAnalyticsWidgets';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useProject } from '@/contexts/ProjectContext';
import { useResources } from '@/contexts/ResourceContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Brain, Target, TrendingUp, Zap, Calendar, Users, Activity } from 'lucide-react';

const Dashboard = () => {
  const { projects } = useProject();
  const { resources } = useResources();

  console.log('[Dashboard] Rendering with projects:', projects.length);

  // Generate upcoming deadlines from real project data
  const upcomingDeadlines = projects.flatMap(project => 
    [...project.tasks, ...project.milestones.map(m => ({
      ...m,
      name: m.name,
      endDate: m.date,
      status: m.status === 'completed' ? 'Completed' : 'Pending',
      priority: 'Medium' as const
    }))]
      .filter(item => {
        const itemDate = new Date(item.endDate);
        const today = new Date();
        const diffDays = Math.ceil((itemDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 14 && item.status !== 'Completed';
      })
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
      .slice(0, 3)
      .map(item => ({
        project: project.name,
        task: item.name,
        date: new Date(item.endDate).toLocaleDateString(),
        priority: item.priority || 'Medium'
      }))
  );

  // Generate recent activity from real project data
  const recentActivity = projects.flatMap(project => 
    project.tasks
      .filter(task => task.status === 'Completed' || task.progress > 80)
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
      .slice(0, 2)
      .map(task => ({
        action: task.status === 'Completed' ? 'Task completed' : `Task ${task.progress}% complete`,
        project: project.name,
        time: (() => {
          const taskDate = new Date(task.endDate);
          const now = new Date();
          const diffHours = Math.floor((now.getTime() - taskDate.getTime()) / (1000 * 60 * 60));
          return diffHours < 24 ? `${diffHours} hours ago` : `${Math.floor(diffHours / 24)} days ago`;
        })()
      }))
  ).slice(0, 4);

  // Calculate real metrics from context data
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'In Progress').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const totalResources = resources.length;
  const availableResources = resources.filter(r => r.status === 'Available').length;
  const avgProjectProgress = projects.length > 0 
    ? Math.round(projects.reduce((acc, project) => {
        const projectProgress = project.tasks.length > 0 
          ? project.tasks.reduce((taskAcc, task) => taskAcc + task.progress, 0) / project.tasks.length
          : 0;
        return acc + projectProgress;
      }, 0) / projects.length)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening with your projects.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {totalProjects > 0 ? `${activeProjects} Active Projects` : 'No Active Projects'}
            </Badge>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Review
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="ai-insights" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="advanced-analytics" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Advanced Analytics
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Projects
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{totalProjects}</div>
                  <p className="text-xs text-muted-foreground">Total Projects</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-500">{activeProjects}</div>
                  <p className="text-xs text-muted-foreground">Active Projects</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-500">{availableResources}</div>
                  <p className="text-xs text-muted-foreground">Available Resources</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-purple-500">{avgProjectProgress}%</div>
                  <p className="text-xs text-muted-foreground">Avg Progress</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Deadlines
                  </CardTitle>
                  <CardDescription>
                    Critical tasks and milestones approaching
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((deadline, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{deadline.task}</p>
                        <p className="text-sm text-muted-foreground">{deadline.project}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{deadline.date}</p>
                        <Badge 
                          variant="outline" 
                          className={
                            deadline.priority === 'High' ? 'text-red-600 border-red-200' :
                            deadline.priority === 'Medium' ? 'text-yellow-600 border-yellow-200' :
                            'text-green-600 border-green-200'
                          }
                        >
                          {deadline.priority}
                        </Badge>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No upcoming deadlines</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Latest updates across all projects
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.project} • {activity.time}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Smart Analytics Widgets */}
            <ErrorBoundary fallback={null}>
              <SmartAnalyticsWidgets />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="analytics">
            <ErrorBoundary fallback={<div className="p-8 text-center text-muted-foreground">Unable to load analytics</div>}>
              <AIProjectDashboard />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="ai-insights">
            <ErrorBoundary fallback={<div className="p-8 text-center text-muted-foreground">Unable to load AI insights</div>}>
              <AIInsights />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="advanced-analytics">
            <ErrorBoundary fallback={<div className="p-8 text-center text-muted-foreground">Unable to load advanced analytics</div>}>
              <AdvancedAnalyticsDashboard />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="projects">
            <ErrorBoundary fallback={<div className="p-8 text-center text-muted-foreground">Unable to load projects</div>}>
              <ProjectDisplay />
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </main>

      <TinkAssistant />
    </div>
  );
};

export default Dashboard;
