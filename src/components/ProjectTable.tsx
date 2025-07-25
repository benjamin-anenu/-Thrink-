import React from 'react';
import { useTask, Task } from '@/contexts/TaskContext';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ProjectTable = () => {
  const { tasks, updateTaskStatus, isLoading, error } = useTask();
  const { toast } = useToast();

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (error) {
      toast({
        title: "Error updating task",
        description: "Failed to update task status. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="w-full text-center py-8">Loading tasks...</div>;
  }
  if (error) {
    return <div className="w-full text-center py-8 text-destructive">Error loading tasks: {error.message}</div>;
  }

  // Status values from context
  const STATUS_OPTIONS = [
    { value: 'To Do', label: 'To Do' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Blocked', label: 'Blocked' },
    { value: 'Done', label: 'Done' },
    { value: 'On Hold', label: 'On Hold' },
  ];

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>{task.name || '-'}</TableCell>
              <TableCell>
                <Select
                  value={task.status}
                  onValueChange={(value) => handleStatusChange(task.id, value as Task['status'])}
                >
                  <SelectTrigger>
                    <SelectValue>{STATUS_OPTIONS.find(opt => opt.value === task.status)?.label || task.status}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{task.priority ?? '-'}</TableCell>
              <TableCell>{task.assignee ?? '-'}</TableCell>
              <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectTable;
