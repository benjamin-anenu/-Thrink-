import React from 'react';
import { ProjectTask, ProjectMilestone } from '@/types/project';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import InlineTextEdit from './InlineTextEdit';
import InlineSelectEdit from './InlineSelectEdit';
import InlineDateEdit from './InlineDateEdit';
import InlineMultiSelectEdit from './InlineMultiSelectEdit';

interface TaskTableRowProps {
  task: ProjectTask;
  milestones: ProjectMilestone[];
  availableResources: Array<{ id: string; name: string; role: string }>;
  availableStakeholders: Array<{ id: string; name: string; role: string }>;
  allTasks: ProjectTask[];
  onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: ProjectTask) => void;
  onRebaselineTask: (task: ProjectTask) => void;
}

const TaskTableRow: React.FC<TaskTableRowProps> = ({
  task,
  milestones,
  availableResources,
  availableStakeholders,
  allTasks,
  onUpdateTask,
  onDeleteTask,
  onEditTask,
  onRebaselineTask
}) => {
  const statusOptions = [
    { value: 'Not Started', label: 'Not Started', color: 'bg-gray-500' },
    { value: 'In Progress', label: 'In Progress', color: 'bg-blue-500' },
    { value: 'Completed', label: 'Completed', color: 'bg-green-500' },
    { value: 'On Hold', label: 'On Hold', color: 'bg-yellow-500' }
  ];

  const priorityOptions = [
    { value: 'Low', label: 'Low', color: 'bg-green-500' },
    { value: 'Medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'High', label: 'High', color: 'bg-red-500' }
  ];

  const milestoneOptions = [
    { value: '', label: 'None' },
    ...milestones.map(m => ({
      value: m.id,
      label: m.name
    }))
  ];

  const dependencyOptions = allTasks
    .filter(t => t.id !== task.id)
    .map(t => ({
      id: t.id,
      name: t.name,
      role: t.status
    }));

  const isDelayed = () => {
    return new Date(task.endDate) > new Date(task.baselineEndDate);
  };

  const getScheduleVariance = () => {
    const actualEnd = new Date(task.endDate);
    const baselineEnd = new Date(task.baselineEndDate);
    return differenceInDays(actualEnd, baselineEnd);
  };

  const scheduleVariance = getScheduleVariance();
  const delayed = isDelayed();

  const handleProgressUpdate = (newProgress: number) => {
    onUpdateTask(task.id, { progress: newProgress });
  };

  const handleDurationUpdate = (newDuration: string) => {
    const duration = parseInt(newDuration);
    if (!isNaN(duration) && duration > 0) {
      // Calculate new end date based on start date + duration
      const startDate = new Date(task.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + duration - 1);
      
      onUpdateTask(task.id, { 
        duration,
        endDate: endDate.toISOString().split('T')[0]
      });
    }
  };

  return (
    <TableRow className={delayed ? 'bg-red-50' : ''}>
      <TableCell className="font-medium">
        <InlineTextEdit
          value={task.name}
          onSave={(value) => onUpdateTask(task.id, { name: value })}
          placeholder="Task name"
        />
      </TableCell>
      
      <TableCell>
        <InlineSelectEdit
          value={task.status}
          options={statusOptions}
          onSave={(value) => onUpdateTask(task.id, { status: value as any })}
          placeholder="Select status"
        />
      </TableCell>
      
      <TableCell>
        <InlineSelectEdit
          value={task.priority}
          options={priorityOptions}
          onSave={(value) => onUpdateTask(task.id, { priority: value as any })}
          placeholder="Select priority"
        />
      </TableCell>
      
      <TableCell>
        <InlineMultiSelectEdit
          value={task.assignedResources}
          options={availableResources}
          onSave={(value) => onUpdateTask(task.id, { assignedResources: value })}
          placeholder="Assign resources"
        />
      </TableCell>
      
      <TableCell>
        <InlineDateEdit
          value={task.startDate}
          onSave={(value) => onUpdateTask(task.id, { startDate: value })}
          placeholder="Start date"
        />
      </TableCell>
      
      <TableCell>
        <InlineDateEdit
          value={task.endDate}
          onSave={(value) => onUpdateTask(task.id, { endDate: value })}
          placeholder="End date"
        />
      </TableCell>
      
      <TableCell>
        <InlineTextEdit
          value={task.duration.toString()}
          onSave={handleDurationUpdate}
          placeholder="Duration"
        />
        <span className="text-xs text-muted-foreground ml-1">days</span>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          <Progress value={task.progress} className="flex-1" />
          <span className="text-sm font-medium">{task.progress}%</span>
        </div>
      </TableCell>
      
      <TableCell>
        <InlineMultiSelectEdit
          value={task.dependencies}
          options={dependencyOptions}
          onSave={(value) => onUpdateTask(task.id, { dependencies: value })}
          placeholder="Add dependencies"
        />
      </TableCell>
      
      <TableCell>
        <InlineSelectEdit
          value={task.milestoneId || ''}
          options={milestoneOptions}
          onSave={(value) => onUpdateTask(task.id, { milestoneId: value || undefined })}
          placeholder="Select milestone"
          allowEmpty={true}
        />
      </TableCell>
      
      <TableCell>
        {delayed && (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            +{scheduleVariance}d
          </Badge>
        )}
        {scheduleVariance < 0 && (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            {scheduleVariance}d
          </Badge>
        )}
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditTask(task)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          {delayed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRebaselineTask(task)}
              className="h-8 w-8 p-0 text-orange-500"
              title="Rebaseline task"
            >
              <AlertTriangle className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteTask(task.id)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default TaskTableRow;
