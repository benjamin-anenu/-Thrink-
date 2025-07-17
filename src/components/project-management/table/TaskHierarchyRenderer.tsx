
import React from 'react';
import { ProjectTask, ProjectMilestone, TaskHierarchyNode } from '@/types/project';
import TaskTableRow from './TaskTableRow';

interface TaskHierarchyRendererProps {
  hierarchyTree: TaskHierarchyNode[];
  expandedNodes: Set<string>;
  milestones: ProjectMilestone[];
  availableResources: Array<{ id: string; name: string; role: string }>;
  availableStakeholders: Array<{ id: string; name: string; role: string }>;
  allTasks: ProjectTask[];
  onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: ProjectTask) => void;
  onRebaselineTask: (task: ProjectTask) => void;
  onToggleExpansion: (taskId: string) => void;
  onPromoteTask: (taskId: string) => void;
  onDemoteTask: (taskId: string) => void;
  onAddSubtask: (taskId: string) => void;
}

const TaskHierarchyRenderer: React.FC<TaskHierarchyRendererProps> = ({
  hierarchyTree,
  expandedNodes,
  milestones,
  availableResources,
  availableStakeholders,
  allTasks,
  onUpdateTask,
  onDeleteTask,
  onEditTask,
  onRebaselineTask,
  onToggleExpansion,
  onPromoteTask,
  onDemoteTask,
  onAddSubtask
}) => {
  const renderTaskNode = (node: TaskHierarchyNode): React.ReactNode[] => {
    const isExpanded = expandedNodes.has(node.task.id);
    const elements: React.ReactNode[] = [];
    
    // Render the task row
    elements.push(
      <TaskTableRow
        key={node.task.id}
        task={node.task}
        milestones={milestones}
        availableResources={availableResources}
        availableStakeholders={availableStakeholders}
        allTasks={allTasks}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        onEditTask={onEditTask}
        onRebaselineTask={onRebaselineTask}
        isExpanded={isExpanded}
        onToggleExpansion={onToggleExpansion}
        onPromoteTask={onPromoteTask}
        onDemoteTask={onDemoteTask}
        onAddSubtask={onAddSubtask}
      />
    );
    
    // Render children if expanded
    if (isExpanded && node.children.length > 0) {
      node.children.forEach(childNode => {
        elements.push(...renderTaskNode(childNode));
      });
    }
    
    return elements;
  };

  const renderAllNodes = () => {
    const allElements: React.ReactNode[] = [];
    hierarchyTree.forEach(node => {
      allElements.push(...renderTaskNode(node));
    });
    return allElements;
  };

  return <>{renderAllNodes()}</>;
};

export default TaskHierarchyRenderer;
