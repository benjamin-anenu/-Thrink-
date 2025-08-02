
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  Target, 
  TrendingUp, 
  Clock,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  Plus
} from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { useTasks } from '@/hooks/useTasks';
import { useProjectPhases } from '@/hooks/useProjectPhases';
import { useEnhancedMilestones } from '@/hooks/useEnhancedMilestones';
import { useProjectResources } from '@/hooks/useProjectResources';
import ProjectOverview from '@/components/project-management/ProjectOverview';
import ProjectTimeline from '@/components/project-management/ProjectTimeline';
import ProjectResources from '@/components/project-management/ProjectResources';
import ProjectReports from '@/components/project-management/ProjectReports';
import ProjectDocumentation from '@/components/project-management/ProjectDocumentation';
import { PhaseView } from '@/components/project-management/phases/PhaseView';
import TaskManagement from '@/components/project-management/TaskManagement';
import { LoadingState } from '@/components/ui/loading-state';

const ProjectManagement = () => {
  const { projectId } = useParams();
  const { getProject } = useProject();
  const [activeTab, setActiveTab] = useState('overview');
  
  const project = getProject(projectId || '');
  const { tasks: projectTasks, loading: tasksLoading } = useTasks(projectId);
  const { phases, loading: phasesLoading, projectDateRange } = useProjectPhases(projectId || '');
  const { milestones, loading: milestonesLoading } = useEnhancedMilestones(projectId);
  const { resources, loading: resourcesLoading } = useProjectResources(projectId || '');

  if (!project) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The requested project could not be found.</p>
          <Button onClick={() => window.history.back()}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (tasksLoading || phasesLoading || milestonesLoading || resourcesLoading) {
    return <LoadingState>Loading project data...</LoadingState>;
  }

  // Calculate project metrics
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter(task => task.status === 'Completed').length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get team size from actual resource assignments
  const teamSize = resources.length;

  // Calculate project health
  const overdueTasks = projectTasks.filter(task => {
    if (task.status === 'Completed' || !task.end_date) return false;
    return new Date(task.end_date) < new Date();
  }).length;
  
  const healthScore = Math.max(0, 100 - (overdueTasks * 10));
  const healthStatus = healthScore >= 80 ? 'green' : healthScore >= 60 ? 'yellow' : 'red';

  // Use phase-based dates for project header, fallback to project dates
  const displayStartDate = projectDateRange.startDate || project.startDate;
  const displayEndDate = projectDateRange.endDate || project.endDate;

  return (
    <div className="p-6 space-y-6">
      {/* Project Header with Phase-based Dates */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.history.back()}
                className="p-1 h-auto"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <Badge variant={project.status === 'Completed' ? 'default' : 'secondary'}>
                {project.status}
              </Badge>
            </div>
            <p className="text-gray-600 mb-4">{project.description}</p>
          </div>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              Project Timeline
            </div>
            <div className="text-sm">
              <div>Start: {displayStartDate ? new Date(displayStartDate).toLocaleDateString() : 'Not set'}</div>
              <div>End: {displayEndDate ? new Date(displayEndDate).toLocaleDateString() : 'Not set'}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Target className="h-4 w-4" />
              Progress
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{completedTasks}/{totalTasks} Tasks</span>
                <span>{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              Team
            </div>
            <div className="text-lg font-semibold">{teamSize} Members</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4" />
              Health Score
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                healthStatus === 'green' ? 'bg-green-500' : 
                healthStatus === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-lg font-semibold">{healthScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="phases" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Phases
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ProjectOverview 
            projectId={projectId || ''} 
            tasks={projectTasks}
            milestones={milestones}
            phases={phases}
          />
        </TabsContent>

        <TabsContent value="tasks">
          <TaskManagement projectId={projectId || ''} />
        </TabsContent>

        <TabsContent value="phases">
          <PhaseView projectId={projectId || ''} />
        </TabsContent>

        <TabsContent value="timeline">
          <ProjectTimeline projectId={projectId || ''} />
        </TabsContent>

        <TabsContent value="resources">
          <ProjectResources projectId={projectId || ''} />
        </TabsContent>

        <TabsContent value="documents">
          <ProjectDocumentation projectId={projectId || ''} />
        </TabsContent>

        <TabsContent value="reports">
          <ProjectReports projectId={projectId || ''} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectManagement;
