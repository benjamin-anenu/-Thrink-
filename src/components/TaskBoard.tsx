import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import TaskColumn, { Column } from './TaskColumn';
import { Task } from './TaskCard';

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
  const { toast } = useToast();

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

  return (
    <div className={`flex gap-4 overflow-x-auto pb-4 ${className}`}>
      {columns.map(column => (
        <TaskColumn
          key={column.id}
          column={column}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onTaskDragStart={handleTaskDragStart}
          onTaskDragEnd={handleTaskDragEnd}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  );
};

export default TaskBoard;
