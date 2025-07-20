
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectReportsKPIs } from './reports/ProjectReportsKPIs';
import { ProjectReportsCharts } from './reports/ProjectReportsCharts';
import { ProjectReportsPerformance } from './reports/ProjectReportsPerformance';
import { ProjectReportsInsights } from './reports/ProjectReportsInsights';
import { ProjectReportsExport } from './reports/ProjectReportsExport';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { BarChart3 } from 'lucide-react';

interface ProjectReportsProps {
  projectId: string;
}

const ProjectReports: React.FC<ProjectReportsProps> = ({ projectId }) => {
  const { tasks, milestones, loading } = useTaskManagement(projectId);
  const [reportData, setReportData] = useState<any>({});

  useEffect(() => {
    if (!loading && tasks.length > 0) {
      // Calculate report metrics from live data
      const completedTasks = tasks.filter(t => t.status === 'Completed').length;
      const totalTasks = tasks.length;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      const overdueTasks = tasks.filter(t => {
        const today = new Date();
        const endDate = new Date(t.endDate);
        return endDate < today && t.status !== 'Completed';
      }).length;
      
      const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
      const pendingTasks = tasks.filter(t => t.status === 'Not Started').length;
      
      const completedMilestones = milestones.filter(m => m.status === 'completed').length;
      const totalMilestones = milestones.length;
      const milestoneCompletionRate = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
      
      // Calculate average progress
      const avgProgress = tasks.length > 0 
        ? tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length 
        : 0;

      // Group tasks by status for charts
      const tasksByStatus = {
        'Completed': completedTasks,
        'In Progress': inProgressTasks,
        'Pending': pendingTasks,
        'Overdue': overdueTasks
      };

      // Group tasks by priority
      const tasksByPriority = tasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setReportData({
        kpis: {
          totalTasks,
          completedTasks,
          completionRate,
          overdueTasks,
          inProgressTasks,
          pendingTasks,
          totalMilestones,
          completedMilestones,
          milestoneCompletionRate,
          avgProgress
        },
        charts: {
          tasksByStatus,
          tasksByPriority,
          progressTrend: tasks.map(task => ({
            name: task.name,
            progress: task.progress,
            startDate: task.startDate,
            endDate: task.endDate
          }))
        },
        performance: {
          onTimeCompletion: completionRate,
          resourceUtilization: tasks.filter(t => t.assignedResources.length > 0).length / totalTasks * 100,
          qualityScore: avgProgress
        }
      });
    }
  }, [tasks, milestones, loading]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Project Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading reports...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Project Reports
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Real-time project analytics and insights
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="kpis" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="kpis">KPIs</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>
            
            <TabsContent value="kpis" className="space-y-4">
              <ProjectReportsKPIs data={reportData.kpis || {}} />
            </TabsContent>
            
            <TabsContent value="charts" className="space-y-4">
              <ProjectReportsCharts data={reportData.charts || {}} />
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4">
              <ProjectReportsPerformance 
                data={reportData.performance || {}} 
                tasks={tasks}
                milestones={milestones}
              />
            </TabsContent>
            
            <TabsContent value="insights" className="space-y-4">
              <ProjectReportsInsights 
                tasks={tasks}
                milestones={milestones}
                projectId={projectId}
              />
            </TabsContent>
            
            <TabsContent value="export" className="space-y-4">
              <ProjectReportsExport 
                projectId={projectId}
                data={reportData}
                tasks={tasks}
                milestones={milestones}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectReports;
