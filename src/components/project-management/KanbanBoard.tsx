
import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, User, AlertTriangle, CheckCircle, Circle, Clock } from 'lucide-react';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { ProjectTask } from '@/types/project';
import { formatDate } from '@/lib/utils';

interface KanbanBoardProps {
  projectId: string;
  onTaskClick?: (task: ProjectTask) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId, onTaskClick }) => {
  const { tasks, loading, updateTask } = useTaskManagement(projectId);
  const [draggedTask, setDraggedTask] = useState<ProjectTask | null>(null);

  const columns = [
    { id: 'Not Started', title: 'To Do', color: 'bg-muted/30 border-border' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-blue-500/10 border-blue-500/20' },
    { id: 'On Hold', title: 'Blocked', color: 'bg-yellow-500/10 border-yellow-500/20' },
    { id: 'Completed', title: 'Done', color: 'bg-green-500/10 border-green-500/20' }
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'Low': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Critical': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const isOverdue = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const getProgressPercentage = (task: ProjectTask) => {
    // This would calculate based on subtasks once implemented
    return task.progress || 0;
  };

  const onDragEnd = useCallback(async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId) {
      return;
    }

    const taskId = draggableId;
    const newStatus = destination.droppableId;

    try {
      await updateTask(taskId, { status: newStatus as any });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  }, [updateTask]);

  const TaskCard = ({ task, index }: { task: ProjectTask; index: number }) => (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] bg-card border-border ${
            snapshot.isDragging ? 'shadow-xl transform rotate-1 scale-105 border-primary/50' : ''
          } ${isOverdue(task.endDate) ? 'border-l-4 border-l-destructive bg-destructive/5' : ''}`}
          onClick={() => onTaskClick?.(task)}
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Task Title */}
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-sm line-clamp-2 flex-1 text-card-foreground">{task.name}</h4>
                <Badge 
                  variant="outline" 
                  className={`ml-2 text-xs ${getPriorityColor(task.priority)}`}
                >
                  {task.priority}
                </Badge>
              </div>

              {/* Task Description */}
              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs font-medium">{getProgressPercentage(task)}%</span>
                </div>
                <Progress value={getProgressPercentage(task)} className="h-2" />
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className={`${isOverdue(task.endDate) ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                  {formatDate(task.endDate)}
                </span>
                {isOverdue(task.endDate) && (
                  <Badge variant="destructive" className="ml-1 text-xs">
                    Overdue
                  </Badge>
                )}
              </div>

              {/* Assigned Resources */}
              {task.assignedResources && task.assignedResources.length > 0 && (
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <div className="flex -space-x-1">
                    {task.assignedResources.slice(0, 3).map((resourceId, index) => (
                      <Avatar key={resourceId} className="h-6 w-6 border-2 border-background">
                        <AvatarFallback className="text-xs">
                          {String.fromCharCode(65 + index)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {task.assignedResources.length > 3 && (
                      <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                        <span className="text-xs font-medium">+{task.assignedResources.length - 3}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Task Status Indicators */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {task.status === 'Completed' && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {task.status === 'In Progress' && (
                    <Circle className="h-4 w-4 text-blue-600" />
                  )}
                  {task.status === 'On Hold' && (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  )}
                  {task.status === 'Not Started' && (
                    <Circle className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                
                {/* Issue Count - placeholder for future implementation */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3 w-3" />
                  <span>0</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Kanban Board</h2>
        <p className="text-muted-foreground">
          Drag and drop tasks between columns to update their status
        </p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map(column => {
            const columnTasks = getTasksByStatus(column.id);
            
            return (
              <div key={column.id} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="font-semibold text-sm text-foreground">{column.title}</h3>
                  <Badge variant="secondary" className="text-xs bg-muted/50">
                    {columnTasks.length}
                  </Badge>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[500px] p-4 rounded-lg border border-dashed transition-all duration-200 ${
                        snapshot.isDraggingOver 
                          ? 'border-primary bg-primary/10 scale-[1.02]' 
                          : `${column.color}`
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <TaskCard key={task.id} task={task} index={index} />
                      ))}
                      {provided.placeholder}
                      
                      {columnTasks.length === 0 && (
                        <div className="text-center py-12 border border-dashed border-border/30 rounded-lg bg-muted/20">
                          <p className="text-muted-foreground text-sm">No tasks in {column.title.toLowerCase()}</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
