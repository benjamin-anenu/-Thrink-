
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Calendar, 
  FileText, 
  Settings, 
  Users, 
  CheckSquare,
  Kanban,
  AlertCircle,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import ProjectOverview from '@/components/project-management/ProjectOverview';
import ProjectTimeline from '@/components/project-management/ProjectTimeline';
import ProjectResources from '@/components/project-management/ProjectResources';
import ProjectReports from '@/components/project-management/ProjectReports';
import ProjectDocumentation from '@/components/project-management/ProjectDocumentation';
import ProjectGanttChart from '@/components/project-management/ProjectGanttChart';
import ProjectIssueLog from '@/components/project-management/issues/ProjectIssueLog';
import PhaseView from '@/components/project-management/phases/PhaseView';
import KanbanBoard from '@/components/project-management/KanbanBoard';
import TaskDetailModal from '@/components/TaskDetailModal';
import { ProjectTask } from '@/types/project';

const ProjectManagement = () => {
  const { id } = useParams<{ id: string }>();
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTaskManagement(id || '');
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const project = projects.find(p => p.id === id);

  useEffect(() => {
    if (!projectsLoading && !project) {
      console.error('Project not found');
    }
  }, [project, projectsLoading]);

  const handleTaskClick = (task: ProjectTask) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(false);
  };

  if (projectsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Project not found</div>
      </div>
    );
  }

  // Calculate project statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
  const overdueTasks = tasks.filter(task => 
    task.status !== 'Completed' && new Date(task.endDate) < new Date()
  ).length;

  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Project Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground mt-2">{project.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={project.status === 'Active' ? 'default' : 'secondary'}>
            {project.status}
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Project Settings
          </Button>
        </div>
      </div>

      {/* Project Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{totalTasks}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{inProgressTasks}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueTasks}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Task Plan
          </TabsTrigger>
          <TabsTrigger value="kanban" className="flex items-center gap-2">
            <Kanban className="h-4 w-4" />
            Kanban Board
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="gantt" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Gantt Chart
          </TabsTrigger>
          <TabsTrigger value="phases" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Phases
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Issues
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ProjectOverview projectId={id!} />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <ProjectTimeline projectId={id!} />
        </TabsContent>

        <TabsContent value="kanban" className="space-y-4">
          <KanbanBoard projectId={id!} onTaskClick={handleTaskClick} />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <ProjectTimeline projectId={id!} />
        </TabsContent>

        <TabsContent value="gantt" className="space-y-4">
          <ProjectGanttChart projectId={id!} />
        </TabsContent>

        <TabsContent value="phases" className="space-y-4">
          <PhaseView projectId={id!} />
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <ProjectResources projectId={id!} />
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <ProjectIssueLog projectId={id!} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ProjectReports projectId={id!} />
        </TabsContent>
      </Tabs>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
      />
    </div>
  );
};

export default ProjectManagement;
