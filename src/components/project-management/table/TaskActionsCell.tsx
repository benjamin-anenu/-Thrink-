
import React, { useState } from 'react';
import { ProjectTask } from '@/types/project';
import { TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';
import RebaselineDialog from './RebaselineDialog';

interface TaskActionsCellProps {
  task: ProjectTask;
  onEdit?: (task: ProjectTask) => void;
  onDelete?: (taskId: string) => void;
  onRebaseline?: (taskId: string, newStartDate: string, newEndDate: string, reason: string) => void;
  isDelayed?: boolean;
  onEditTask?: (task: ProjectTask) => void;
  onDeleteTask?: (taskId: string) => void;
  onRebaselineTask?: (taskId: string, newStartDate: string, newEndDate: string, reason: string) => void;
  densityClass?: string;
  disabled?: boolean;
}

const TaskActionsCell: React.FC<TaskActionsCellProps> = ({
  task,
  isDelayed = false,
  onEditTask,
  onDeleteTask,
  onRebaselineTask,
  onEdit,
  onDelete,
  onRebaseline,
  densityClass = 'py-3 px-4',
  disabled = false
}) => {
  // Use the newer prop names if available, otherwise fallback to old ones
  const handleEdit = onEdit || onEditTask;
  const handleDelete = onDelete || onDeleteTask;
  const handleRebaselineAction = onRebaseline || onRebaselineTask;
  const [showRebaselineDialog, setShowRebaselineDialog] = useState(false);

  const handleRebaselineClick = () => {
    setShowRebaselineDialog(true);
  };

  const handleRebaseline = (taskId: string, newStartDate: string, newEndDate: string, reason: string) => {
    if (handleRebaselineAction) {
      handleRebaselineAction(taskId, newStartDate, newEndDate, reason);
    }
    setShowRebaselineDialog(false);
  };

  return (
    <>
      <TableCell className={`table-cell ${densityClass}`}>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => !disabled && handleEdit?.(task)}
            className="h-8 w-8 p-0"
            title={disabled ? "Editing disabled" : "Edit task"}
            disabled={disabled}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {isDelayed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => !disabled && handleRebaselineClick()}
              className="h-8 w-8 p-0 text-orange-500 hover:text-orange-600"
              title={disabled ? "Editing disabled" : "Rebaseline task - update baseline dates to current dates"}
              disabled={disabled}
            >
              <AlertTriangle className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => !disabled && handleDelete?.(task.id)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            title={disabled ? "Editing disabled" : "Delete task"}
            disabled={disabled}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>

      <RebaselineDialog
        open={showRebaselineDialog}
        onOpenChange={setShowRebaselineDialog}
        task={task}
        onRebaseline={handleRebaseline}
      />
    </>
  );
};

export default TaskActionsCell;
