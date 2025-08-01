
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  dueDate?: Date;
  description?: string;
  projectId: string;
  workspaceId: string;
}

interface TaskContextType {
  tasks: Task[];
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
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
        const { data, error } = await supabase
          .from('project_tasks')
          .select('*')
          .eq('workspace_id', currentWorkspace.id);

        if (error) throw error;
        
        const mappedTasks: Task[] = (data || []).map(task => ({
          id: task.id,
          name: task.name,
          status: (task.status || 'Not Started') as TaskStatus,
          priority: (task.priority || 'Medium') as TaskPriority,
          assignee: task.assignee_id,
          dueDate: task.end_date ? new Date(task.end_date) : undefined,
          description: task.description || '',
          projectId: task.project_id,
          workspaceId: currentWorkspace.id
        }));
        
        setTasks(mappedTasks);
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
    if (!currentWorkspace) return;

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
                task.id === payload.new.id ? { ...task, status: payload.new.status as TaskStatus } : task
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentWorkspace]);

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
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
