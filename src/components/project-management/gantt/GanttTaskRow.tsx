
import React, { useState } from 'react';
import { ProjectTask, ProjectMilestone } from '@/types/project';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Clock, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

interface GanttTaskRowProps {
  task: ProjectTask;
  startDate: Date;
  endDate: Date;
  onEditTask: (task: ProjectTask) => void;
  onDeleteTask: (taskId: string) => void;
  onRebaselineTask: (task: ProjectTask) => void;
  availableResources: Array<{ id: string; name: string; role: string }>;
}

const GanttTaskRow: React.FC<GanttTaskRowProps> = ({
  task,
  startDate,
  endDate,
  onEditTask,
  onDeleteTask,
  onRebaselineTask,
  availableResources
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const getTaskPosition = () => {
    const taskStart = parseISO(task.startDate);
    const taskEnd = parseISO(task.endDate);
    const timelineStart = startDate;
    const timelineEnd = endDate;

    const totalDays = differenceInDays(timelineEnd, timelineStart) + 1;
    const startPos = Math.max(0, differenceInDays(taskStart, timelineStart));
    const duration = Math.max(1, differenceInDays(taskEnd, taskStart) + 1);

    return {
      left: (startPos / totalDays) * 100,
      width: (duration / totalDays) * 100
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-muted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isTaskDelayed = () => {
    return new Date(task.endDate) > new Date(task.baselineEndDate);
  };

  const getScheduleVariance = () => {
    const actualEnd = new Date(task.endDate);
    const baselineEnd = new Date(task.baselineEndDate);
    return differenceInDays(actualEnd, baselineEnd);
  };

  const position = getTaskPosition();
  const isDelayed = isTaskDelayed();
  const scheduleVariance = getScheduleVariance();

  return (
    <div className="flex items-center mb-3">
      {/* Task Info Panel */}
      <div className="w-80 flex-shrink-0 pr-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-medium text-sm">{task.name}</div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditTask(task)}
                className="h-6 w-6 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              {isDelayed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRebaselineTask(task)}
                  className="h-6 w-6 p-0 text-orange-500"
                  title="Rebaseline task"
                >
                  <AlertTriangle className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteTask(task.id)}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)} text-white`}>
              {task.priority}
            </Badge>
            <Badge variant="secondary" className={`text-xs ${getStatusColor(task.status)}`}>
              {task.status}
            </Badge>
            {isDelayed && (
              <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800">
                Delayed {scheduleVariance}d
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {task.assignedResources.length}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {task.progress}%
            </div>
            <span>{task.duration}d</span>
          </div>

          {task.assignedResources.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Resources: {task.assignedResources.map(resourceId => 
                availableResources.find(r => r.id === resourceId)?.name
              ).filter(Boolean).join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Timeline Bar */}
      <div className="flex-1 relative h-12">
        {/* Background Grid */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: differenceInDays(endDate, startDate) + 1 }).map((_, index) => (
            <div key={index} className="flex-1 border-r border-border/20 h-full"></div>
          ))}
        </div>

        {/* Baseline Bar (if different from actual) */}
        {isDelayed && (
          <div 
            className="absolute top-2 h-2 bg-gray-300 rounded-sm opacity-60"
            style={{
              left: `${position.left}%`,
              width: `${(task.duration / differenceInDays(endDate, startDate)) * 100}%`
            }}
            title={`Baseline: ${task.baselineStartDate} - ${task.baselineEndDate}`}
          />
        )}

        {/* Actual Task Bar */}
        <div 
          className={`absolute top-3 h-6 ${getPriorityColor(task.priority)} rounded-md flex items-center justify-center text-white text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${isDelayed ? 'border-2 border-orange-400' : ''} ${isDragging ? 'opacity-75' : ''}`}
          style={{
            left: `${position.left}%`,
            width: `${position.width}%`
          }}
          onClick={() => onEditTask(task)}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          title={`${task.name}: ${task.startDate} - ${task.endDate} (${task.progress}%)`}
        >
          {task.progress}%
        </div>
      </div>
    </div>
  );
};

export default GanttTaskRow;
