
import React from 'react';
import { ProjectTask, ProjectMilestone } from '@/types/project';
import { TableBody } from '@/components/ui/table';
import MilestoneSection from './MilestoneSection';

interface GanttTableContentProps {
  groupedTasks: { [key: string]: { milestone: ProjectMilestone | null; tasks: ProjectTask[] } };
  expandedMilestones: Set<string>;
  onToggleMilestone: (milestoneId: string) => void;
  allTasks: ProjectTask[];
  milestones: ProjectMilestone[];
  availableResources: Array<{ id: string; name: string; role: string }>;
  availableStakeholders: Array<{ id: string; name: string; role: string }>;
  onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: ProjectTask) => void;
  onRebaselineTask: (task: ProjectTask) => void;
}

const GanttTableContent: React.FC<GanttTableContentProps> = ({
  groupedTasks,
  expandedMilestones,
  onToggleMilestone,
  allTasks,
  milestones,
  availableResources,
  availableStakeholders,
  onUpdateTask,
  onDeleteTask,
  onEditTask,
  onRebaselineTask
}) => {
  return (
    <TableBody>
      {Object.entries(groupedTasks).map(([groupKey, group]) => (
        <MilestoneSection
          key={groupKey}
          milestone={group.milestone}
          tasks={group.tasks}
          isExpanded={group.milestone ? expandedMilestones.has(group.milestone.id) : true}
          onToggle={() => group.milestone && onToggleMilestone(group.milestone.id)}
          allTasks={allTasks}
          milestones={milestones}
          availableResources={availableResources}
          availableStakeholders={availableStakeholders}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onEditTask={onEditTask}
          onRebaselineTask={onRebaselineTask}
        />
      ))}
    </TableBody>
  );
};

export default GanttTableContent;
