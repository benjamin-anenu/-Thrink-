import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, AlertCircle } from 'lucide-react';

interface DashboardTask {
  id: string;
  title: string;
  description: string;
  tag: {
    color: string;
    label: string;
  };
  dueDate: string;
  assignees: number;
  progress: {
    completed: number;
    total: number;
  };
  project: string;
  status: string;
}

interface DashboardTaskBoardProps {
  tasks: DashboardTask[];
  onTaskUpdate: (taskId: string, newStatus: string) => void;
}

export const DashboardTaskBoard: React.FC<DashboardTaskBoardProps> = ({ 
  tasks, 
  onTaskUpdate 
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'default';
      case 'in progress':
        return 'secondary';
      case 'blocked':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getCompletionPercentage = (progress: { completed: number; total: number }) => {
    if (progress.total === 0) return 0;
    return Math.round((progress.completed / progress.total) * 100);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recent Tasks</h3>
      
      <div className="grid gap-3">
        {tasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                <Badge 
                  variant={getStatusColor(task.status)}
                  style={{ backgroundColor: task.tag.color }}
                  className="text-white"
                >
                  {task.tag.label}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {task.description}
              </p>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{task.assignees} assignee{task.assignees !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    Progress: {getCompletionPercentage(task.progress)}%
                  </div>
                  <div className="text-xs font-medium">
                    {task.project}
                  </div>
                </div>
              </div>
              
              {task.status.toLowerCase() === 'blocked' && (
                <div className="flex items-center gap-1 mt-2 text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  <span className="text-xs">Task is blocked</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};