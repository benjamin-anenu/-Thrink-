import React, { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import TaskColumn from './TaskColumn';
import { useTask, type Task as ContextTask } from '@/contexts/TaskContext';
import { Task as TaskCardType } from './TaskCard';
import { ProjectTask } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Filter, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import TaskDetailModal from './TaskDetailModal';

const TASK_COLUMNS: Array<{ id: ContextTask['status']; title: string }> = [
  { id: 'Not Started', title: 'To Do' },
  { id: 'In Progress', title: 'In Progress' },
  { id: 'On Hold', title: 'Blocked' },
  { id: 'Completed', title: 'Done' },
  { id: 'Cancelled', title: 'Cancelled' },
];

// Helper function to convert ContextTask to TaskCardType
const convertToTaskCardType = (task: ContextTask): TaskCardType => ({
  id: task.id,
  title: task.name,
  description: task.description || '',
  tag: {
    color: task.priority === 'Critical' ? 'red' : task.priority === 'High' ? 'orange' : 'blue',
    label: task.priority
  },
  dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date',
  assignees: 1, // Default assignee count
  progress: {
    completed: task.status === 'Completed' ? 1 : 0,
    total: 1
  },
  status: task.status
});

interface TaskBoardProps {
  tasks?: ContextTask[] | ProjectTask[];
  onTaskUpdate?: (taskId: string, newStatus: string) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks: propTasks, onTaskUpdate }) => {
  const { tasks: contextTasks, updateTaskStatus } = useTask();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Use prop tasks if provided, otherwise use context tasks
  const tasks = propTasks || contextTasks;

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as ContextTask['status'];

    try {
      if (onTaskUpdate) {
        onTaskUpdate(taskId, newStatus);
      } else {
        await updateTaskStatus(taskId, newStatus);
      }
      toast({
        title: 'Task Updated',
        description: `Task moved to ${TASK_COLUMNS.find(col => col.id === newStatus)?.title}`,
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive',
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    return task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const tasksByStatus = TASK_COLUMNS.reduce((acc, column) => {
    const columnTasks = filteredTasks.filter(task => task.status === column.id);
    acc[column.id] = columnTasks.map(convertToTaskCardType);
    return acc;
  }, {} as Record<ContextTask['status'], TaskCardType[]>);

  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-6 p-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-[300px]"
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => setFilterOpen(!filterOpen)}>
          <Filter className="h-4 w-4" />
        </Button>
        <Button onClick={() => setSelectedTaskId('new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 p-4 overflow-x-auto">
          {TASK_COLUMNS.map(col => (
            <TaskColumn
              key={col.id}
              column={{ ...col, color: '', tasks: tasksByStatus[col.id] }}
              onDrop={() => {}}
              onDragOver={() => {}}
              onDragLeave={() => {}}
              onTaskDragStart={() => {}}
              onTaskDragEnd={() => {}}
              onStatusChange={(taskId, newStatus) => {
                if (onTaskUpdate) {
                  onTaskUpdate(taskId, newStatus);
                } else {
                  updateTaskStatus(taskId, newStatus as ContextTask['status']);
                }
              }}
            />
          ))}
        </div>
      </DragDropContext>

      {/* Task Detail Modal */}
      {selectedTaskId && selectedTask && (
        <TaskDetailModal
          task={selectedTask as any}
          isOpen={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
};

export default TaskBoard;