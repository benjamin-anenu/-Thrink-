
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
}

const ProjectDisplay: React.FC<ProjectDisplayProps> = ({
  projects,
  onViewDetails,
  onManageProject,
  onDeleteProject,
  deletingProject
}) => {
  const [projectTasks, setProjectTasks] = useState<Record<string, Task[]>>({});
  const [projectProgress, setProjectProgress] = useState<Record<string, number>>({});
  const [phaseDetails, setPhaseDetails] = useState<Record<string, any[]>>({});
  const { updateProjectStatus } = useProjectStatus();

  // Load project progress and phase details
  useEffect(() => {
    const loadProjectData = async () => {
      const progressData: Record<string, number> = {};
      const phaseData: Record<string, any[]> = {};
      
      for (const project of projects) {
        try {
          // Calculate real-time progress
          const progress = await calculateRealTimeProjectProgress(project.id);
          progressData[project.id] = progress;
          
          // Get phase details for tooltip
          const phases = await getProjectPhaseDetails(project.id);
          phaseData[project.id] = phases;
        } catch (error) {
          console.error(`Error loading data for project ${project.id}:`, error);
          progressData[project.id] = project.progress || 0;
          phaseData[project.id] = [];
        }
      }
      
      setProjectProgress(progressData);
      setPhaseDetails(phaseData);
    };

    if (projects.length > 0) {
      loadProjectData();
    }
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const stats = calculateProjectStats(project);
          
          return (
            <Card key={project.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(stats.actualStatus)}>
                        {stats.actualStatus}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress with Tooltip */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{stats.completionRate}%</span>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <Progress value={stats.completionRate} className="h-2" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="border">
                      {renderPhaseTooltip(project.id)}
                    </TooltipContent>
                  </Tooltip>
                </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{stats.completedTasks}/{stats.totalTasks} Tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>{stats.actualTeamSize} Members</span>
                </div>
                {stats.overdueTasks > 0 && (
                  <div className="flex items-center gap-2 col-span-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-red-500">{stats.overdueTasks} Overdue</span>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'} - 
                  {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
                </span>
              </div>

              {/* Health Indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    project.health?.status === 'green' ? 'bg-green-500' :
                    project.health?.status === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm text-muted-foreground">
                    Health: {project.health?.score || 100}%
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(project)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onManageProject(project)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Manage
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteProject(project)}
                  disabled={deletingProject === project.id}
                >
                  <Trash2 className="h-4 w-4" />
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
