
import React from 'react';
import { ProjectTask, ProjectMilestone } from '@/types/project';
import { TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { differenceInDays } from 'date-fns';
import InlineTextEdit from './InlineTextEdit';
import InlineSelectEdit from './InlineSelectEdit';
import InlineDateEdit from './InlineDateEdit';
import InlineMultiSelectEdit from './InlineMultiSelectEdit';
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
  
  const canPromote = indentLevel > 0;
  const siblings = allTasks.filter(t => t.parentTaskId === task.parentTaskId);
  const taskIndex = siblings.findIndex(t => t.id === task.id);
  const canDemote = taskIndex > 0;

  return (
    <TableCell className="table-cell font-medium group">
      <div className="flex items-center gap-2">
        <div style={{ width: `${indentLevel * 16}px` }} className="flex-shrink-0" />
        
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
        
        <div className="flex items-center gap-2 flex-1">
          {indentLevel > 0 && (
            <div className="flex items-center">
              <div className="w-2 h-px bg-border" />
              <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            </div>
          )}
          
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
      value={task.assignedResources || []}
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

// Simplified dependency cell
export const TaskDependenciesCell: React.FC<{ task: ProjectTask; allTasks: ProjectTask[]; onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void }> = ({
  task,
  allTasks,
  onUpdateTask
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [dependencyInput, setDependencyInput] = React.useState('');

  const handleStartEdit = () => {
    setDependencyInput((task.dependencies || []).join(', '));
    setIsEditing(true);
  };

  const handleSave = () => {
    const deps = dependencyInput
      .split(',')
      .map(dep => dep.trim())
      .filter(dep => dep.length > 0)
      .filter(dep => allTasks.some(t => t.id === dep || t.name.toLowerCase().includes(dep.toLowerCase())));
    
    onUpdateTask(task.id, { dependencies: deps });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDependencyInput('');
  };

  const getDependencyNames = () => {
    return (task.dependencies || [])
      .map(depId => {
        const depTask = allTasks.find(t => t.id === depId);
        return depTask ? depTask.name : depId;
      })
      .join(', ');
  };

  return (
    <TableCell className="table-cell">
      {isEditing ? (
        <div className="flex items-center gap-1">
          <Input
            value={dependencyInput}
            onChange={(e) => setDependencyInput(e.target.value)}
            placeholder="Task IDs or names..."
            className="h-6 text-xs"
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            onFocus={(e) => e.target.select()}
            autoFocus
          />
        </div>
      ) : (
        <div
          className="cursor-pointer hover:bg-muted/50 p-1 rounded text-xs"
          onClick={handleStartEdit}
        >
          {getDependencyNames() || 'Add dependencies...'}
        </div>
      )}
    </TableCell>
  );
};

export const TaskMilestoneCell: React.FC<{ task: ProjectTask; milestones: ProjectMilestone[]; onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void }> = ({
  task,
  milestones,
  onUpdateTask
}) => {
  const milestoneOptions = [
    { value: '__EMPTY__', label: 'No milestone' },
    ...milestones.map(m => ({
      value: m.id,
      label: m.name
    }))
  ];

  return (
    <TableCell className="table-cell">
      <InlineSelectEdit
        value={task.milestoneId || '__EMPTY__'}
        options={milestoneOptions}
        onSave={(value) => onUpdateTask(task.id, { milestoneId: value === '__EMPTY__' ? undefined : value })}
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
