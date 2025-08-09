import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, User, AlertTriangle } from 'lucide-react';
import { ProjectTask } from '@/types/project';
import { formatDate } from '@/lib/utils';

interface MobileTaskListProps {
  tasks: ProjectTask[];
  onTaskClick?: (task: ProjectTask) => void;
}

export const MobileTaskList: React.FC<MobileTaskListProps> = ({ tasks, onTaskClick }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'Medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'Low': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Critical': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'In Progress': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'On Hold': return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
      case 'Not Started': return 'bg-muted/10 text-muted-foreground border-muted/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const isOverdue = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card 
          key={task.id} 
          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
            isOverdue(task.endDate) ? 'border-l-4 border-l-destructive bg-destructive/5' : ''
          }`}
          onClick={() => onTaskClick?.(task)}
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Header with name and priority */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-sm line-clamp-2 flex-1">{task.name}</h3>
                <Badge 
                  variant="outline" 
                  className={`text-xs flex-shrink-0 ${getPriorityColor(task.priority)}`}
                >
                  {task.priority}
                </Badge>
              </div>

              {/* Status and Progress */}
              <div className="flex items-center justify-between gap-4">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStatusColor(task.status)}`}
                >
                  {task.status}
                </Badge>
                <div className="flex items-center gap-2 flex-1">
                  <Progress value={task.progress || 0} className="h-2 flex-1" />
                  <span className="text-xs text-muted-foreground">{task.progress || 0}%</span>
                </div>
              </div>

              {/* Date and assignees */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className={isOverdue(task.endDate) ? 'text-destructive font-medium' : ''}>
                    {formatDate(task.endDate)}
                  </span>
                  {isOverdue(task.endDate) && (
                    <Badge variant="destructive" className="ml-1 text-xs">
                      Overdue
                    </Badge>
                  )}
                </div>
                
                {task.assignedResources && task.assignedResources.length > 0 && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{task.assignedResources.length}</span>
                  </div>
                )}
              </div>

              {/* Description if available */}
              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                  {task.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {tasks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No tasks found</p>
        </div>
      )}
    </div>
  );
};