
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Users, DollarSign, TrendingUp, AlertCircle, BarChart3, Kanban } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import TaskStatistics from '@/components/project-management/TaskStatistics';
import ProjectOverview from '@/components/project-management/ProjectOverview';
import { PhaseView } from '@/components/project-management/phases/PhaseView';
import ProjectGanttChart from '@/components/project-management/ProjectGanttChart';
import KanbanBoard from '@/components/project-management/KanbanBoard';
import ProjectTimeline from '@/components/project-management/ProjectTimeline';
import ProjectResources from '@/components/project-management/ProjectResources';
import { ProjectIssueLog } from '@/components/project-management/issues/ProjectIssueLog';
import ProjectDocumentation from '@/components/project-management/ProjectDocumentation';
import ProjectReports from '@/components/project-management/ProjectReports';

const ProjectManagement = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { projects } = useProject();
  const [activeTab, setActiveTab] = useState('overview');
  const [planView, setPlanView] = useState<'gantt' | 'kanban'>('gantt');

  // Find the current project
  const currentProject = projects.find(p => p.id === projectId);

  if (!currentProject) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Project Not Found</h1>
            <p className="text-muted-foreground">The requested project could not be found.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Planning': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{currentProject.name}</h1>
            <p className="text-muted-foreground mt-1">{currentProject.description}</p>
          </div>
          <Badge variant="secondary" className={getStatusColor(currentProject.status)}>
            {currentProject.status}
          </Badge>
        </div>

        {/* Task Statistics */}
        <TaskStatistics />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="phases">Phases</TabsTrigger>
            <TabsTrigger value="plan">Project Plan</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ProjectOverview project={currentProject} />
          </TabsContent>

          <TabsContent value="phases">
            {projectId && <PhaseView projectId={projectId} />}
          </TabsContent>

          <TabsContent value="plan" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Project Plan</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={planView === 'gantt' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPlanView('gantt')}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Gantt Chart
                    </Button>
                    <Button
                      variant={planView === 'kanban' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPlanView('kanban')}
                    >
                      <Kanban className="h-4 w-4 mr-2" />
                      Kanban Board
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {planView === 'gantt' && projectId && (
                  <ProjectGanttChart projectId={projectId} />
                )}
                {planView === 'kanban' && projectId && (
                  <KanbanBoard projectId={projectId} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            {projectId && <ProjectTimeline projectId={projectId} />}
          </TabsContent>

          <TabsContent value="resources">
            {projectId && <ProjectResources projectId={projectId} />}
          </TabsContent>

          <TabsContent value="issues">
            {projectId && <ProjectIssueLog projectId={projectId} />}
          </TabsContent>

          <TabsContent value="documentation">
            {projectId && <ProjectDocumentation projectId={projectId} />}
          </TabsContent>

          <TabsContent value="reports">
            {projectId && <ProjectReports projectId={projectId} />}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProjectManagement;
