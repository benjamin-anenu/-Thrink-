
import React from 'react';
import { ProjectTask } from '@/types/project';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Plus, Indent, Outdent } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskHierarchyControlsProps {
  task: ProjectTask;
  isExpanded: boolean;
  hasChildren: boolean;
  onToggleExpansion: (taskId: string) => void;
  onPromoteTask: (taskId: string) => void;
  onDemoteTask: (taskId: string) => void;
  onAddSubtask: (parentTaskId: string) => void;
  canPromote: boolean;
  canDemote: boolean;
}

const TaskHierarchyControls: React.FC<TaskHierarchyControlsProps> = ({
  task,
  isExpanded,
  hasChildren,
  onToggleExpansion,
  onPromoteTask,
  onDemoteTask,
  onAddSubtask,
  canPromote,
  canDemote
}) => {
  return (
    <div className="flex items-center gap-1">
      {/* Expansion toggle */}
      {hasChildren && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleExpansion(task.id)}
          className="h-6 w-6 p-0"
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </Button>
      )}
      
      {/* Hierarchy controls */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {canPromote && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPromoteTask(task.id)}
            className="h-6 w-6 p-0"
            title="Promote task"
          >
            <Outdent className="h-3 w-3" />
          </Button>
        )}
        
        {canDemote && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDemoteTask(task.id)}
            className="h-6 w-6 p-0"
            title="Demote task"
          >
            <Indent className="h-3 w-3" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddSubtask(task.id)}
          className="h-6 w-6 p-0"
          title="Add subtask"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default TaskHierarchyControls;
