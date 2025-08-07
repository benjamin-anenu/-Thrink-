
import React, { useState } from 'react';
import { ProjectTask } from '@/types/project';
import { TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, AlertTriangle, Bug } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import RebaselineDialog from './RebaselineDialog';

interface TaskActionsCellProps {
  task: ProjectTask;
  projectId?: string;
  onEdit?: (task: ProjectTask) => void;
  onDelete?: (taskId: string) => void;
  onRebaseline?: (taskId: string, newStartDate: string, newEndDate: string, reason: string) => void;
  isDelayed?: boolean;
  onEditTask?: (task: ProjectTask) => void;
  onDeleteTask?: (taskId: string) => void;
  onRebaselineTask?: (taskId: string, newStartDate: string, newEndDate: string, reason: string) => void;
  densityClass?: string;
  disabled?: boolean;
  issueCount?: number;
}

const TaskActionsCell: React.FC<TaskActionsCellProps> = ({
  task,
  projectId,
  isDelayed = false,
  onEditTask,
  onDeleteTask,
  onRebaselineTask,
  onEdit,
  onDelete,
  onRebaseline,
  densityClass = 'py-3 px-4',
  disabled = false,
  issueCount = 0
}) => {
  const navigate = useNavigate();
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

  const handleViewTaskIssues = () => {
    if (projectId) {
      navigate(`/project/${projectId}?tab=issues&taskFilter=${task.id}`);
    }
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
          {/* Issues Button */}
          {issueCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewTaskIssues}
              className="h-8 w-8 p-0 relative"
              title={`View ${issueCount} issue(s) for this task`}
            >
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center min-w-4"
              >
                {issueCount}
              </Badge>
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
