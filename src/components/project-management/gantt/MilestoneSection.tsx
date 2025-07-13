
import React from 'react';
import { ProjectTask, ProjectMilestone } from '@/types/project';
import { TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Target } from 'lucide-react';
import TaskTableRow from '../table/TaskTableRow';

interface MilestoneSectionProps {
  milestone: ProjectMilestone | null;
  tasks: ProjectTask[];
  isExpanded: boolean;
  onToggle: () => void;
  allTasks: ProjectTask[];
  milestones: ProjectMilestone[];
  availableResources: Array<{ id: string; name: string; role: string }>;
  availableStakeholders: Array<{ id: string; name: string; role: string }>;
  onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: ProjectTask) => void;
  onRebaselineTask: (task: ProjectTask) => void;
}

const MilestoneSection: React.FC<MilestoneSectionProps> = ({
  milestone,
  tasks,
  isExpanded,
  onToggle,
  allTasks,
  milestones,
  availableResources,
  availableStakeholders,
  onUpdateTask,
  onDeleteTask,
  onEditTask,
  onRebaselineTask
}) => {
  if (!milestone) {
    // Tasks without milestone - render directly
    return (
      <>
        {tasks.map((task) => (
          <TaskTableRow
            key={task.id}
            task={task}
            milestones={milestones}
            availableResources={availableResources}
            availableStakeholders={availableStakeholders}
            allTasks={allTasks}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
            onRebaselineTask={onRebaselineTask}
          />
        ))}
      </>
    );
  }

  return (
    <>
      <TableRow className="table-row bg-muted/50">
        <td colSpan={12} className="table-cell">
          <Collapsible open={isExpanded} onOpenChange={onToggle}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <Target className="h-4 w-4 text-primary" />
              <span className="font-semibold">{milestone.name}</span>
              <Badge variant="outline" className="ml-2">
                {tasks.length} tasks
              </Badge>
              <Badge 
                variant="outline" 
                className={`ml-1 ${
                  milestone.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                  milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                  milestone.status === 'delayed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                {milestone.status}
              </Badge>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {tasks.map((task) => (
                <TaskTableRow
                  key={task.id}
                  task={task}
                  milestones={milestones}
                  availableResources={availableResources}
                  availableStakeholders={availableStakeholders}
                  allTasks={allTasks}
                  onUpdateTask={onUpdateTask}
                  onDeleteTask={onDeleteTask}
                  onEditTask={onEditTask}
                  onRebaselineTask={onRebaselineTask}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        </td>
      </TableRow>
    </>
  );
};

export default MilestoneSection;
