
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Users, FileText, Settings, BarChart3, Kanban, Calendar } from 'lucide-react';
import ProjectOverview from '@/components/project-management/ProjectOverview';
import TaskStatistics from '@/components/project-management/TaskStatistics';
import ProjectTimeline from '@/components/project-management/ProjectTimeline';
import ProjectResources from '@/components/project-management/ProjectResources';
import ProjectReports from '@/components/project-management/ProjectReports';
import ProjectDocumentation from '@/components/project-management/ProjectDocumentation';
import KanbanBoard from '@/components/project-management/KanbanBoard';
import { useProject } from '@/contexts/ProjectContext';

const ProjectManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects } = useProject();
  const [viewMode, setViewMode] = useState<'gantt' | 'kanban'>('gantt');
  
  const project = projects.find(p => p.id === id);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
          <p className="text-muted-foreground">The requested project could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="border-b pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground mt-1">{project.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={project.status === 'In Progress' ? 'default' : 'secondary'}>
              {project.status}
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Project Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Start Date</p>
                  <p className="text-xs text-muted-foreground">{project.startDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium">End Date</p>
                  <p className="text-xs text-muted-foreground">{project.endDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Team Size</p>
                  <p className="text-xs text-muted-foreground">{project.resources?.length || 0} members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Tasks</p>
                  <p className="text-xs text-muted-foreground">{project.tasks?.length || 0} tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Statistics */}
      <TaskStatistics />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plan">Project Plan</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ProjectOverview />
        </TabsContent>

        <TabsContent value="plan" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Project Plan</h2>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'gantt' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('gantt')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Gantt Chart
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                <Kanban className="h-4 w-4 mr-2" />
                Kanban Board
              </Button>
            </div>
          </div>

          {viewMode === 'gantt' ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Gantt Chart View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Gantt Chart view coming soon</p>
                    <p className="text-sm">This will show your project timeline in a visual gantt format</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <KanbanBoard />
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <ProjectTimeline />
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <ProjectResources />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ProjectReports />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <ProjectDocumentation />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectManagement;
