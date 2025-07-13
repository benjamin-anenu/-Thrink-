import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import TaskColumn from './TaskColumn';
import TaskCard, { Task } from './TaskCard';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Filter, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TaskBoardProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, newStatus: string) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onTaskUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');

  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'inProgress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'completed', title: 'Completed' },
  ];

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source, draggableId } = result;

      if (!destination) {
        return;
      }

      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      if (destination.droppableId !== source.droppableId) {
        onTaskUpdate(draggableId, destination.droppableId);
      }
    },
    [onTaskUpdate]
  );

  const filteredTasks = tasks.filter(task => {
    const searchMatch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const priorityMatch = selectedPriority === 'all' || task.tag.label === selectedPriority;
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
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 min-w-max">
            {columns.map(column => (
              <div key={column.id} className="w-80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">{column.title}</h3>
                  <StatusBadge variant="info">
                    {filteredTasks.filter(task => task.status === column.id).length}
                  </StatusBadge>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-96 p-3 rounded-lg border-2 border-dashed transition-colors ${
                        snapshot.isDraggingOver 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border bg-surface-muted'
                      }`}
                    >
                      <div className="space-y-3">
                        {filteredTasks
                          .filter(task => task.status === column.id)
                          .map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={snapshot.isDragging ? 'rotate-2 scale-105' : ''}
                                >
                                  <TaskCard
                                    task={task}
                                    onDragStart={() => {}}
                                    onDragEnd={() => {}}
                                    onStatusChange={onTaskUpdate}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default TaskBoard;
