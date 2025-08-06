

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
import TaskDetailModal from '@/components/TaskDetailModal';
import ProjectManagementMobile from '@/components/project-management/ProjectManagementMobile';
import { useTasks } from '@/hooks/useTasks';
import { useResources } from '@/hooks/useResources';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { ProjectTask } from '@/types/project';
import { AppInitializationLoader } from '@/components/AppInitializationLoader';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useMobileComplexity } from '@/hooks/useMobileComplexity';

const ProjectManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects, loading } = useProject();
  const { isFullyLoaded } = useAppInitialization();
  const [viewMode, setViewMode] = useState<'gantt' | 'kanban'>('gantt');
  const [issueTaskFilter, setIssueTaskFilter] = useState<string | undefined>(undefined);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const { events, createEvent } = useCalendarEvents();
  
  // Fetch tasks and resources for the project
  const { tasks } = useTasks(id || '');
  const { resources } = useResources();
  const { updateTask } = useTaskManagement(id || '');
  const { isMobile } = useMobileComplexity();

  return (
    <AppInitializationLoader>
      <ProjectManagementContent 
        id={id}
        projects={projects}
        loading={loading}
        isFullyLoaded={isFullyLoaded}
        viewMode={viewMode}
        setViewMode={setViewMode}
        issueTaskFilter={issueTaskFilter}
        setIssueTaskFilter={setIssueTaskFilter}
        isCalendarModalOpen={isCalendarModalOpen}
        setIsCalendarModalOpen={setIsCalendarModalOpen}
        selectedTask={selectedTask}
        setSelectedTask={setSelectedTask}
        isTaskModalOpen={isTaskModalOpen}
        setIsTaskModalOpen={setIsTaskModalOpen}
        events={events}
        createEvent={createEvent}
        tasks={tasks}
        resources={resources}
        updateTask={updateTask}
        isMobile={isMobile}
      />
    </AppInitializationLoader>
  );
};

const ProjectManagementContent: React.FC<{
  id: string | undefined;
  projects: any[];
  loading: boolean;
  isFullyLoaded: boolean;
  viewMode: 'gantt' | 'kanban';
  setViewMode: (mode: 'gantt' | 'kanban') => void;
  issueTaskFilter: string | undefined;
  setIssueTaskFilter: (filter: string | undefined) => void;
  isCalendarModalOpen: boolean;
  setIsCalendarModalOpen: (open: boolean) => void;
  selectedTask: ProjectTask | null;
  setSelectedTask: (task: ProjectTask | null) => void;
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (open: boolean) => void;
  events: any[];
  createEvent: any;
  tasks: any[];
  resources: any[];
  updateTask: any;
  isMobile: boolean;
}> = ({ 
  id, projects, loading, isFullyLoaded, viewMode, setViewMode, 
  issueTaskFilter, setIssueTaskFilter, isCalendarModalOpen, setIsCalendarModalOpen,
  selectedTask, setSelectedTask, isTaskModalOpen, setIsTaskModalOpen,
  events, createEvent, tasks, resources, updateTask, isMobile 
}) => {
  
  const project = projects.find(p => p.id === id);
  
  console.log('[ProjectManagement] Debug info:', {
    projectId: id,
    projectsCount: projects.length,
    projectIds: projects.map(p => p.id),
    foundProject: !!project,
    loading,
    isFullyLoaded
  });

  // Show project-specific loading if app is loaded but project is still being resolved
  if (isFullyLoaded && loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading project details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show not found only if fully loaded, not loading, and project doesn't exist after checking all projects
  if (isFullyLoaded && !loading && projects.length > 0 && !project) {
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

  // If not fully loaded or no project yet, don't render anything (AppInitializationLoader will handle loading)
  if (!isFullyLoaded || !project) {
    return null;
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

  // Calculate project statistics from real data
  const projectTasks = tasks || [];
  const totalTasks = projectTasks.length;
  
  // Get assigned resources for this project
  const assignedResourceIds = new Set();
  projectTasks.forEach(task => {
    if (task.assigned_resources) {
      task.assigned_resources.forEach(resourceId => assignedResourceIds.add(resourceId));
    }
  });
  const teamSize = assignedResourceIds.size;

  // Format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Project Header */}
        <div className="border-b pb-4 md:pb-6">
          {isMobile ? (
            <ProjectManagementMobile
              project={project}
              teamSize={teamSize}
              totalTasks={totalTasks}
              formatDate={formatDate}
              onCalendarClick={() => setIsCalendarModalOpen(true)}
              onSettingsClick={() => {}}
            />
          ) : (
            <>
              {/* Desktop header layout */}
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold">{project.name}</h1>
                  <p className="text-muted-foreground mt-1 text-sm md:text-base">{project.description}</p>
                </div>
                
                {/* Desktop badge and actions */}
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

              {/* Project Quick Stats - Desktop grid */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6 p-6">
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="ml-2 min-w-0">
                        <p className="text-sm font-medium truncate">Start Date</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {(() => {
                            const displayDate = project.computed_start_date || project.startDate;
                            return formatDate(displayDate);
                          })()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 p-6">
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="ml-2 min-w-0">
                        <p className="text-sm font-medium truncate">End Date</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {(() => {
                            const displayDate = project.computed_end_date || project.endDate;
                            return formatDate(displayDate);
                          })()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 p-6">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="ml-2 min-w-0">
                        <p className="text-sm font-medium truncate">Team Size</p>
                        <p className="text-xs text-muted-foreground truncate">{teamSize} members</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 p-6">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="ml-2 min-w-0">
                        <p className="text-sm font-medium truncate">Tasks</p>
                        <p className="text-xs text-muted-foreground truncate">{totalTasks} tasks</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>

        {/* Task Statistics */}
        <TaskStatistics />

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          {/* Mobile-optimized horizontally scrollable tabs */}
          <div className="relative">
            <TabsList className="hidden md:grid w-full grid-cols-9">
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
            
            {/* Mobile scrollable tabs */}
            <div className="md:hidden overflow-x-auto">
              <TabsList className="flex w-max min-w-full no-scrollbar p-1">
                <TabsTrigger value="overview" className="flex-shrink-0 h-11 px-3 text-xs whitespace-nowrap">Overview</TabsTrigger>
                <TabsTrigger value="phases" className="flex-shrink-0 h-11 px-3 text-xs whitespace-nowrap">Phases</TabsTrigger>
                <TabsTrigger value="plan" className="flex-shrink-0 h-11 px-3 text-xs whitespace-nowrap">Plan</TabsTrigger>
                <TabsTrigger value="resources" className="flex-shrink-0 h-11 px-3 text-xs whitespace-nowrap">Resources</TabsTrigger>
                <TabsTrigger value="issues" data-value="issues" className="flex-shrink-0 h-11 px-3 text-xs whitespace-nowrap">Issues</TabsTrigger>
                <TabsTrigger value="timeline" className="flex-shrink-0 h-11 px-3 text-xs whitespace-nowrap">Timeline</TabsTrigger>
                <TabsTrigger value="reports" className="flex-shrink-0 h-11 px-3 text-xs whitespace-nowrap">Reports</TabsTrigger>
                <TabsTrigger value="documents" className="flex-shrink-0 h-11 px-3 text-xs whitespace-nowrap">Docs</TabsTrigger>
                <TabsTrigger value="rebaseline" className="flex-shrink-0 h-11 px-3 text-xs whitespace-nowrap">History</TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <ProjectOverview project={project} />
          </TabsContent>

          <TabsContent value="phases" className="space-y-4">
            <PhaseView projectId={project.id} />
          </TabsContent>

          <TabsContent value="plan" className="space-y-4">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <h2 className="text-xl md:text-2xl font-semibold">Project Plan</h2>
              
              {/* Mobile-optimized view toggle buttons */}
              <div className="flex flex-col gap-2 md:flex-row md:gap-2">
                <Button
                  variant={viewMode === 'gantt' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('gantt')}
                  className="w-full md:w-auto h-11 md:h-9"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Table View
                </Button>
                <Button
                  variant={viewMode === 'kanban' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('kanban')}
                  className="w-full md:w-auto h-11 md:h-9"
                >
                  <Kanban className="h-4 w-4 mr-2" />
                  Kanban Board
                </Button>
              </div>
            </div>

            {viewMode === 'gantt' ? (
              <ProjectGanttChart projectId={project.id} onSwitchToIssueLog={handleSwitchToIssueLog} />
            ) : (
              <KanbanBoard 
                projectId={project.id} 
                onTaskClick={(task) => {
                  setSelectedTask(task);
                  setIsTaskModalOpen(true);
                }}
              />
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

        {/* Task Detail Modal */}
        <TaskDetailModal
          task={selectedTask}
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
          onUpdate={updateTask}
        />
      </div>
    </Layout>
  );
};

export default ProjectManagement;

