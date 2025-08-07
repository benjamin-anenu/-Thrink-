
import React from 'react';
import { ProjectTask, ProjectMilestone } from '@/types/project';
import TaskTableRow from './TaskTableRow';

interface TaskHierarchyRendererProps {
  tasks: ProjectTask[];
  milestones: ProjectMilestone[];
  availableResources: Array<{ id: string; name: string; role: string; email?: string }>;
  availableStakeholders: Array<{ id: string; name: string; role: string; email?: string }>;
  onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: ProjectTask) => void;
  onRebaselineTask: (taskId: string, newStartDate: string, newEndDate: string, reason: string) => void;
  densityClass: string;
  expandedTasks: Set<string>;
  onToggleExpansion: (taskId: string) => void;
  onPromoteTask: (taskId: string) => void;
  onDemoteTask: (taskId: string) => void;
  onAddSubtask: (taskId: string) => void;
  onIssueWarningClick?: (taskId: string) => void;
  taskIssueMap?: Record<string, number>;
  projectId?: string;
}

const TaskHierarchyRenderer: React.FC<TaskHierarchyRendererProps> = ({
  tasks,
  milestones,
  availableResources,
  availableStakeholders,
  onUpdateTask,
  onDeleteTask,
  onEditTask,
  onRebaselineTask,
  densityClass,
  expandedTasks,
  onToggleExpansion,
  onPromoteTask,
  onDemoteTask,
  onAddSubtask,
  onIssueWarningClick,
  taskIssueMap = {},
  projectId
}) => {
  // Filter and sort tasks by hierarchy
  const rootTasks = tasks.filter(task => !task.parentTaskId);
  const sortedTasks = [...rootTasks].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const renderTask = (task: ProjectTask): React.ReactNode => {
    const isExpanded = expandedTasks.has(task.id);
    const subtasks = tasks.filter(t => t.parentTaskId === task.id);
    const hasSubtasks = subtasks.length > 0;

    return (
      <React.Fragment key={task.id}>
        <TaskTableRow
          task={task}
          milestones={milestones}
          availableResources={availableResources}
          availableStakeholders={availableStakeholders}
          allTasks={tasks}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onEditTask={onEditTask}
          onRebaselineTask={onRebaselineTask}
          densityClass={densityClass}
          onIssueWarningClick={onIssueWarningClick}
          issueCount={taskIssueMap[task.id] || 0}
          projectId={projectId}
        />
        {hasSubtasks && isExpanded && (
          <>
            {subtasks.map(subtask => renderTask(subtask))}
          </>
        )}
      </React.Fragment>
    );
  };

  return (
    <>
      {sortedTasks.map(task => renderTask(task))}
    </>
  );
};

export default TaskHierarchyRenderer;
