
import React from 'react';
import { ProjectTask, ProjectMilestone } from '@/types/project';
import { TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { differenceInDays } from 'date-fns';
import InlineTextEdit from './InlineTextEdit';
import InlineSelectEdit from './InlineSelectEdit';
import InlineDateEdit from './InlineDateEdit';
import InlineMultiSelectEdit from './InlineMultiSelectEdit';
import DependencyManager from '../dependencies/DependencyManager';
import DependencyVisualizer from '../dependencies/DependencyVisualizer';
import TaskHierarchyControls from './TaskHierarchyControls';

interface TaskSelectionCellProps {
  task: ProjectTask;
  selected: boolean;
  onSelectionChange: (taskId: string, selected: boolean) => void;
}

export const TaskSelectionCell: React.FC<TaskSelectionCellProps> = ({
  task,
  selected,
  onSelectionChange
}) => (
  <TableCell className="w-8">
    <Checkbox
      checked={selected}
      onCheckedChange={(checked) => onSelectionChange(task.id, !!checked)}
    />
  </TableCell>
);

interface TaskNameCellProps {
  task: ProjectTask;
  onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void;
  isExpanded?: boolean;
  onToggleExpansion?: (taskId: string) => void;
  onPromoteTask?: (taskId: string) => void;
  onDemoteTask?: (taskId: string) => void;
  onAddSubtask?: (taskId: string) => void;
  allTasks?: ProjectTask[];
}

export const TaskNameCell: React.FC<TaskNameCellProps> = ({
  task,
  onUpdateTask,
  isExpanded = true,
  onToggleExpansion,
  onPromoteTask,
  onDemoteTask,
  onAddSubtask,
  allTasks = []
}) => {
  const indentLevel = task.hierarchyLevel || 0;
  const hasChildren = task.hasChildren || false;
  
  // Check if task can be promoted (not at root level)
  const canPromote = indentLevel > 0;
  
  // Check if task can be demoted (has a previous sibling)
  const siblings = allTasks.filter(t => t.parentTaskId === task.parentTaskId);
  const taskIndex = siblings.findIndex(t => t.id === task.id);
  const canDemote = taskIndex > 0;

  return (
    <TableCell className="table-cell font-medium group">
      <div className="flex items-center gap-2">
        {/* Indentation for hierarchy */}
        <div style={{ width: `${indentLevel * 16}px` }} className="flex-shrink-0" />
        
        {/* Hierarchy controls */}
        {(onToggleExpansion || onPromoteTask || onDemoteTask || onAddSubtask) && (
          <TaskHierarchyControls
            task={task}
            isExpanded={isExpanded}
            hasChildren={hasChildren}
            onToggleExpansion={onToggleExpansion || (() => {})}
            onPromoteTask={onPromoteTask || (() => {})}
            onDemoteTask={onDemoteTask || (() => {})}
            onAddSubtask={onAddSubtask || (() => {})}
            canPromote={canPromote}
            canDemote={canDemote}
          />
        )}
        
        {/* Task name with hierarchy indicator */}
        <div className="flex items-center gap-2 flex-1">
          {/* Visual hierarchy indicator */}
          {indentLevel > 0 && (
            <div className="flex items-center">
              <div className="w-2 h-px bg-border" />
              <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            </div>
          )}
          
          {/* Parent task indicator */}
          {hasChildren && (
            <div className="w-1.5 h-1.5 rounded-sm bg-primary/60 flex-shrink-0" />
          )}
          
          <InlineTextEdit
            value={task.name}
            onSave={(value) => onUpdateTask(task.id, { name: value })}
            placeholder="Task name"
          />
        </div>
      </div>
    </TableCell>
  );
};

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
    { value: 'High', label: 'High', color: 'bg-red-500 dark:bg-red-600' },
    { value: 'Critical', label: 'Critical', color: 'bg-red-700 dark:bg-red-800' }
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

export const TaskDependenciesCell: React.FC<{ task: ProjectTask; allTasks: ProjectTask[]; onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void }> = ({
  task,
  allTasks,
  onUpdateTask
}) => {
  return (
    <TableCell className="p-2 align-top">
      <div className="w-full space-y-1.5 overflow-hidden">
        <div className="w-full">
          <DependencyVisualizer task={task} allTasks={allTasks} />
        </div>
        
        <div className="w-full">
          <DependencyManager 
            task={task} 
            allTasks={allTasks} 
            onUpdateTask={onUpdateTask}
          />
        </div>
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

export const TaskVarianceCell: React.FC<{ task: ProjectTask }> = ({ task }) => {
  const getScheduleVariance = () => {
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
