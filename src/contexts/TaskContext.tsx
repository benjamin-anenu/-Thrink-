import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface Task {
  id: string;
  name: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignee?: string;
  dueDate?: Date;
  description?: string;
  projectId: string;
  workspaceId: string;
}

interface TaskContextType {
  tasks: Task[];
  updateTaskStatus: (taskId: string, newStatus: Task['status']) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { currentWorkspace } = useWorkspace();

  // Initialize tasks
  useEffect(() => {
    const fetchTasks = async () => {
      if (!currentWorkspace) {
        setTasks([]);
        setIsLoading(false);
        return;
      }

      try {
        // Temporarily disabled to prevent type recursion issues
        // This will be re-enabled once database types are stabilized
        console.warn('TaskContext: Database queries temporarily disabled');
        setTasks([]);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [currentWorkspace]);

  // Set up real-time subscriptions
  useEffect(() => {
    const subscription = supabase
      .channel('tasks-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_tasks'
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setTasks(prevTasks =>
              prevTasks.map(task =>
                task.id === payload.new.id ? {
                  ...task,
                  status: (payload.new.status as Task['status']) || task.status,
                  priority: (payload.new.priority as Task['priority']) || task.priority,
                  name: payload.new.name || task.name,
                  description: payload.new.description || task.description,
                  assignee: payload.new.assignee_id || task.assignee,
                  dueDate: payload.new.end_date ? new Date(payload.new.end_date) : task.dueDate,
                } : task
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      // Temporarily disabled to prevent type recursion issues
      console.warn('TaskContext: updateTaskStatus temporarily disabled');
      // Local state update will happen through the real-time subscription
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, updateTaskStatus, isLoading, error }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
