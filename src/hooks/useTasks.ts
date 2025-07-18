
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Task } from '@/types/task';

export const useTasks = (projectId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('project_tasks')
        .select('*');
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      const { data, error } = await query.order('start_date');
      if (error) throw error;
      
      // Map database fields to interface fields and ensure priority is correct type
      const mappedData = (data || []).map(item => ({
        ...item,
        priority: (['High', 'Medium', 'Low', 'Critical'].includes(item.priority) 
          ? item.priority 
          : 'Medium') as 'High' | 'Medium' | 'Low' | 'Critical',
      }));
      
      setTasks(mappedData);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('project_tasks')
        .insert([{ ...task }])
        .select();
      if (error) throw error;
      toast.success('Task created');
      loadTasks();
      
      const mappedResult = data?.[0] ? {
        ...data[0],
        priority: (['High', 'Medium', 'Low', 'Critical'].includes(data[0].priority) 
          ? data[0].priority 
          : 'Medium') as 'High' | 'Medium' | 'Low' | 'Critical',
      } : null;
      
      return mappedResult as Task;
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      return null;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ ...updates })
        .eq('id', id);
      if (error) throw error;
      toast.success('Task updated');
      loadTasks();
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      return false;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Task deleted');
      loadTasks();
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      return false;
    }
  };

  useEffect(() => {
    loadTasks();
    const subscription = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_tasks'
        },
        () => {
          loadTasks();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [projectId]);

  return {
    tasks,
    loading,
    refreshTasks: loadTasks,
    createTask,
    updateTask,
    deleteTask
  };
};
