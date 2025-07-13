
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
}

const TaskTableRow: React.FC<TaskTableRowProps> = ({
  task,
  milestones,
  availableResources,
  allTasks,
  onUpdateTask,
  onDeleteTask,
  onEditTask,
  onRebaselineTask
}) => {
  const isDelayed = () => {
    return new Date(task.endDate) > new Date(task.baselineEndDate);
  };

  const delayed = isDelayed();

  return (
    <TableRow className={`table-row ${delayed ? 'bg-red-50 dark:bg-red-950/30' : ''}`}>
      <TaskNameCell task={task} onUpdateTask={onUpdateTask} />
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
