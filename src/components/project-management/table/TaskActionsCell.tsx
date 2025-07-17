
import React from 'react';
import { ProjectTask } from '@/types/project';
import { TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';

interface TaskActionsCellProps {
  task: ProjectTask;
  isDelayed: boolean;
  onEditTask: (task: ProjectTask) => void;
  onDeleteTask: (taskId: string) => void;
  onRebaselineTask: (task: ProjectTask) => void;
  densityClass?: string;
}

const TaskActionsCell: React.FC<TaskActionsCellProps> = ({
  task,
  isDelayed,
  onEditTask,
  onDeleteTask,
  onRebaselineTask,
  densityClass = 'py-3 px-4'
}) => {
  return (
    <TableCell className={`table-cell ${densityClass}`}>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEditTask(task)}
          className="h-8 w-8 p-0"
          title="Edit task"
        >
          <Edit className="h-4 w-4" />
        </Button>
        {isDelayed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRebaselineTask(task)}
            className="h-8 w-8 p-0 text-orange-500 hover:text-orange-600"
            title="Rebaseline task - update baseline dates to current dates"
          >
            <AlertTriangle className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteTask(task.id)}
          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          title="Delete task"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </TableCell>
  );
};

export default TaskActionsCell;
