
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Calendar, Users, TrendingUp, AlertTriangle, 
  CheckCircle, Clock, Eye, Edit
} from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import ProjectDetailsModal from '@/components/ProjectDetailsModal';
import { supabase } from '@/integrations/supabase/client';

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

const ProjectDisplay = () => {
  const { projects } = useProject();
  const { currentWorkspace } = useWorkspace();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projectTasks, setProjectTasks] = useState<Record<string, Task[]>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter projects by current workspace
  const workspaceProjects = projects.filter(project => 
    !currentWorkspace || project.workspaceId === currentWorkspace.id
  );

  // Load tasks for all projects
  useEffect(() => {
    const loadProjectTasks = async () => {
      if (!currentWorkspace || workspaceProjects.length === 0) return;

      try {
        const { data: tasks, error } = await supabase
          .from('project_tasks')
          .select('*')
          .in('project_id', workspaceProjects.map(p => p.id));

        if (error) throw error;

        // Group tasks by project ID
        const tasksByProject: Record<string, Task[]> = {};
        tasks?.forEach(task => {
          if (!tasksByProject[task.project_id]) {
            tasksByProject[task.project_id] = [];
          }
          tasksByProject[task.project_id].push({
            id: task.id,
            name: task.name,
            status: task.status || 'Pending',
            priority: task.priority || 'Medium',
            assigneeId: task.assignee_id,
            startDate: task.start_date,
            endDate: task.end_date,
            description: task.description
          });
        });

        setProjectTasks(tasksByProject);
      } catch (error) {
        console.error('Error loading project tasks:', error);
      }
    };

    loadProjectTasks();
  }, [currentWorkspace, workspaceProjects.length]);

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

  const calculateProjectStats = (project: any) => {
    const tasks = projectTasks[project.id] || [];
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const totalTasks = tasks.length;
    const overdueTasks = tasks.filter(t => {
      if (!t.endDate || t.status === 'Completed') return false;
      return new Date(t.endDate) < new Date();
    }).length;

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  const handleViewDetails = (project: any) => {
    const tasks = projectTasks[project.id] || [];
    setSelectedProject({ ...project, tasks });
    setIsModalOpen(true);
  };

  if (workspaceProjects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <Calendar className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No Projects Found</h3>
          <p>Create your first project to get started with project management.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaceProjects.map((project) => {
          const stats = calculateProjectStats(project);
          
          return (
            <Card key={project.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(project.status)}>
                        {project.status}
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
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{stats.completionRate}%</span>
                  </div>
                  <Progress value={stats.completionRate} className="h-2" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>{stats.completedTasks}/{stats.totalTasks} Tasks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-info" />
                    <span>{project.teamSize || 0} Members</span>
                  </div>
                  {stats.overdueTasks > 0 && (
                    <div className="flex items-center gap-2 col-span-2">
                      <AlertTriangle className="h-4 w-4 text-error" />
                      <span className="text-error">{stats.overdueTasks} Overdue</span>
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
                      project.health?.status === 'green' ? 'bg-success' :
                      project.health?.status === 'yellow' ? 'bg-warning' : 'bg-error'
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
                    onClick={() => handleViewDetails(project)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/project-management/${project.id}`}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProject(null);
          }}
        />
      )}
    </>
  );
};

export default ProjectDisplay;
