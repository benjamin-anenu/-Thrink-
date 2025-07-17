
import React from 'react';
import { ProjectTask, ProjectMilestone } from '@/types/project';
import { TableRow } from '@/components/ui/table';
import {
  TaskSelectionCell,
  TaskNameCell,
  TaskStatusCell,
  TaskPriorityCell,
  TaskResourcesCell,
  TaskStartDateCell,
  TaskEndDateCell,
  TaskDurationCell,
  TaskProgressCell,
  TaskDependenciesCell,
  TaskMilestoneCell,
  TaskVarianceCell
} from './TaskTableCells';
import TaskActionsCell from './TaskActionsCell';

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
  // Hierarchy props
  isExpanded?: boolean;
  onToggleExpansion?: (taskId: string) => void;
  onPromoteTask?: (taskId: string) => void;
  onDemoteTask?: (taskId: string) => void;
  onAddSubtask?: (taskId: string) => void;
  // Selection props
  selected?: boolean;
  onSelectionChange?: (taskId: string, selected: boolean) => void;
}

const TaskTableRow: React.FC<TaskTableRowProps> = ({
  task,
  milestones,
  availableResources,
  allTasks,
  onUpdateTask,
  onDeleteTask,
  onEditTask,
  onRebaselineTask,
  isExpanded = true,
  onToggleExpansion,
  onPromoteTask,
  onDemoteTask,
  onAddSubtask,
  selected = false,
  onSelectionChange
}) => {
  const isDelayed = () => {
    return new Date(task.endDate) > new Date(task.baselineEndDate);
  };

  const delayed = isDelayed();

  return (
    <TableRow className={`table-row transition-colors group ${delayed ? 'bg-destructive/10 dark:bg-destructive/20' : ''} ${selected ? 'bg-muted/50' : ''}`}>
      {/* Selection checkbox */}
      {onSelectionChange && (
        <TaskSelectionCell 
          task={task}
          selected={selected}
          onSelectionChange={onSelectionChange}
        />
      )}
      
      <TaskNameCell 
        task={task} 
        onUpdateTask={onUpdateTask}
        isExpanded={isExpanded}
        onToggleExpansion={onToggleExpansion}
        onPromoteTask={onPromoteTask}
        onDemoteTask={onDemoteTask}
        onAddSubtask={onAddSubtask}
        allTasks={allTasks}
      />
      <TaskStatusCell task={task} onUpdateTask={onUpdateTask} />
      <TaskPriorityCell task={task} onUpdateTask={onUpdateTask} />
      <TaskResourcesCell task={task} availableResources={availableResources} onUpdateTask={onUpdateTask} />
      <TaskStartDateCell task={task} onUpdateTask={onUpdateTask} />
      <TaskEndDateCell task={task} onUpdateTask={onUpdateTask} />
      <TaskDurationCell task={task} onUpdateTask={onUpdateTask} />
      <TaskProgressCell task={task} />
      <TaskDependenciesCell task={task} allTasks={allTasks} onUpdateTask={onUpdateTask} />
      <TaskMilestoneCell task={task} milestones={milestones} onUpdateTask={onUpdateTask} />
      <TaskVarianceCell task={task} />
      <TaskActionsCell 
        task={task} 
        isDelayed={delayed}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onRebaselineTask={onRebaselineTask}
      />
    </TableRow>
  );
};

export default TaskTableRow;
