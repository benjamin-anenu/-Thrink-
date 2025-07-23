
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
    { id: 'Not Started', title: 'To Do', color: 'bg-slate-100 border-slate-200' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-blue-50 border-blue-200' },
    { id: 'On Hold', title: 'Blocked', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'Completed', title: 'Done', color: 'bg-green-50 border-green-200' }
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      case 'Critical': return 'bg-red-200 text-red-900 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
          className={`mb-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
            snapshot.isDragging ? 'shadow-lg transform rotate-1' : ''
          } ${isOverdue(task.endDate) ? 'border-l-4 border-l-red-500 bg-red-50' : ''}`}
          onClick={() => onTaskClick?.(task)}
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Task Title */}
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-sm line-clamp-2 flex-1">{task.name}</h4>
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
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{column.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {columnTasks.length}
                  </Badge>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[500px] p-4 rounded-lg border-2 border-dashed transition-colors ${
                        snapshot.isDraggingOver 
                          ? 'border-primary bg-primary/5' 
                          : `${column.color} border-border`
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <TaskCard key={task.id} task={task} index={index} />
                      ))}
                      {provided.placeholder}
                      
                      {columnTasks.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          No tasks in {column.title.toLowerCase()}
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
