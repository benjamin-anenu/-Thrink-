import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useWorkspace } from './WorkspaceContext';
import { toast } from 'sonner';

// Export types for use in other components
export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  dueDate?: Date;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  isLoading: boolean; // Add alias for compatibility
  error: string | null;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>; // Add this method
  deleteTask: (id: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!user || !currentWorkspace) {
      console.log('[Tasks] No user or workspace, clearing tasks');
      setTasks([]);
      setLoading(false);
      return;
    }

    console.log('[Tasks] Fetching tasks for workspace:', currentWorkspace.id);
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', currentWorkspace.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('[Tasks] Error fetching tasks:', fetchError);
        setError('Failed to load tasks');
        toast.error('Failed to load tasks');
        return;
      }

      const mappedTasks: Task[] = (data || []).map(task => ({
        id: task.id,
        name: task.name,
        status: (task.status || 'Not Started') as TaskStatus,
        priority: (task.priority || 'Medium') as TaskPriority,
        assignee: task.assignee_id,
        dueDate: task.end_date ? new Date(task.end_date) : undefined,
        description: task.description || '',
        projectId: task.project_id,
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at)
      }));

      console.log('[Tasks] Loaded', mappedTasks.length, 'tasks');
      setTasks(mappedTasks);
    } catch (err) {
      console.error('[Tasks] Exception in fetchTasks:', err);
      setError('An error occurred while loading tasks');
      toast.error('An error occurred while loading tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    if (!user || !currentWorkspace) return;

    const subscription = supabase
      .channel(`tasks-${currentWorkspace.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_tasks',
          filter: `project_id=eq.${currentWorkspace.id}`
        },
        (payload) => {
          console.log('[Tasks] Real-time update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newTask: Task = {
              id: payload.new.id,
              name: payload.new.name,
              status: (payload.new.status || 'Not Started') as TaskStatus,
              priority: (payload.new.priority || 'Medium') as TaskPriority,
              assignee: payload.new.assignee_id,
              dueDate: payload.new.end_date ? new Date(payload.new.end_date) : undefined,
              description: payload.new.description || '',
              projectId: payload.new.project_id,
              createdAt: new Date(payload.new.created_at),
              updatedAt: new Date(payload.new.updated_at)
            };
            setTasks(prev => [newTask, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prevTasks =>
              prevTasks.map(task =>
                task.id === payload.new.id ? { 
                  ...task, 
                  status: (payload.new.status || 'Not Started') as TaskStatus,
                  updatedAt: new Date(payload.new.updated_at)
                } : task
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(task => task.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, currentWorkspace]);

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user || !currentWorkspace) {
      toast.error('Authentication required');
      return;
    }

    try {
      const { error } = await supabase
        .from('project_tasks')
        .insert([{
          name: taskData.name,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          assignee_id: taskData.assignee,
          end_date: taskData.dueDate?.toISOString().split('T')[0],
          project_id: taskData.projectId
        }]);

      if (error) throw error;
      
      toast.success('Task created successfully');
    } catch (err) {
      console.error('[Tasks] Error creating task:', err);
      toast.error('Failed to create task');
      throw err;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) {
      toast.error('Authentication required');
      return;
    }

    try {
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.assignee !== undefined) updateData.assignee_id = updates.assignee;
      if (updates.dueDate !== undefined) {
        updateData.end_date = updates.dueDate?.toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('project_tasks')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Task updated successfully');
    } catch (err) {
      console.error('[Tasks] Error updating task:', err);
      toast.error('Failed to update task');
      throw err;
    }
  };

  // Add the missing updateTaskStatus method
  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    await updateTask(id, { status });
  };

  const deleteTask = async (id: string) => {
    if (!user) {
      toast.error('Authentication required');
      return;
    }

    try {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Task deleted successfully');
    } catch (err) {
      console.error('[Tasks] Error deleting task:', err);
      toast.error('Failed to delete task');
      throw err;
    }
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      loading,
      isLoading: loading, // Add alias for compatibility
      error,
      createTask,
      updateTask,
      updateTaskStatus, // Add this method
      deleteTask,
      refreshTasks: fetchTasks
    }}>
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
