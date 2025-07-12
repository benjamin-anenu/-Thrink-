import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import TaskColumn, { Column } from './TaskColumn';
import TaskDetailModal from './TaskDetailModal';
import { Task } from './TaskCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Users, Clock, Target } from 'lucide-react';

// Updated initial data for project management focus
const initialColumns: Column[] = [
  {
    id: 'planning',
    title: 'Planning',
    color: 'muted',
    tasks: [
      {
        id: 't1',
        title: 'Project Atlas - Payment Gateway Integration',
        description: 'Set up secure payment processing for client transactions',
        tag: { color: 'blue', label: 'Development' },
        dueDate: 'Dec 15',
        assignees: 2,
        progress: { completed: 1, total: 5 },
        health: { status: 'yellow', score: 75 },
        project: 'Project Atlas'
      },
      {
        id: 't2',
        title: 'Stakeholder Onboarding - Beta Users',
        description: 'Create onboarding flow for beta test participants',
        tag: { color: 'purple', label: 'Design' },
        dueDate: 'Dec 18',
        assignees: 1,
        progress: { completed: 0, total: 4 },
        health: { status: 'green', score: 85 },
        project: 'User Experience'
      },
      {
        id: 't3',
        title: 'Resource Allocation Q1 Planning',
        description: 'Plan team capacity and skill assignments for Q1',
        tag: { color: 'accent', label: 'Management' },
        dueDate: 'Dec 20',
        assignees: 2,
        progress: { completed: 0, total: 3 },
        health: { status: 'green', score: 90 },
        project: 'Operations'
      }
    ]
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    color: 'blue',
    tasks: [
      {
        id: 't4',
        title: 'AI Dashboard Development',
        description: 'Build intelligent project health monitoring dashboard',
        tag: { color: 'blue', label: 'Development' },
        dueDate: 'Dec 12',
        assignees: 3,
        progress: { completed: 3, total: 6 },
        health: { status: 'green', score: 88 },
        project: 'Planova Core'
      },
      {
        id: 't5',
        title: 'Milo AI Assistant Integration',
        description: 'Implement conversational AI for project insights',
        tag: { color: 'purple', label: 'AI/ML' },
        dueDate: 'Dec 14',
        assignees: 2,
        progress: { completed: 4, total: 7 },
        health: { status: 'yellow', score: 72 },
        project: 'Planova Core'
      },
      {
        id: 't6',
        title: 'Timeline Baseline Tracking',
        description: 'Implement project timeline variance monitoring',
        tag: { color: 'accent', label: 'Features' },
        dueDate: 'Dec 16',
        assignees: 1,
        progress: { completed: 2, total: 4 },
        health: { status: 'green', score: 82 },
        project: 'Project Tools'
      }
    ]
  },
  {
    id: 'review',
    title: 'Review',
    color: 'amber',
    tasks: [
      {
        id: 't7',
        title: 'Stakeholder Communication Matrix',
        description: 'Define escalation paths and communication preferences',
        tag: { color: 'accent', label: 'Management' },
        dueDate: 'Dec 10',
        assignees: 1,
        progress: { completed: 3, total: 3 },
        health: { status: 'green', score: 95 },
        project: 'Operations'
      },
      {
        id: 't8',
        title: 'Resource Skills Assessment',
        description: 'Evaluate team capabilities and identify skill gaps',
        tag: { color: 'purple', label: 'HR' },
        dueDate: 'Dec 11',
        assignees: 2,
        progress: { completed: 4, total: 5 },
        health: { status: 'yellow', score: 78 },
        project: 'Team Development'
      }
    ]
  },
  {
    id: 'completed',
    title: 'Completed',
    color: 'accent',
    tasks: [
      {
        id: 't9',
        title: 'Project Health Scoring Algorithm',
        description: 'Developed automated R/Y/G project health indicators',
        tag: { color: 'blue', label: 'Development' },
        dueDate: 'Dec 8',
        assignees: 1,
        progress: { completed: 5, total: 5 },
        health: { status: 'green', score: 100 },
        project: 'Planova Core'
      },
      {
        id: 't10',
        title: 'Automated Notification System',
        description: 'Built multi-channel notification delivery system',
        tag: { color: 'blue', label: 'Development' },
        dueDate: 'Dec 5',
        assignees: 2,
        progress: { completed: 6, total: 6 },
        health: { status: 'green', score: 100 },
        project: 'Infrastructure'
      },
      {
        id: 't11',
        title: 'Executive Dashboard Prototype',
        description: 'Created portfolio-level project overview interface',
        tag: { color: 'purple', label: 'Design' },
        dueDate: 'Dec 3',
        assignees: 1,
        progress: { completed: 4, total: 4 },
        health: { status: 'green', score: 100 },
        project: 'Analytics'
      }
    ]
  }
];

interface TaskBoardProps {
  className?: string;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ className }) => {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragSourceColumn, setDragSourceColumn] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const { toast } = useToast();

  const filteredColumns = columns.map(column => ({
    ...column,
    tasks: column.tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (task.project && task.project.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPriority = filterPriority === 'all' || 
                             (task.health && 
                              ((filterPriority === 'high' && task.health.status === 'red') ||
                               (filterPriority === 'medium' && task.health.status === 'yellow') ||
                               (filterPriority === 'low' && task.health.status === 'green')));
      
      return matchesSearch && matchesPriority;
    })
  }));

  const totalTasks = columns.reduce((sum, col) => sum + col.tasks.length, 0);
  const completedTasks = columns.find(col => col.id === 'completed')?.tasks.length || 0;
  const inProgressTasks = columns.find(col => col.id === 'in-progress')?.tasks.length || 0;

  const handleTaskDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('taskId', task.id);
    setDraggedTask(task);
    
    // Find source column
    const sourceColumn = columns.find(col => 
      col.tasks.some(t => t.id === task.id)
    );
    
    if (sourceColumn) {
      setDragSourceColumn(sourceColumn.id);
      e.dataTransfer.setData('sourceColumnId', sourceColumn.id);
    }
  };

  const handleTaskDragEnd = () => {
    setDraggedTask(null);
    setDragSourceColumn(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Handle drag leave logic if needed
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    
    const taskId = e.dataTransfer.getData('taskId');
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId');
    
    if (!taskId || !sourceColumnId || sourceColumnId === targetColumnId) {
      return;
    }
    
    // Update columns state
    const newColumns = columns.map(column => {
      // Remove task from source column
      if (column.id === sourceColumnId) {
        return {
          ...column,
          tasks: column.tasks.filter(task => task.id !== taskId)
        };
      }
      
      // Add task to target column
      if (column.id === targetColumnId) {
        const taskToMove = columns.find(col => col.id === sourceColumnId)?.tasks.find(task => task.id === taskId);
        if (taskToMove) {
          return {
            ...column,
            tasks: [...column.tasks, taskToMove]
          };
        }
      }
      
      return column;
    });
    
    setColumns(newColumns);
    
    // Show a toast notification with Milo's friendly tone
    const targetColumn = columns.find(col => col.id === targetColumnId);
    if (targetColumn && draggedTask) {
      toast({
        title: "Nice work! 🎯",
        description: `Moved "${draggedTask.title}" to ${targetColumn.title}. Milo says: Keep up the momentum!`,
      });
    }
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    // This function can be used for programmatic status changes
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleTaskSave = (updatedTask: Task) => {
    const newColumns = columns.map(column => ({
      ...column,
      tasks: column.tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    }));
    setColumns(newColumns);
    toast({
      title: "Task Updated ✅",
      description: `"${updatedTask.title}" has been updated successfully.`,
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Task Board Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Task Board</h2>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{totalTasks} Total</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{inProgressTasks} In Progress</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{completedTasks} Completed</span>
            </div>
          </div>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-1">
            <Badge 
              variant={filterPriority === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilterPriority('all')}
            >
              All
            </Badge>
            <Badge 
              variant={filterPriority === 'high' ? 'default' : 'outline'}
              className="cursor-pointer bg-red-100 text-red-800 border-red-200"
              onClick={() => setFilterPriority('high')}
            >
              High Priority
            </Badge>
            <Badge 
              variant={filterPriority === 'medium' ? 'default' : 'outline'}
              className="cursor-pointer bg-yellow-100 text-yellow-800 border-yellow-200"
              onClick={() => setFilterPriority('medium')}
            >
              Medium Priority
            </Badge>
            <Badge 
              variant={filterPriority === 'low' ? 'default' : 'outline'}
              className="cursor-pointer bg-green-100 text-green-800 border-green-200"
              onClick={() => setFilterPriority('low')}
            >
              Low Priority
            </Badge>
          </div>
        </div>
      </div>

      {/* Task Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {filteredColumns.map(column => (
          <TaskColumn
            key={column.id}
            column={column}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onTaskDragStart={handleTaskDragStart}
            onTaskDragEnd={handleTaskDragEnd}
            onStatusChange={handleStatusChange}
            onTaskClick={handleTaskClick}
          />
        ))}
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setSelectedTask(null);
        }}
        onSave={handleTaskSave}
      />
    </div>
  );
};

export default TaskBoard;
