
import React, { useState } from 'react';
import { ProjectTask, ProjectMilestone } from '@/types/project';
import { TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronRight, Plus, Minus, MoreHorizontal } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import InlineTextEdit from './InlineTextEdit';
import InlineSelectEdit from './InlineSelectEdit';
import InlineDateEdit from './InlineDateEdit';
import InlineMultiSelectEdit from './InlineMultiSelectEdit';
import DependencyManager from '../dependencies/DependencyManager';

// Task Name Cell with hierarchy support
interface TaskNameCellProps {
  task: ProjectTask;
  onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void;
  isExpanded?: boolean;
  onToggleExpansion?: (taskId: string) => void;
  onPromoteTask?: (taskId: string) => void;
  onDemoteTask?: (taskId: string) => void;
  onAddSubtask?: (taskId: string) => void;
  allTasks: ProjectTask[];
  densityClass?: string;
}

export const TaskNameCell: React.FC<TaskNameCellProps> = ({
  task,
  onUpdateTask,
  isExpanded = true,
  onToggleExpansion,
  onPromoteTask,
  onDemoteTask,
  onAddSubtask,
  allTasks,
  densityClass = 'py-3 px-4'
}) => {
  const indentLevel = task.hierarchyLevel || 0;
  const hasChildren = task.hasChildren || false;

  return (
    <TableCell className={`table-cell ${densityClass}`}>
      <div className="flex items-center gap-2">
        {/* Indentation for hierarchy */}
        <div style={{ width: `${indentLevel * 16}px` }} className="flex-shrink-0" />
        
        {/* Expansion toggle for parent tasks */}
        {hasChildren && onToggleExpansion && (
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
        
        {/* Task name editor */}
        <div className="flex-1 min-w-0">
          <InlineTextEdit
            value={task.name}
            onSave={(value) => onUpdateTask(task.id, { name: value })}
            className="font-medium"
          />
          {task.description && (
            <div className="text-xs text-muted-foreground mt-1 truncate">
              {task.description}
            </div>
          )}
        </div>

        {/* Hierarchy controls */}
        {(onPromoteTask || onDemoteTask || onAddSubtask) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {onPromoteTask && indentLevel > 0 && (
                <DropdownMenuItem onClick={() => onPromoteTask(task.id)}>
                  <Minus className="h-3 w-3 mr-2" />
                  Promote
                </DropdownMenuItem>
              )}
              {onDemoteTask && (
                <DropdownMenuItem onClick={() => onDemoteTask(task.id)}>
                  <Plus className="h-3 w-3 mr-2" />
                  Demote
                </DropdownMenuItem>
              )}
              {onAddSubtask && (
                <DropdownMenuItem onClick={() => onAddSubtask(task.id)}>
                  <Plus className="h-3 w-3 mr-2" />
                  Add Subtask
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </TableCell>
  );
};

// Task Status Cell
interface TaskStatusCellProps {
  task: ProjectTask;
  onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void;
  densityClass?: string;
}

export const TaskStatusCell: React.FC<TaskStatusCellProps> = ({ 
  task, 
  onUpdateTask, 
  densityClass = 'py-3 px-4' 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const statusOptions = [
    { value: 'Not Started', label: 'Not Started' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isEditing) {
    return (
      <TableCell className={`table-cell ${densityClass}`}>
        <InlineSelectEdit
          value={task.status}
          options={statusOptions}
          onSave={(value) => {
            onUpdateTask(task.id, { status: value as ProjectTask['status'] });
            setIsEditing(false);
          }}
        />
      </TableCell>
    );
  }

  return (
    <TableCell className={`table-cell ${densityClass}`}>
      <div 
        className="cursor-pointer"
        onClick={() => setIsEditing(true)}
      >
        <Badge 
          variant="outline" 
          className={`${getStatusColor(task.status)} text-xs px-2 py-1`}
        >
          {task.status}
        </Badge>
      </div>
    </TableCell>
  );
};

// Task Priority Cell
interface TaskPriorityCellProps {
  task: ProjectTask;
  onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void;
  densityClass?: string;
}

export const TaskPriorityCell: React.FC<TaskPriorityCellProps> = ({ 
  task, 
  onUpdateTask, 
  densityClass = 'py-3 px-4' 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  if (isEditing) {
    return (
      <TableCell className={`table-cell ${densityClass}`}>
        <InlineSelectEdit
          value={task.priority}
          options={priorityOptions}
          onSave={(value) => {
            onUpdateTask(task.id, { priority: value as ProjectTask['priority'] });
            setIsEditing(false);
          }}
        />
      </TableCell>
    );
  }

  return (
    <TableCell className={`table-cell ${densityClass}`}>
      <div 
        className="cursor-pointer"
        onClick={() => setIsEditing(true)}
      >
        <Badge 
          variant="outline" 
          className={`${getPriorityColor(task.priority)} text-xs px-2 py-1`}
        >
          {task.priority}
        </Badge>
      </div>
    </TableCell>
  );
};

// Task Resources Cell  
interface TaskResourcesCellProps {
  task: ProjectTask;
  availableResources: Array<{ id: string; name: string; role: string }>;
  onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void;
  densityClass?: string;
}

export const TaskResourcesCell: React.FC<TaskResourcesCellProps> = ({ 
  task, 
  availableResources, 
  onUpdateTask, 
  densityClass = 'py-3 px-4' 
}) => {
  return (
    <TableCell className={`table-cell ${densityClass}`}>
      <InlineMultiSelectEdit
        value={task.assignedResources || []}
        options={availableResources}
        onSave={(values) => onUpdateTask(task.id, { assignedResources: values })}
        placeholder="Unassigned"
      />
    </TableCell>
  );
};

// Task Start Date Cell
interface TaskStartDateCellProps {
  task: ProjectTask;
  onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void;
  densityClass?: string;
}

export const TaskStartDateCell: React.FC<TaskStartDateCellProps> = ({ 
  task, 
  onUpdateTask, 
  densityClass = 'py-3 px-4' 
}) => {
  return (
    <TableCell className={`table-cell ${densityClass}`}>
      <InlineDateEdit
        value={task.startDate}
        onSave={(value) => onUpdateTask(task.id, { startDate: value })}
      />
    </TableCell>
  );
};

// Task End Date Cell
interface TaskEndDateCellProps {
  task: ProjectTask;
  onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void;
  densityClass?: string;
}

export const TaskEndDateCell: React.FC<TaskEndDateCellProps> = ({ 
  task, 
  onUpdateTask, 
  densityClass = 'py-3 px-4' 
}) => {
  return (
    <TableCell className={`table-cell ${densityClass}`}>
      <InlineDateEdit
        value={task.endDate}
        onSave={(value) => onUpdateTask(task.id, { endDate: value })}
      />
    </TableCell>
  );
};

// Task Duration Cell
interface TaskDurationCellProps {
  task: ProjectTask;
  onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void;
  densityClass?: string;
}

export const TaskDurationCell: React.FC<TaskDurationCellProps> = ({ 
  task, 
  onUpdateTask, 
  densityClass = 'py-3 px-4' 
}) => {
  return (
    <TableCell className={`table-cell ${densityClass}`}>
      <InlineTextEdit
        value={`${task.duration}`}
        onSave={(value) => {
          const duration = parseInt(value);
          if (!isNaN(duration) && duration > 0) {
            onUpdateTask(task.id, { duration });
          }
        }}
        className="text-center"
      />
      <span className="text-xs text-muted-foreground ml-1">days</span>
    </TableCell>
  );
};

// Task Progress Cell
interface TaskProgressCellProps {
  task: ProjectTask;
  densityClass?: string;
}

export const TaskProgressCell: React.FC<TaskProgressCellProps> = ({ 
  task, 
  densityClass = 'py-3 px-4' 
}) => {
  return (
    <TableCell className={`table-cell ${densityClass}`}>
      <div className="flex items-center gap-2">
        <Progress value={task.progress} className="flex-1 h-2" />
        <span className="text-xs text-muted-foreground min-w-[3ch]">
          {task.progress}%
        </span>
      </div>
    </TableCell>
  );
};

// Task Dependencies Cell - REVERTED to use DependencyManager modal
interface TaskDependenciesCellProps {
  task: ProjectTask;
  allTasks: ProjectTask[];
  onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void;
  densityClass?: string;
}

export const TaskDependenciesCell: React.FC<TaskDependenciesCellProps> = ({ 
  task, 
  allTasks, 
  onUpdateTask, 
  densityClass = 'py-3 px-4' 
}) => {
  const parseDependencies = () => {
    return task.dependencies.map(dep => {
      const parts = dep.split(':');
      return {
        taskId: parts[0],
        type: parts[1] || 'finish-to-start',
        lag: parseInt(parts[2]) || 0,
        task: allTasks.find(t => t.id === parts[0])
      };
    }).filter(dep => dep.task);
  };

  const currentDependencies = parseDependencies();

  return (
    <TableCell className={`table-cell ${densityClass}`}>
      <div className="flex items-center gap-2">
        {/* Show current dependencies count */}
        <div className="flex flex-wrap gap-1 flex-1">
          {currentDependencies.length > 0 ? (
            <>
              <Badge variant="outline" className="text-xs">
                {currentDependencies.length} dep{currentDependencies.length !== 1 ? 's' : ''}
              </Badge>
              {currentDependencies.slice(0, 2).map((dep) => (
                <Badge key={dep.taskId} variant="secondary" className="text-xs">
                  {dep.task?.name.substring(0, 10)}...
                </Badge>
              ))}
              {currentDependencies.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{currentDependencies.length - 2}
                </Badge>
              )}
            </>
          ) : (
            <span className="text-muted-foreground text-sm">None</span>
          )}
        </div>
        
        {/* Dependency Manager Modal */}
        <DependencyManager
          task={task}
          allTasks={allTasks}
          onUpdateTask={onUpdateTask}
        />
      </div>
    </TableCell>
  );
};

// Task Milestone Cell
interface TaskMilestoneCellProps {
  task: ProjectTask;
  milestones: ProjectMilestone[];
  onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void;
  densityClass?: string;
}

export const TaskMilestoneCell: React.FC<TaskMilestoneCellProps> = ({ 
  task, 
  milestones, 
  onUpdateTask, 
  densityClass = 'py-3 px-4' 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const milestoneOptions = [
    { value: '', label: 'No Milestone' },
    ...milestones.map(m => ({ value: m.id, label: m.name }))
  ];

  if (isEditing) {
    return (
      <TableCell className={`table-cell ${densityClass}`}>
        <InlineSelectEdit
          value={task.milestoneId || ''}
          options={milestoneOptions}
          onSave={(value) => {
            onUpdateTask(task.id, { milestoneId: value || undefined });
            setIsEditing(false);
          }}
        />
      </TableCell>
    );
  }

  return (
    <TableCell className={`table-cell ${densityClass}`}>
      <div 
        className="cursor-pointer"
        onClick={() => setIsEditing(true)}
      >
        {task.milestoneId ? (
          (() => {
            const milestone = milestones.find(m => m.id === task.milestoneId);
            return milestone ? (
              <Badge variant="outline" className="text-xs px-2 py-1">
                {milestone.name}
              </Badge>
            ) : <span className="text-muted-foreground text-sm">None</span>;
          })()
        ) : (
          <span className="text-muted-foreground text-sm">None</span>
        )}
      </div>
    </TableCell>
  );
};

// Task Variance Cell
interface TaskVarianceCellProps {
  task: ProjectTask;
  densityClass?: string;
}

export const TaskVarianceCell: React.FC<TaskVarianceCellProps> = ({ 
  task, 
  densityClass = 'py-3 px-4' 
}) => {
  const calculateVariance = () => {
    if (!task.baselineStartDate || !task.baselineEndDate) {
      return { text: 'No baseline', color: 'text-gray-600' };
    }
    
    const startVariance = new Date(task.startDate).getTime() - new Date(task.baselineStartDate).getTime();
    const endVariance = new Date(task.endDate).getTime() - new Date(task.baselineEndDate).getTime();
    const startDays = Math.round(startVariance / (1000 * 60 * 60 * 24));
    const endDays = Math.round(endVariance / (1000 * 60 * 60 * 24));
    
    if (startDays === 0 && endDays === 0) return { text: 'On track', color: 'text-green-600' };
    if (startDays > 0 || endDays > 0) return { text: `+${Math.max(startDays, endDays)}d`, color: 'text-red-600' };
    return { text: `${Math.min(startDays, endDays)}d`, color: 'text-blue-600' };
  };

  const variance = calculateVariance();

  return (
    <TableCell className={`table-cell ${densityClass}`}>
      <span className={`text-sm font-medium ${variance.color}`}>
        {variance.text}
      </span>
    </TableCell>
  );
};
