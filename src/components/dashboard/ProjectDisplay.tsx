
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Calendar, Users, 
  CheckCircle, AlertTriangle, 
  Eye, Edit, Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ProjectData, determineProjectStatus, ProjectStatusType } from '@/types/project';
import { useProjectStatus } from '@/hooks/useProjectStatus';
import { calculateRealTimeProjectProgress, getProjectPhaseDetails } from '@/utils/phaseCalculations';
import { ProjectCardSkeleton } from '@/components/ui/project-card-skeleton';
import { ProjectDateService } from '@/services/ProjectDateService';
import { ProjectHealthService } from '@/services/ProjectHealthService';

interface Task {
  id: string;
  name: string;
  status: string;
  priority: string;
  assigneeId?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface ProjectDisplayProps {
  projects: ProjectData[];
  onViewDetails: (project: ProjectData) => void;
  onManageProject: (project: ProjectData) => void;
  onDeleteProject: (project: ProjectData) => void;
  deletingProject: string | null;
  loading?: boolean;
}

  const ProjectDisplay: React.FC<ProjectDisplayProps> = ({
    projects,
    onViewDetails,
    onManageProject,
    onDeleteProject,
    deletingProject,
    loading = false
  }) => {
    // Debug logging to see what data we're receiving
    useEffect(() => {
      console.log('[ProjectDisplay] Received projects:', projects.map(p => ({
        name: p.name,
        startDate: p.startDate,
        endDate: p.endDate,
        computed_start_date: p.computed_start_date,
        computed_end_date: p.computed_end_date
      })));
    }, [projects]);
  const [projectTasks, setProjectTasks] = useState<Record<string, Task[]>>({});
  const [projectProgress, setProjectProgress] = useState<Record<string, number>>({});
  const [projectHealth, setProjectHealth] = useState<Record<string, { status: string; score: number }>>({});
  const [phaseDetails, setPhaseDetails] = useState<Record<string, any[]>>({});
  const [progressLoading, setProgressLoading] = useState(true);
  const { updateProjectStatus } = useProjectStatus();

  // Load project progress and phase details
  useEffect(() => {
    const loadProjectData = async () => {
      if (projects.length === 0) {
        setProgressLoading(false);
        return;
      }

      setProgressLoading(true);
      const progressData: Record<string, number> = {};
      const healthData: Record<string, { status: string; score: number }> = {};
      const phaseData: Record<string, any[]> = {};
      
      for (const project of projects) {
        try {
          // Calculate real-time progress and health in parallel
          const [progress, health, phases] = await Promise.all([
            calculateRealTimeProjectProgress(project.id),
            ProjectHealthService.calculateRealTimeProjectHealth(project.id),
            getProjectPhaseDetails(project.id)
          ]);
          
          progressData[project.id] = progress;
          healthData[project.id] = {
            status: health.healthStatus,
            score: health.healthScore
          };
          phaseData[project.id] = phases;
        } catch (error) {
          console.error(`Error loading data for project ${project.id}:`, error);
          progressData[project.id] = project.progress || 0;
          healthData[project.id] = {
            status: project.health?.status || 'yellow',
            score: project.health?.score || 50
          };
          phaseData[project.id] = [];
        }
      }
      
      setProjectProgress(progressData);
      setProjectHealth(healthData);
      setPhaseDetails(phaseData);
      
      // Minimum loading time for smooth UX
      setTimeout(() => setProgressLoading(false), 500);
    };

    loadProjectData();
  }, [projects]);

  const getStatusVariant = (status: string): 'destructive' | 'secondary' | 'outline' | 'default' => {
    switch (status) {
      case 'Completed': return 'default';
      case 'In Progress': return 'outline';
      case 'On Hold': return 'secondary';
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-muted-foreground';
    }
  };

  const calculateProjectStats = (project: ProjectData) => {
    const tasks = project.tasks || [];
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const totalTasks = tasks.length;
    const overdueTasks = tasks.filter(t => {
      if (!t.endDate || t.status === 'Completed') return false;
      return new Date(t.endDate) < new Date();
    }).length;

    // Calculate real-time status and progress
    const actualStatus = totalTasks === 0 ? project.status :
                        completedTasks === totalTasks ? 'Closure' as ProjectStatusType :
                        completedTasks > 0 ? 'Execution' as ProjectStatusType :
                        'Planning' as ProjectStatusType;

    // Always use real-time calculated progress for consistency
    const completionRate = projectProgress[project.id] !== undefined ? 
                          projectProgress[project.id] : 0;

    // Calculate team size from unique assigned resources
    const assignedResourceIds = new Set<string>();
    tasks.forEach(task => {
      if (task.assignedResources) {
        task.assignedResources.forEach(resourceId => {
          assignedResourceIds.add(resourceId);
        });
      }
    });
    const actualTeamSize = assignedResourceIds.size || project.teamSize || 0;

    // Update project status in database if it differs from stored status
    if (actualStatus !== project.status && (actualStatus as any) !== project.status) {
      updateProjectStatus(project.id, 'admin_override', { 
        oldStatus: project.status, 
        newStatus: actualStatus,
        reason: 'Task completion changed'
      }, actualStatus as ProjectStatusType);
    }

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      completionRate,
      actualStatus,
      actualTeamSize
    };
  };

  const renderPhaseTooltip = (projectId: string) => {
    const phases = phaseDetails[projectId] || [];
    
    if (phases.length === 0) {
      return (
        <div className="p-2">
          <p className="text-sm text-muted-foreground">No phases available</p>
        </div>
      );
    }
    
    return (
      <div className="p-3 max-w-sm">
        <h4 className="font-medium mb-2">Project Phases</h4>
        <div className="space-y-2">
          {phases.map((phase) => (
            <div key={phase.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  phase.status === 'completed' ? 'bg-green-500' :
                  phase.status === 'active' ? 'bg-blue-500' :
                  phase.status === 'on-hold' ? 'bg-yellow-500' : 'bg-gray-400'
                }`} />
                <span className="truncate max-w-32">{phase.name}</span>
              </div>
              <span className="font-medium">{phase.progress}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Show loading skeleton while data is being fetched
  if (loading || progressLoading) {
    return <ProjectCardSkeleton count={6} />;
  }

  // Don't show "No Projects Found" if still loading
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <Calendar className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No Projects Found</h3>
          <p>No projects match your current filters.</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {projects.map((project) => {
          const stats = calculateProjectStats(project);
          
          return (
            <Card key={project.id} className="hover:shadow-lg transition-shadow duration-200 animate-fade-in min-h-[120px]">
              <CardHeader className="p-4 md:p-6 pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-base md:text-lg line-clamp-1 pr-2">{project.name}</CardTitle>
                    <div className="flex flex-wrap items-center gap-1 md:gap-2">
                      <Badge variant={getStatusVariant(stats.actualStatus)} className="text-xs">
                        {stats.actualStatus}
                      </Badge>
                      <Badge variant="outline" className={`${getPriorityColor(project.priority)} text-xs`}>
                        {project.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mt-2">
                  {project.description}
                </p>
              </CardHeader>

              <CardContent className="p-4 md:p-6 pt-0 space-y-3 md:space-y-4">
                {/* Progress with Tooltip */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{stats.completionRate}%</span>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <Progress value={stats.completionRate} className="h-2 w-full" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="border">
                      {renderPhaseTooltip(project.id)}
                    </TooltipContent>
                  </Tooltip>
                </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                <div className="flex items-center gap-1 md:gap-2">
                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                  <span>{stats.completedTasks}/{stats.totalTasks} Tasks</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <Users className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
                  <span>{stats.actualTeamSize} Members</span>
                </div>
                {stats.overdueTasks > 0 && (
                  <div className="flex items-center gap-1 md:gap-2 col-span-2">
                    <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                    <span className="text-red-500">{stats.overdueTasks} Overdue</span>
                  </div>
                )}
              </div>

              {/* Timeline - Use centralized date service */}
              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-muted-foreground">
                <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                <span className="truncate">
                  {ProjectDateService.formatTimelineRange(project)}
                </span>
              </div>

              {/* Health Indicator - Real-time data */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 md:gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    (projectHealth[project.id]?.status || project.health?.status) === 'green' ? 'bg-green-500' :
                    (projectHealth[project.id]?.status || project.health?.status) === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="text-xs md:text-sm text-muted-foreground">
                    Health: {projectHealth[project.id]?.score || project.health?.score || 50}% ({
                      (projectHealth[project.id]?.status || project.health?.status) === 'green' ? 'On Track' :
                      (projectHealth[project.id]?.status || project.health?.status) === 'yellow' ? 'Caution' : 'At Risk'
                    })
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col md:flex-row gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(project)}
                  className="flex-1 min-h-[44px] md:min-h-[36px] text-xs md:text-sm"
                >
                  <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onManageProject(project)}
                  className="flex-1 min-h-[44px] md:min-h-[36px] text-xs md:text-sm"
                >
                  <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  Manage
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteProject(project)}
                  disabled={deletingProject === project.id}
                  className="md:flex-none min-h-[44px] md:min-h-[36px]"
                >
                  <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default ProjectDisplay;
