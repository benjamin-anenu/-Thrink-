import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, AlertCircle } from 'lucide-react';

import { Task } from '@/contexts/TaskContext';

interface TaskBoardCardProps {
  task: Task;
  index: number;
}

export const TaskBoardCard: React.FC<TaskBoardCardProps> = ({ task, index }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'default';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-2 cursor-move transition-shadow ${
            snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-md'
          }`}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Badge variant={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              {task.status === 'On Hold' && (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <h4 className="font-medium text-sm mb-2">{task.name}</h4>
            
            {task.description && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {task.assignee && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{task.assignee}</span>
                </div>
              )}
              
              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
};