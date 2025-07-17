
import React from 'react';
import { ProjectTask, ProjectMilestone } from '@/types/project';
import { TableRow } from '@/components/ui/table';
import {
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
  densityClass?: string;
  // New hierarchy props
  isExpanded?: boolean;
  onToggleExpansion?: (taskId: string) => void;
  onPromoteTask?: (taskId: string) => void;
  onDemoteTask?: (taskId: string) => void;
  onAddSubtask?: (taskId: string) => void;
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
  densityClass = 'py-3 px-4',
  isExpanded = true,
  onToggleExpansion,
  onPromoteTask,
  onDemoteTask,
  onAddSubtask
}) => {
  const isDelayed = () => {
    return new Date(task.endDate) > new Date(task.baselineEndDate);
  };

  const delayed = isDelayed();

  return (
    <TableRow 
      className={`border-b transition-colors ${
        delayed ? 'bg-destructive/5 border-destructive/20' : ''
      }`}
    >
      <TaskNameCell 
        task={task} 
        onUpdateTask={onUpdateTask}
        isExpanded={isExpanded}
        onToggleExpansion={onToggleExpansion}
        onPromoteTask={onPromoteTask}
        onDemoteTask={onDemoteTask}
        onAddSubtask={onAddSubtask}
        allTasks={allTasks}
        densityClass={densityClass}
      />
      <TaskStatusCell task={task} onUpdateTask={onUpdateTask} densityClass={densityClass} />
      <TaskPriorityCell task={task} onUpdateTask={onUpdateTask} densityClass={densityClass} />
      <TaskResourcesCell task={task} availableResources={availableResources} onUpdateTask={onUpdateTask} densityClass={densityClass} />
      <TaskStartDateCell task={task} onUpdateTask={onUpdateTask} densityClass={densityClass} />
      <TaskEndDateCell task={task} onUpdateTask={onUpdateTask} densityClass={densityClass} />
      <TaskDurationCell task={task} onUpdateTask={onUpdateTask} densityClass={densityClass} />
      <TaskProgressCell task={task} densityClass={densityClass} />
      <TaskDependenciesCell task={task} allTasks={allTasks} onUpdateTask={onUpdateTask} densityClass={densityClass} />
      <TaskMilestoneCell task={task} milestones={milestones} onUpdateTask={onUpdateTask} densityClass={densityClass} />
      <TaskVarianceCell task={task} densityClass={densityClass} />
      <TaskActionsCell 
        task={task} 
        isDelayed={delayed}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onRebaselineTask={onRebaselineTask}
        densityClass={densityClass}
      />
    </TableRow>
  );
};

export default TaskTableRow;
