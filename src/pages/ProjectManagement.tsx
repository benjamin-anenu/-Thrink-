
import React from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '@/contexts/ProjectContext';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProjectOverview from '@/components/project-management/ProjectOverview';
import ProjectTimeline from '@/components/project-management/ProjectTimeline';
import ProjectResources from '@/components/project-management/ProjectResources';
import KanbanBoard from '@/components/project-management/KanbanBoard';
import ProjectReports from '@/components/project-management/ProjectReports';
import ProjectDocumentation from '@/components/project-management/ProjectDocumentation';
import { PhaseView } from '@/components/project-management/phases/PhaseView';
import ProjectGanttChart from '@/components/project-management/ProjectGanttChart';
import { ProjectIssueLog } from '@/components/project-management/issues/ProjectIssueLog';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { CheckCircle2, Clock, AlertTriangle, BarChart3 } from 'lucide-react';

const ProjectManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = id; // Create alias for backward compatibility with child components
  const { projects } = useProject();
  const { tasks } = useTaskManagement(projectId);
  
  const project = projects.find(p => p.id === projectId);

  if (!projectId) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Project Not Found</h1>
            <p className="text-muted-foreground">No project ID provided.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Project Not Found</h1>
            <p className="text-muted-foreground">The requested project could not be found.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
  const overdueTasks = tasks.filter(task => {
    if (task.status === 'Completed') return false;
    const today = new Date();
    const endDate = new Date(task.endDate);
    return endDate < today;
  }).length;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
            <Badge variant={project.status === 'In Progress' ? 'default' : 'secondary'}>
              {project.status}
            </Badge>
          </div>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>

        {/* Task Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">{totalTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{completedTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{inProgressTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold">{overdueTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
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

          <TabsContent value="overview">
            <ProjectOverview project={project} />
          </TabsContent>

          <TabsContent value="phases">
            <PhaseView projectId={projectId} />
          </TabsContent>

          <TabsContent value="plan">
            <ProjectGanttChart 
              projectId={projectId} 
              onSwitchToIssueLog={(taskId) => {
                // Switch to issues tab with task filter
                const tabsList = document.querySelector('[role="tablist"]');
                const issuesTab = tabsList?.querySelector('[value="issues"]') as HTMLElement;
                issuesTab?.click();
              }}
            />
          </TabsContent>

          <TabsContent value="timeline">
            <ProjectTimeline projectId={projectId} />
          </TabsContent>

          <TabsContent value="resources">
            <ProjectResources projectId={projectId} />
          </TabsContent>

          <TabsContent value="issues">
            <ProjectIssueLog projectId={projectId} />
          </TabsContent>

          <TabsContent value="documentation">
            <ProjectDocumentation />
          </TabsContent>

          <TabsContent value="reports">
            <ProjectReports projectId={projectId} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProjectManagement;
