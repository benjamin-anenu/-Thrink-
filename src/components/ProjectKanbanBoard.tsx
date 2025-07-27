import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Filter, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface ProjectKanbanBoardProps {
  projectId?: string;
}

const ProjectKanbanBoard: React.FC<ProjectKanbanBoardProps> = ({ projectId }) => {
  const { projects } = useProject();
  const { currentWorkspace } = useWorkspace();
  const [filterType, setFilterType] = useState<'all' | 'today' | 'overdue' | 'date_range'>('all');
  const [selectedProject, setSelectedProject] = useState<string>(projectId || 'all');
  
  // Get all tasks across projects or specific project
  const allTasks = useMemo(() => {
    if (selectedProject === 'all') {
      return projects
        .filter(p => !currentWorkspace || p.workspaceId === currentWorkspace.id)
        .flatMap(project => 
          project.tasks.map(task => ({
            ...task,
            projectName: project.name,
            projectId: project.id
          }))
        );
    } else {
      const project = projects.find(p => p.id === selectedProject);
      return project ? project.tasks.map(task => ({
        ...task,
        projectName: project.name,
        projectId: project.id
      })) : [];
    }
  }, [projects, selectedProject, currentWorkspace]);

  // Filter tasks based on filter type
  const filteredTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (filterType) {
      case 'today':
        return allTasks.filter(task => {
          const taskDate = new Date(task.endDate);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === today.getTime();
        });
      
      case 'overdue':
        return allTasks.filter(task => {
          const taskDate = new Date(task.endDate);
          return taskDate < today && task.status !== 'Completed';
        });
      
      default:
        return allTasks;
    }
  }, [allTasks, filterType]);

  // Group tasks by status for Kanban columns
  const taskColumns = useMemo(() => {
    const columns = {
      'To Do': filteredTasks.filter(task => task.status === 'Not Started'),
      'In Progress': filteredTasks.filter(task => task.status === 'In Progress'),
      'Blocked/On Hold': filteredTasks.filter(task => task.status === 'On Hold'),
      'Completed': filteredTasks.filter(task => task.status === 'Completed')
    };
    
    return columns;
  }, [filteredTasks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not Started':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Completed':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'text-red-600';
      case 'High':
        return 'text-orange-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (task: any) => {
    const taskDate = new Date(task.endDate);
    const today = new Date();
    return taskDate < today && task.status !== 'Completed';
  };

  const TaskCard: React.FC<{ task: any }> = ({ task }) => (
    <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-sm leading-tight line-clamp-2">{task.name}</h4>
          {isOverdue(task) && (
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 ml-2" />
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {task.description || 'No description'}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              <span className={isOverdue(task) ? 'text-red-600 font-medium' : ''}>
                {formatDate(task.endDate)}
              </span>
            </div>
            <Badge variant="outline" className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {task.projectName}
            </span>
            <div className="flex items-center gap-1">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all" 
                  style={{ width: `${task.progress || 0}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground ml-1">
                {task.progress || 0}%
              </span>
            </div>
          </div>
          
          {task.assignedResources && task.assignedResources.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {task.assignedResources.length} assigned
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const workspaceProjects = projects.filter(p => 
    !currentWorkspace || p.workspaceId === currentWorkspace.id
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {workspaceProjects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterType} onValueChange={setFilterType as (value: string) => void}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter tasks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="today">Due Today</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Total: {filteredTasks.length} tasks</span>
          {filterType === 'overdue' && (
            <Badge variant="destructive" className="ml-2">
              {filteredTasks.length} overdue
            </Badge>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(taskColumns).map(([columnName, tasks]) => (
          <div key={columnName} className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-sm font-medium">{columnName}</span>
                  <Badge variant="secondary" className={getStatusColor(columnName)}>
                    {tasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {tasks.length > 0 ? (
                    tasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <p className="text-sm">No tasks in {columnName.toLowerCase()}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      {filteredTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Task Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-600">
                  {taskColumns['To Do'].length}
                </div>
                <div className="text-muted-foreground">To Do</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {taskColumns['In Progress'].length}
                </div>
                <div className="text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {taskColumns['Blocked/On Hold'].length}
                </div>
                <div className="text-muted-foreground">Blocked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {taskColumns['Completed'].length}
                </div>
                <div className="text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectKanbanBoard;