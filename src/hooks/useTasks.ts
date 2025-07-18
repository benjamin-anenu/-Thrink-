
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
      
      // Map database fields to interface fields and ensure types are correct
      const mappedData = (data || []).map(item => ({
        ...item,
        priority: (['High', 'Medium', 'Low', 'Critical'].includes(item.priority || '')) 
          ? item.priority as 'High' | 'Medium' | 'Low' | 'Critical'
          : 'Medium' as const,
        status: (['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'].includes(item.status || '')) 
          ? item.status as 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled'
          : 'Not Started' as const,
        assigned_resources: item.assigned_resources || [],
        assigned_stakeholders: item.assigned_stakeholders || [],
        dependencies: item.dependencies || [],
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
        priority: (['High', 'Medium', 'Low', 'Critical'].includes(data[0].priority || '')) 
          ? data[0].priority as 'High' | 'Medium' | 'Low' | 'Critical'
          : 'Medium' as const,
        status: (['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'].includes(data[0].status || '')) 
          ? data[0].status as 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled'
          : 'Not Started' as const,
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
