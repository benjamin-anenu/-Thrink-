
import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Edit2, Trash2, Clock } from 'lucide-react';
import { ProjectTask, ProjectMilestone } from '@/types/project';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import TaskActionsCell from './TaskActionsCell';
import InlineTextEdit from './InlineTextEdit';
import InlineSelectEdit from './InlineSelectEdit';
import InlineMultiSelectEdit from './InlineMultiSelectEdit';
import InlineDateEdit from './InlineDateEdit';
import InlineDependencyEdit from './InlineDependencyEdit';

interface TaskTableRowProps {
  task: ProjectTask;
  milestones: ProjectMilestone[];
  availableResources: Array<{ id: string; name: string; role: string; email?: string }>;
  availableStakeholders: Array<{ id: string; name: string; role: string; email?: string }>;
  allTasks: ProjectTask[];
  onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: ProjectTask) => void;
  onRebaselineTask: (taskId: string, newStartDate: string, newEndDate: string, reason: string) => void;
  densityClass: string;
  issueCount?: number;
  onIssueWarningClick?: (taskId: string) => void;
}

const TaskTableRow: React.FC<TaskTableRowProps> = ({
  task,
  milestones,
  availableResources,
  availableStakeholders,
  allTasks,
  onUpdateTask,
  onDeleteTask,
  onEditTask,
  onRebaselineTask,
  densityClass,
  issueCount = 0,
  onIssueWarningClick
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleFieldUpdate = (field: keyof ProjectTask, value: any) => {
    onUpdateTask(task.id, { [field]: value });
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return format(new Date(date), 'MMM d, yyyy');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      case 'Blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateVariance = () => {
    if (!task.startDate || !task.baselineStartDate) return null;
    const actual = new Date(task.startDate);
    const baseline = new Date(task.baselineStartDate);
    const diffTime = actual.getTime() - baseline.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const variance = calculateVariance();
  const getVarianceColor = (variance: number | null) => {
    if (variance === null) return 'text-muted-foreground';
    if (variance === 0) return 'text-green-600';
    if (variance > 0) return 'text-red-600';
    return 'text-blue-600';
  };

  const formatVariance = (variance: number | null) => {
    if (variance === null) return '-';
    if (variance === 0) return 'On track';
    if (variance > 0) return `+${variance}d`;
    return `${variance}d`;
  };

  // Fix the options to ensure they're in the correct format
  const statusOptions = [
    { value: 'Not Started', label: 'Not Started' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Blocked', label: 'Blocked' }
  ];
  
  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' }
  ];

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className={cn("font-medium", densityClass)}>
        <InlineTextEdit
          value={task.name}
          onSave={(value) => handleFieldUpdate('name', value)}
          placeholder="Task name"
        />
      </TableCell>

      <TableCell className={densityClass}>
        <InlineSelectEdit
          value={task.status || 'Not Started'}
          options={statusOptions}
          onSave={(value) => handleFieldUpdate('status', value)}
          renderValue={(value) => (
            <Badge className={getStatusColor(value)}>
              {value}
            </Badge>
          )}
        />
      </TableCell>

      <TableCell className={densityClass}>
        <InlineSelectEdit
          value={task.priority || 'Medium'}
          options={priorityOptions}
          onSave={(value) => handleFieldUpdate('priority', value)}
          renderValue={(value) => (
            <Badge className={getPriorityColor(value)}>
              {value}
            </Badge>
          )}
        />
      </TableCell>

      <TableCell className={densityClass}>
        <InlineMultiSelectEdit
          value={task.assignedResources || []}
          options={availableResources.map(r => ({ id: r.id, name: r.name }))}
          onSave={(value) => handleFieldUpdate('assignedResources', value)}
          placeholder="Assign resources"
        />
      </TableCell>

      <TableCell className={densityClass}>
        <InlineDateEdit
          value={task.startDate || ''}
          onSave={(value) => handleFieldUpdate('startDate', value)}
          placeholder="Start date"
        />
      </TableCell>

      <TableCell className={densityClass}>
        <InlineDateEdit
          value={task.endDate || ''}
          onSave={(value) => handleFieldUpdate('endDate', value)}
          placeholder="End date"
        />
      </TableCell>

      <TableCell className={cn("text-center", densityClass)}>
        <span className="text-sm text-muted-foreground">
          {task.duration || 1} day{(task.duration || 1) !== 1 ? 's' : ''}
        </span>
      </TableCell>

      <TableCell className={densityClass}>
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(task.progress || 0, 100)}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground w-10">
            {task.progress || 0}%
          </span>
        </div>
      </TableCell>

      <TableCell className={densityClass}>
        <InlineDependencyEdit
          value={task.dependencies || []}
          allTasks={allTasks}
          currentTaskId={task.id}
          onSave={(dependencies) => handleFieldUpdate('dependencies', dependencies)}
        />
      </TableCell>

      <TableCell className={densityClass}>
        <InlineSelectEdit
          value={task.milestoneId || ''}
          options={[
            { value: '', label: 'No milestone' },
            ...milestones.map(m => ({ value: m.id, label: m.name }))
          ]}
          onSave={(value) => handleFieldUpdate('milestoneId', value || undefined)}
          renderValue={(value) => {
            if (!value) return <span className="text-muted-foreground">None</span>;
            const milestone = milestones.find(m => m.id === value);
            return milestone ? (
              <Badge variant="outline">{milestone.name}</Badge>
            ) : (
              <span className="text-muted-foreground">None</span>
            );
          }}
        />
      </TableCell>

      <TableCell className={cn(getVarianceColor(variance), densityClass)}>
        <div className="flex items-center gap-1">
          {variance !== null && variance !== 0 && (
            <Clock className="h-3 w-3" />
          )}
          <span className="text-sm">
            {formatVariance(variance)}
          </span>
        </div>
      </TableCell>

      <TableCell className={densityClass}>
        {issueCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onIssueWarningClick?.(task.id)}
            className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
          >
            <AlertTriangle className="h-4 w-4" />
            <span className="sr-only">{issueCount} issue{issueCount > 1 ? 's' : ''}</span>
          </Button>
        )}
      </TableCell>

      <TableCell className={densityClass}>
        <TaskActionsCell
          task={task}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onRebaseline={onRebaselineTask}
        />
      </TableCell>
    </TableRow>
  );
};

export default TaskTableRow;
