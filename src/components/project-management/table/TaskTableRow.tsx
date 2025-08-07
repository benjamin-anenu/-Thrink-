import React, { useState, useEffect } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Edit2, Trash2, Clock, CheckCircle, XCircle, Lock } from 'lucide-react';
import { ProjectTask, ProjectMilestone } from '@/types/project';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import TaskActionsCell from './TaskActionsCell';
import InlineTextEdit from './InlineTextEdit';
import InlineSelectEdit from './InlineSelectEdit';
import InlineMultiSelectEdit from './InlineMultiSelectEdit';
import InlineDateEdit from './InlineDateEdit';
import InlineDependencyEdit from './InlineDependencyEdit';
import { DependencyCalculationService } from '@/services/DependencyCalculationService';

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
  projectId?: string;
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
  onIssueWarningClick,
  projectId
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [cascadeUpdates, setCascadeUpdates] = useState<Array<{
    taskId: string;
    oldStartDate: string | null;
    newStartDate: string | null;
    oldEndDate: string | null;
    newEndDate: string | null;
    updateReason: string;
  }>>([]);
  const [showCascadeNotification, setShowCascadeNotification] = useState(false);
  const [isCriticalPath, setIsCriticalPath] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if task is on critical path
  useEffect(() => {
    const checkCriticalPath = async () => {
      try {
        const criticalPath = await DependencyCalculationService.getCriticalPath(projectId || '');
        const isOnCriticalPath = criticalPath.some(cp => cp.taskId === task.id && cp.isCritical);
        setIsCriticalPath(isOnCriticalPath);
      } catch (error) {
        console.error('Error checking critical path:', error);
      }
    };

    if (projectId) {
      checkCriticalPath();
    }
  }, [task.id, projectId]);

  const handleFieldUpdate = async (field: keyof ProjectTask, value: any) => {
    try {
      setIsUpdating(true);
      console.log('TaskTableRow: Updating field', field, 'with value:', value);

      // Handle dependency updates with enhanced cascade logic
      if (field === 'dependencies') {
        console.log('TaskTableRow: Processing dependency update');
        
        // Update the task first
        await onUpdateTask(task.id, { [field]: value });
        
        // Show loading toast
        const loadingToast = toast.loading('Updating task dependencies and calculating dates...');
        
        try {
          // Recalculate dates for the current task
          console.log('TaskTableRow: Recalculating dates for current task');
          const dateResult = await DependencyCalculationService.calculateTaskDatesFromDependencies(
            task.id,
            task.duration,
            value
          );
          
          // Update current task dates if calculated and not manually overridden
          if (dateResult.suggestedStartDate && dateResult.suggestedEndDate && !task.manualOverrideDates) {
            console.log('TaskTableRow: Updating current task dates:', {
              startDate: dateResult.suggestedStartDate,
              endDate: dateResult.suggestedEndDate
            });
            
            await onUpdateTask(task.id, {
              startDate: dateResult.suggestedStartDate,
              endDate: dateResult.suggestedEndDate
            });
          }
          
          // Then trigger cascade updates for dependent tasks
          const cascadeResult = await DependencyCalculationService.cascadeDependencyUpdates(task.id);
          
          console.log('TaskTableRow: Cascade result:', cascadeResult);
          
          if (cascadeResult.totalUpdated > 0) {
            setCascadeUpdates(cascadeResult.updatedTasks);
            setShowCascadeNotification(true);
            
            toast.success(`Dependencies updated! Task dates recalculated and ${cascadeResult.totalUpdated} dependent task${cascadeResult.totalUpdated !== 1 ? 's' : ''} adjusted automatically.`, {
              id: loadingToast,
              duration: 7000
            });
            
            // Hide notification after 7 seconds
            setTimeout(() => {
              setShowCascadeNotification(false);
              setCascadeUpdates([]);
            }, 7000);
          } else {
            const message = dateResult.suggestedStartDate && !task.manualOverrideDates 
              ? 'Dependencies updated and task dates recalculated!' 
              : 'Dependencies updated successfully!';
            toast.success(message, {
              id: loadingToast
            });
          }
        } catch (cascadeError) {
          console.error('TaskTableRow: Cascade error:', cascadeError);
          toast.error('Dependencies updated, but date calculation failed. Please check for conflicts.', {
            id: loadingToast
          });
        }
      } 
      // Handle date updates with manual override logic
      else if (field === 'startDate' || field === 'endDate') {
        console.log('TaskTableRow: Date updated, setting manual override and triggering cascade');
        
        // Set manual override flag when dates are manually changed
        await onUpdateTask(task.id, { 
          [field]: value,
          manualOverrideDates: true
        });
        
        try {
          const cascadeResult = await DependencyCalculationService.cascadeDependencyUpdates(task.id);
          
          if (cascadeResult.totalUpdated > 0) {
            setCascadeUpdates(cascadeResult.updatedTasks);
            setShowCascadeNotification(true);
            
            toast.success(`Task updated with manual dates! ${cascadeResult.totalUpdated} dependent task${cascadeResult.totalUpdated !== 1 ? 's' : ''} adjusted automatically.`);
            
            setTimeout(() => {
              setShowCascadeNotification(false);
              setCascadeUpdates([]);
            }, 5000);
          } else {
            toast.success('Task dates updated with manual override!');
          }
        } catch (cascadeError) {
          console.error('TaskTableRow: Cascade error after date update:', cascadeError);
          toast.success('Task dates updated! Some dependent tasks may need manual adjustment.');
        }
      }
      // Handle manual override reset
      else if (field === 'manualOverrideDates' && value === false) {
        console.log('TaskTableRow: Resetting manual override, recalculating dates');
        
        // First remove the manual override flag
        await onUpdateTask(task.id, { manualOverrideDates: false });
        
        // Then recalculate dates based on dependencies
        if (task.dependencies && task.dependencies.length > 0) {
          try {
            const dateResult = await DependencyCalculationService.calculateTaskDatesFromDependencies(
              task.id,
              task.duration,
              task.dependencies
            );
            
            if (dateResult.suggestedStartDate && dateResult.suggestedEndDate) {
              await onUpdateTask(task.id, {
                startDate: dateResult.suggestedStartDate,
                endDate: dateResult.suggestedEndDate
              });
              
              toast.success('Manual override removed and dates recalculated based on dependencies!');
            } else {
              toast.success('Manual override removed!');
            }
          } catch (error) {
            console.error('Error recalculating dates after removing manual override:', error);
            toast.warning('Manual override removed, but date recalculation failed.');
          }
        } else {
          toast.success('Manual override removed!');
        }
      } else {
        // Handle other field updates
        await onUpdateTask(task.id, { [field]: value });
        toast.success('Task updated successfully!');
      }
    } catch (error) {
      console.error('TaskTableRow: Update error:', error);
      toast.error(`Failed to update task: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
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
    <>
      <TableRow className={cn(
        "hover:bg-muted/50 relative",
        isCriticalPath && "bg-red-50 border-l-4 border-red-500",
        isUpdating && "opacity-60"
      )}>
        {/* Critical Path Indicator */}
        {isCriticalPath && (
          <div className="absolute top-1 right-1">
            <Badge variant="destructive" className="text-xs">
              Critical
            </Badge>
          </div>
        )}

        {/* Manual Override Indicator */}
        {task.manualOverrideDates && (
          <div className="absolute top-1 left-1">
            <Badge 
              variant="outline" 
              className="text-xs cursor-pointer hover:bg-muted"
              onClick={() => handleFieldUpdate('manualOverrideDates', false)}
              title="Click to remove manual override and recalculate dates"
            >
              <Lock className="h-3 w-3 mr-1" />
              Manual
            </Badge>
          </div>
        )}

        {/* Update Status Indicator */}
        {isUpdating && (
          <div className="absolute top-1 right-1">
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1 animate-spin" />
              Updating...
            </Badge>
          </div>
        )}

        {/* Cascade Update Notification */}
        {showCascadeNotification && (
          <div className="absolute top-0 left-0 right-0 z-10 bg-blue-100 border border-blue-200 rounded-md p-2 mx-2 mt-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Updated {cascadeUpdates.length} dependent task{cascadeUpdates.length !== 1 ? 's' : ''} due to dependency changes
              </span>
            </div>
          </div>
        )}

        {/* Task Name */}
        <TableCell className={cn("font-medium", densityClass)}>
          <InlineTextEdit
            value={task.name}
            onSave={(value) => handleFieldUpdate('name', value)}
            placeholder="Task name"
            disabled={isUpdating}
          />
        </TableCell>

        {/* Status */}
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
            disabled={isUpdating}
          />
        </TableCell>

        {/* Priority */}
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
            disabled={isUpdating}
          />
        </TableCell>

        {/* Resources */}
        <TableCell className={densityClass}>
          <InlineMultiSelectEdit
            value={task.assignedResources || []}
            options={availableResources.map(r => ({ id: r.id, name: r.name }))}
            onSave={(value) => handleFieldUpdate('assignedResources', value)}
            placeholder="Assign resources"
            disabled={isUpdating}
          />
        </TableCell>

        {/* Start Date */}
        <TableCell className={densityClass}>
          <div className="flex items-center gap-2">
            <InlineDateEdit
              value={task.startDate || ''}
              onSave={(value) => handleFieldUpdate('startDate', value)}
              placeholder="Start date"
              disabled={isUpdating}
            />
            {task.manualOverrideDates && (
              <Badge variant="outline" className="text-xs">
                <Lock className="h-3 w-3" />
              </Badge>
            )}
          </div>
        </TableCell>

        {/* End Date */}
        <TableCell className={densityClass}>
          <div className="flex items-center gap-2">
            <InlineDateEdit
              value={task.endDate || ''}
              onSave={(value) => handleFieldUpdate('endDate', value)}
              placeholder="End date"
              disabled={isUpdating}
            />
            {task.manualOverrideDates && (
              <Badge variant="outline" className="text-xs">
                <Lock className="h-3 w-3" />
              </Badge>
            )}
          </div>
        </TableCell>

        {/* Duration */}
        <TableCell className={cn("text-center", densityClass)}>
          <span className="text-sm text-muted-foreground">
            {task.duration || 1} day{(task.duration || 1) !== 1 ? 's' : ''}
          </span>
        </TableCell>

        {/* Progress */}
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

        {/* Dependencies - Enhanced with full editing capabilities */}
        <TableCell className={densityClass}>
          <InlineDependencyEdit
            value={task.dependencies || []}
            allTasks={allTasks}
            currentTaskId={task.id}
            onSave={(dependencies) => handleFieldUpdate('dependencies', dependencies)}
            disabled={isUpdating}
          />
        </TableCell>

        {/* Milestone */}
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
            disabled={isUpdating}
          />
        </TableCell>

        {/* Variance */}
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

        {/* Actions */}
        <TableCell className={densityClass}>
          <TaskActionsCell
            task={task}
            projectId={projectId}
            issueCount={issueCount}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onRebaseline={onRebaselineTask}
            disabled={isUpdating}
          />
        </TableCell>
      </TableRow>
    </>
  );
};

export default TaskTableRow;
