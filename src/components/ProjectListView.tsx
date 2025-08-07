
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Eye, Edit, Trash2, Users, Calendar } from 'lucide-react';
import { ProjectData, determineProjectStatus } from '@/types/project';
import { calculateRealTimeProjectProgress } from '@/utils/phaseCalculations';
import { ListRowSkeleton } from '@/components/ui/list-row-skeleton';

interface ProjectListViewProps {
  projects: ProjectData[];
  onViewDetails: (project: ProjectData) => void;
  onManageProject: (project: ProjectData) => void;
  onDeleteProject: (project: ProjectData) => void;
  deletingProject: string | null;
  loading?: boolean;
}

const ProjectListView: React.FC<ProjectListViewProps> = ({
  projects,
  onViewDetails,
  onManageProject,
  onDeleteProject,
  deletingProject,
  loading = false
}) => {
  const [projectProgress, setProjectProgress] = useState<Record<string, number>>({});
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

  // Load progress for all projects
  useEffect(() => {
    const loadProjectProgress = async () => {
      const progressData: Record<string, number> = {};
      
      for (const project of projects) {
        try {
          const progress = await calculateRealTimeProjectProgress(project.id);
          progressData[project.id] = progress;
        } catch (error) {
          console.error(`Error calculating progress for project ${project.id}:`, error);
          progressData[project.id] = 0;
        }
      }
      
      setProjectProgress(progressData);
    };

    if (projects.length > 0) {
      loadProjectProgress();
    }
  }, [projects]);

  if (loading) {
    return <ListRowSkeleton count={5} showActions={true} />;
  }

  const calculateProjectStats = (project: ProjectData) => {
    const tasks = project.tasks || [];
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const totalTasks = tasks.length;
    
    // Use centralized progress calculation
    const actualProgress = projectProgress[project.id] ?? 0;
    const actualStatus = totalTasks === 0 ? project.status :
                        completedTasks === totalTasks ? 'Closure' as const :
                        completedTasks > 0 ? 'Execution' as const :
                        'Planning' as const;
    
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
    
    return {
      actualProgress,
      actualStatus,
      actualTeamSize
    };
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium">No Projects Found</h3>
        <p className="text-muted-foreground">No projects match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Timeline</TableHead>
            <TableHead>Health</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const stats = calculateProjectStats(project);
            return (
            <TableRow key={project.id} className="hover:bg-muted/50">
              <TableCell>
                <div>
                  <p className="font-medium line-clamp-1">{project.name}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {project.description}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                 <Badge variant={getStatusVariant(stats.actualStatus)}>
                   {stats.actualStatus}
                 </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getPriorityColor(project.priority)}>
                  {project.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                   <Progress value={stats.actualProgress} className="h-2 w-16" />
                   <span className="text-xs text-muted-foreground">{stats.actualProgress}%</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{stats.actualTeamSize}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  <div>
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                  </div>
                  <div>
                    {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    project.health?.status === 'green' ? 'bg-green-500' :
                    project.health?.status === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm">{project.health?.score || 100}%</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(project)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onManageProject(project)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        disabled={deletingProject === project.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{project.name}"? This action can be undone from the recycle bin.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDeleteProject(project)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Project
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectListView;
