
import React, { useState, useCallback } from 'react';
import TaskCard, { Task } from './TaskCard';
import TaskAssignmentModal from './TaskAssignmentModal';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Filter, Plus, Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTasks } from '@/hooks/useTasks';

interface TaskBoardProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, newStatus: string) => void;
  projectId?: string;
}

interface TaskForAssignment {
  id: string;
  name: string;
  project_id: string;
  assignee_id?: string;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onTaskUpdate, projectId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [selectedTaskForAssignment, setSelectedTaskForAssignment] = useState<TaskForAssignment | null>(null);

  const { assignResourceToTask } = useTasks(projectId);

  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'inProgress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'completed', title: 'Completed' },
  ];

  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', task.id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTask(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== columnId) {
      onTaskUpdate(draggedTask.id, columnId);
    }
    setDraggedTask(null);
  }, [draggedTask, onTaskUpdate]);

  const handleAssignResource = async (taskId: string, resourceId: string) => {
    return await assignResourceToTask(taskId, resourceId);
  };

  const filteredTasks = tasks.filter(task => {
    const searchMatch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const priorityMatch = selectedPriority === 'all' || task.tag?.label === selectedPriority;
    const projectMatch = selectedProject === 'all' || task.project === selectedProject;

    return searchMatch && priorityMatch && projectMatch;
  });

  const priorities = ['all', 'High', 'Medium', 'Low'];
  const projects = ['all', ...Array.from(new Set(tasks.map(task => task.project).filter(Boolean)))];

  const getPriorityVariant = (priority: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Filters */}
      <div className="p-4 bg-surface border-b border-border">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Priority:</span>
            <div className="flex gap-1">
              {priorities.map(priority => (
                <Button
                  key={priority}
                  variant={selectedPriority === priority ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPriority(priority)}
                  className="capitalize"
                >
                  {priority === 'all' ? 'All' : (
                    <StatusBadge variant={getPriorityVariant(priority)}>
                      {priority}
                    </StatusBadge>
                  )}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Project:</span>
            <div className="flex gap-1">
              {projects.slice(0, 4).map(project => (
                <Button
                  key={project}
                  variant={selectedProject === project ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedProject(project)}
                  className="capitalize"
                >
                  {project === 'all' ? 'All' : project}
                </Button>
              ))}
            </div>
          </div>

          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-6 min-w-max">
          {columns.map(column => (
            <div key={column.id} className="w-80">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">{column.title}</h3>
                <StatusBadge variant="info">
                  {filteredTasks.filter(task => task.status === column.id).length}
                </StatusBadge>
              </div>
              
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
                className={`min-h-96 p-3 rounded-lg border-2 border-dashed transition-colors ${
                  draggedTask && draggedTask.status !== column.id
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-surface-muted'
                }`}
              >
                <div className="space-y-3">
                  {filteredTasks
                    .filter(task => task.status === column.id)
                    .map((task) => (
                      <div key={task.id} className="relative group">
                        <TaskCard
                          task={task}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          onStatusChange={onTaskUpdate}
                        />
                        {!task.assignees && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setSelectedTaskForAssignment({
                              id: task.id,
                              name: task.title || 'Untitled Task',
                              project_id: projectId || '',
                              assignee_id: undefined
                            })}
                          >
                            <Users className="h-3 w-3 mr-1" />
                            Assign
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Assignment Modal */}
      {selectedTaskForAssignment && (
        <TaskAssignmentModal
          isOpen={!!selectedTaskForAssignment}
          onClose={() => setSelectedTaskForAssignment(null)}
          task={selectedTaskForAssignment}
          onAssignResource={handleAssignResource}
        />
      )}
    </div>
  );
};

export default TaskBoard;
