
import React from 'react';
import { ProjectTask, ProjectMilestone } from '@/types/project';
import { TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { differenceInDays } from 'date-fns';
import InlineTextEdit from './InlineTextEdit';
import InlineSelectEdit from './InlineSelectEdit';
import InlineDateEdit from './InlineDateEdit';
import InlineMultiSelectEdit from './InlineMultiSelectEdit';

interface TaskTableCellsProps {
  task: ProjectTask;
  milestones: ProjectMilestone[];
  availableResources: Array<{ id: string; name: string; role: string }>;
  allTasks: ProjectTask[];
  onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void;
}

export const TaskNameCell: React.FC<{ task: ProjectTask; onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void }> = ({
  task,
  onUpdateTask
}) => (
  <TableCell className="table-cell font-medium">
    <InlineTextEdit
      value={task.name}
      onSave={(value) => onUpdateTask(task.id, { name: value })}
      placeholder="Task name"
    />
  </TableCell>
);

export const TaskStatusCell: React.FC<{ task: ProjectTask; onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void }> = ({
  task,
  onUpdateTask
}) => {
  const statusOptions = [
    { value: 'Not Started', label: 'Not Started', color: 'bg-muted text-muted-foreground' },
    { value: 'In Progress', label: 'In Progress', color: 'bg-primary/10 text-primary' },
    { value: 'Completed', label: 'Completed', color: 'bg-success/10 text-success' },
    { value: 'On Hold', label: 'On Hold', color: 'bg-warning/10 text-warning' }
  ];

  return (
    <TableCell className="table-cell">
      <InlineSelectEdit
        value={task.status}
        options={statusOptions}
        onSave={(value) => onUpdateTask(task.id, { status: value as any })}
        placeholder="Select status"
      />
    </TableCell>
  );
};

export const TaskPriorityCell: React.FC<{ task: ProjectTask; onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void }> = ({
  task,
  onUpdateTask
}) => {
  const priorityOptions = [
    { value: 'Low', label: 'Low', color: 'bg-green-500 dark:bg-green-600' },
    { value: 'Medium', label: 'Medium', color: 'bg-yellow-500 dark:bg-yellow-600' },
    { value: 'High', label: 'High', color: 'bg-red-500 dark:bg-red-600' }
  ];

  return (
    <TableCell className="table-cell">
      <InlineSelectEdit
        value={task.priority}
        options={priorityOptions}
        onSave={(value) => onUpdateTask(task.id, { priority: value as any })}
        placeholder="Select priority"
      />
    </TableCell>
  );
};

export const TaskResourcesCell: React.FC<{ task: ProjectTask; availableResources: Array<{ id: string; name: string; role: string }>; onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void }> = ({
  task,
  availableResources,
  onUpdateTask
}) => (
  <TableCell className="table-cell">
    <InlineMultiSelectEdit
      value={task.assignedResources}
      options={availableResources}
      onSave={(value) => onUpdateTask(task.id, { assignedResources: value })}
      placeholder="Assign resources"
    />
  </TableCell>
);

export const TaskStartDateCell: React.FC<{ task: ProjectTask; onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void }> = ({
  task,
  onUpdateTask
}) => (
  <TableCell className="table-cell">
    <InlineDateEdit
      value={task.startDate}
      onSave={(value) => onUpdateTask(task.id, { startDate: value })}
      placeholder="Start date"
    />
  </TableCell>
);

export const TaskEndDateCell: React.FC<{ task: ProjectTask; onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void }> = ({
  task,
  onUpdateTask
}) => (
  <TableCell className="table-cell">
    <InlineDateEdit
      value={task.endDate}
      onSave={(value) => onUpdateTask(task.id, { endDate: value })}
      placeholder="End date"
    />
  </TableCell>
);

export const TaskDurationCell: React.FC<{ task: ProjectTask; onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void }> = ({
  task,
  onUpdateTask
}) => {
  const handleDurationUpdate = (newDuration: string) => {
    const duration = parseInt(newDuration);
    if (!isNaN(duration) && duration > 0) {
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
    <TableCell className="table-cell">
      <InlineTextEdit
        value={task.duration.toString()}
        onSave={handleDurationUpdate}
        placeholder="Duration"
      />
      <span className="text-xs text-muted-foreground ml-1">days</span>
    </TableCell>
  );
};

export const TaskProgressCell: React.FC<{ task: ProjectTask }> = ({ task }) => (
  <TableCell className="table-cell">
    <div className="flex items-center gap-2">
      <Progress value={task.progress} className="flex-1" />
      <span className="text-sm font-medium">{task.progress}%</span>
    </div>
  </TableCell>
);

// Fixed: Dependencies cell with proper overflow handling and layout
export const TaskDependenciesCell: React.FC<{ task: ProjectTask; allTasks: ProjectTask[]; onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void }> = ({
  task,
  allTasks,
  onUpdateTask
}) => {
  const dependencyOptions = allTasks
    .filter(t => t.id !== task.id)
    .map(t => ({
      id: t.id,
      name: t.name,
      role: t.status
    }));

  const dependencyTasks = task.dependencies
    .map(depId => allTasks.find(t => t.id === depId))
    .filter(Boolean);

  return (
    <TableCell className="table-cell min-w-0 max-w-[200px]">
      <div className="flex flex-col gap-1">
        {dependencyTasks.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {dependencyTasks.map(depTask => (
              <Badge 
                key={depTask!.id} 
                variant="outline" 
                className="text-xs truncate max-w-[80px]"
                title={depTask!.name}
              >
                {depTask!.name}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No dependencies</span>
        )}
        <InlineMultiSelectEdit
          value={task.dependencies}
          options={dependencyOptions}
          onSave={(value) => onUpdateTask(task.id, { dependencies: value })}
          placeholder="Add dependencies"
        />
      </div>
    </TableCell>
  );
};

export const TaskMilestoneCell: React.FC<{ task: ProjectTask; milestones: ProjectMilestone[]; onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void }> = ({
  task,
  milestones,
  onUpdateTask
}) => {
  const milestoneOptions = [
    { value: '', label: 'None' },
    ...milestones.map(m => ({
      value: m.id,
      label: m.name
    }))
  ];

  return (
    <TableCell className="table-cell">
      <InlineSelectEdit
        value={task.milestoneId || ''}
        options={milestoneOptions}
        onSave={(value) => onUpdateTask(task.id, { milestoneId: value || undefined })}
        placeholder="Select milestone"
        allowEmpty={true}
      />
    </TableCell>
  );
};

// Fixed: Variance calculation with proper baseline date handling
export const TaskVarianceCell: React.FC<{ task: ProjectTask }> = ({ task }) => {
  const getScheduleVariance = () => {
    // Only calculate variance if we have baseline dates
    if (!task.baselineEndDate || !task.endDate) {
      return null;
    }
    
    const actualEnd = new Date(task.endDate);
    const baselineEnd = new Date(task.baselineEndDate);
    return differenceInDays(actualEnd, baselineEnd);
  };

  const scheduleVariance = getScheduleVariance();

  return (
    <TableCell className="table-cell">
      {scheduleVariance === null ? (
        <span className="text-xs text-muted-foreground">No baseline</span>
      ) : scheduleVariance > 0 ? (
        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          +{scheduleVariance}d
        </Badge>
      ) : scheduleVariance < 0 ? (
        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          {scheduleVariance}d
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          On track
        </Badge>
      )}
    </TableCell>
  );
};
