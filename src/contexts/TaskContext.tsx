import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Task {
  id: string;
  name: string;
  status: 'To Do' | 'In Progress' | 'Blocked' | 'Done' | 'On Hold';
  priority: 'High' | 'Medium' | 'Low';
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

  // Initialize tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*');

        if (error) throw error;
        setTasks(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const subscription = supabase
      .channel('tasks-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setTasks(prevTasks =>
              prevTasks.map(task =>
                task.id === payload.new.id ? { ...task, ...payload.new } : task
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
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .match({ id: taskId });

      if (error) throw error;

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
