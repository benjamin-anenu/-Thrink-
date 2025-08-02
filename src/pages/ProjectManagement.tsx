import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Users, FileText, Settings, BarChart3, Kanban, Calendar, Layers, AlertTriangle, History } from 'lucide-react';
import Layout from '@/components/Layout';
import ProjectOverview from '@/components/project-management/ProjectOverview';
import TaskStatistics from '@/components/project-management/TaskStatistics';
import ProjectTimeline from '@/components/project-management/ProjectTimeline';
import ProjectResources from '@/components/project-management/ProjectResources';
import ProjectReports from '@/components/project-management/ProjectReports';
import ProjectDocumentation from '@/components/project-management/ProjectDocumentation';
import KanbanBoard from '@/components/project-management/KanbanBoard';
import ProjectGanttChart from '@/components/project-management/ProjectGanttChart';
import { PhaseView } from '@/components/project-management/phases/PhaseView';
import { ProjectIssueLog } from '@/components/project-management/issues/ProjectIssueLog';
import ProjectCalendar from '@/components/calendar/ProjectCalendar';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useProject } from '@/contexts/ProjectContext';
import ProjectCalendarModal from '@/components/project-management/ProjectCalendarModal';

const ProjectManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects } = useProject();
  const [viewMode, setViewMode] = useState<'gantt' | 'kanban'>('gantt');
  const [issueTaskFilter, setIssueTaskFilter] = useState<string | undefined>(undefined);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const { events, createEvent } = useCalendarEvents();
  
  const project = projects.find(p => p.id === id);

  if (!project) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
            <p className="text-muted-foreground">The requested project could not be found.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSwitchToIssueLog = (taskId?: string) => {
    setIssueTaskFilter(taskId);
    // We'll need to programmatically switch to the issues tab
    const tabsTrigger = document.querySelector('[data-value="issues"]') as HTMLElement;
    if (tabsTrigger) {
      tabsTrigger.click();
    }
  };

  const handleClearTaskFilter = () => {
    setIssueTaskFilter(undefined);
  };

  // Filter events for this specific project
  const projectEvents = events.filter(event => event.projectId === project?.id);

  const handleEventClick = (event: any) => {
    console.log('Event clicked:', event);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsCalendarModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Calendar View
              </Button>
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
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="phases">Phases</TabsTrigger>
            <TabsTrigger value="plan">Project Plan</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="issues" data-value="issues">Issues</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="rebaseline">Rebaseline History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <ProjectOverview project={project} />
          </TabsContent>

          <TabsContent value="phases" className="space-y-4">
            <PhaseView projectId={project.id} />
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
                  Table View
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
              <ProjectGanttChart projectId={project.id} onSwitchToIssueLog={handleSwitchToIssueLog} />
            ) : (
              <KanbanBoard projectId={project.id} />
            )}
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <ProjectResources projectId={project.id} />
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            <ProjectIssueLog 
              projectId={project.id} 
              taskFilter={issueTaskFilter}
              onClearTaskFilter={handleClearTaskFilter}
            />
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <ProjectTimeline projectId={project.id} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <ProjectReports projectId={project.id} />
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <ProjectDocumentation />
          </TabsContent>

          <TabsContent value="rebaseline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Rebaseline History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Rebaseline history will be displayed here.</p>
                  <p className="text-sm mt-2">Track changes to project baselines and milestones over time.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Calendar Modal */}
        <ProjectCalendarModal
          isOpen={isCalendarModalOpen}
          onClose={() => setIsCalendarModalOpen(false)}
          projectId={project.id}
          projectName={project.name}
        />
      </div>
    </Layout>
  );
};

export default ProjectManagement;
