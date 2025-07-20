
import React from 'react';
import Header from '@/components/Header';
import TinkAssistant from '@/components/TinkAssistant';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import AIInsights from '@/components/dashboard/AIInsights';
import AIProjectDashboard from '@/components/AIProjectDashboard';
import ProjectDisplay from '@/components/dashboard/ProjectDisplay';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Brain, Target, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Project Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor your project progress and get AI-powered insights
          </p>
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

          <TabsContent value="overview">
            <ErrorBoundary fallback={<div className="p-8 text-center text-muted-foreground">Unable to load dashboard metrics</div>}>
              <DashboardMetrics />
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
