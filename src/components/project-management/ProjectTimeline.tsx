
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle2, AlertCircle, Circle } from 'lucide-react';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { format } from 'date-fns';

interface ProjectTimelineProps {
  projectId: string;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ projectId }) => {
  const { tasks, milestones, loading } = useTaskManagement(projectId);
  const [timelineItems, setTimelineItems] = useState<any[]>([]);

  useEffect(() => {
    // Combine tasks and milestones into a single timeline
    const items = [
      ...tasks.map(task => ({
        id: task.id,
        type: 'task',
        name: task.name,
        date: task.startDate,
        endDate: task.endDate,
        status: task.status,
        priority: task.priority,
        progress: task.progress,
        assignedResources: task.assignedResources
      })),
      ...milestones.map(milestone => ({
        id: milestone.id,
        type: 'milestone',
        name: milestone.name,
        date: milestone.date,
        status: milestone.status,
        progress: milestone.progress
      }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setTimelineItems(items);
  }, [tasks, milestones]);

  const getStatusIcon = (status: string, type: string) => {
    if (type === 'milestone') {
      switch (status) {
        case 'completed':
          return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        case 'overdue':
          return <AlertCircle className="h-5 w-5 text-red-500" />;
        default:
          return <Circle className="h-5 w-5 text-blue-500" />;
      }
    } else {
      switch (status) {
        case 'Completed':
          return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        case 'In Progress':
          return <Clock className="h-5 w-5 text-yellow-500" />;
        case 'On Hold':
          return <AlertCircle className="h-5 w-5 text-orange-500" />;
        case 'Cancelled':
          return <AlertCircle className="h-5 w-5 text-red-500" />;
        default:
          return <Circle className="h-5 w-5 text-gray-500" />;
      }
    }
  };

  const getStatusColor = (status: string, type: string) => {
    if (type === 'milestone') {
      switch (status) {
        case 'completed':
          return 'bg-green-100 text-green-800';
        case 'overdue':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-blue-100 text-blue-800';
      }
    } else {
      switch (status) {
        case 'Completed':
          return 'bg-green-100 text-green-800';
        case 'In Progress':
          return 'bg-yellow-100 text-yellow-800';
        case 'On Hold':
          return 'bg-orange-100 text-orange-800';
        case 'Cancelled':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Project Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading timeline...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Project Timeline
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Tasks and milestones ordered chronologically
        </p>
      </CardHeader>
      <CardContent>
        {timelineItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tasks or milestones found for this project
          </div>
        ) : (
          <div className="space-y-4">
            {timelineItems.map((item, index) => (
              <div key={`${item.type}-${item.id}`} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  {getStatusIcon(item.status, item.type)}
                  {index < timelineItems.length - 1 && (
                    <div className="w-px h-8 bg-border mt-2" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{item.name}</h4>
                    <Badge 
                      variant="secondary"
                      className={item.type === 'milestone' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}
                    >
                      {item.type === 'milestone' ? 'Milestone' : 'Task'}
                    </Badge>
                    <Badge variant="secondary" className={getStatusColor(item.status, item.type)}>
                      {item.status}
                    </Badge>
                    {item.priority && (
                      <Badge variant="secondary" className={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(item.date), 'MMM dd, yyyy')}
                      {item.endDate && item.type === 'task' && (
                        <span> → {format(new Date(item.endDate), 'MMM dd, yyyy')}</span>
                      )}
                    </div>
                    
                    {item.progress !== undefined && (
                      <div className="flex items-center gap-2">
                        <span>Progress: {item.progress}%</span>
                        <div className="w-16 h-2 bg-muted rounded-full">
                          <div 
                            className="h-2 bg-primary rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {item.assignedResources && item.assignedResources.length > 0 && (
                      <div>
                        Assigned: {item.assignedResources.length} resource(s)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectTimeline;
