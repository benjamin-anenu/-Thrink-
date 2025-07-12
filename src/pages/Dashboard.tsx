
import React, { useState } from 'react';
import Header from '@/components/Header';
import MiloAssistant from '@/components/MiloAssistant';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import AIInsights from '@/components/dashboard/AIInsights';
import AIProjectDashboard from '@/components/AIProjectDashboard';
import ProjectDisplay from '@/components/dashboard/ProjectDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Brain, Target, TrendingUp, Zap, Calendar, Users } from 'lucide-react';

const Dashboard = () => {
  const [activeProject, setActiveProject] = useState(0);

  const projects = [
    {
      name: 'E-commerce Platform Redesign',
      status: 'In Progress',
      progress: 85,
      risk: 'Low',
      team: 8,
      deadline: '2 weeks',
      aiInsight: 'Project is 12% ahead of schedule. Team velocity has increased by 23% this sprint. Recommend maintaining current resource allocation.',
      color: 'from-blue-500 to-cyan-500',
      priority: 'High'
    },
    {
      name: 'Mobile App Development',
      status: 'In Progress',
      progress: 60,
      risk: 'Medium',
      team: 6,
      deadline: '6 weeks',
      aiInsight: 'Backend integration phase showing delays. Consider adding 1 senior developer to maintain timeline. 78% probability of on-time delivery.',
      color: 'from-purple-500 to-pink-500',
      priority: 'High'
    },
    {
      name: 'Marketing Campaign Q2',
      status: 'Planning',
      progress: 30,
      risk: 'Low',
      team: 4,
      deadline: '8 weeks',
      aiInsight: 'Early planning phase progressing well. Budget allocation is optimal. Recommend stakeholder review in 2 weeks.',
      color: 'from-green-500 to-emerald-500',
      priority: 'Medium'
    }
  ];

  // Cycle through projects every 5 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveProject((prev) => (prev + 1) % projects.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [projects.length]);

  const upcomingDeadlines = [
    { project: 'E-commerce Platform', task: 'Final Testing', date: '2024-01-20', priority: 'High' },
    { project: 'Mobile App', task: 'Beta Release', date: '2024-01-25', priority: 'Medium' },
    { project: 'Marketing Campaign', task: 'Content Review', date: '2024-02-01', priority: 'Low' }
  ];

  const recentActivity = [
    { action: 'Project milestone completed', project: 'E-commerce Platform', time: '2 hours ago' },
    { action: 'New team member added', project: 'Mobile App', time: '4 hours ago' },
    { action: 'Budget approved', project: 'Marketing Campaign', time: '1 day ago' },
    { action: 'Risk assessment updated', project: 'Infrastructure Upgrade', time: '2 days ago' }
  ];

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
              All Systems Operational
            </Badge>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Review
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
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
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Projects
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardMetrics />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Deadlines */}
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
                  {upcomingDeadlines.map((deadline, index) => (
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
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
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
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.project} • {activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AIProjectDashboard />
          </TabsContent>

          <TabsContent value="ai-insights">
            <AIInsights />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectDisplay projects={projects} activeProject={activeProject} />
          </TabsContent>
        </Tabs>
      </main>

      <MiloAssistant />
    </div>
  );
};

export default Dashboard;
