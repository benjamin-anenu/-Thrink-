import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  description?: string;
  completed: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const useSubtasks = (taskId: string | null) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch subtasks for a task
  const fetchSubtasks = async () => {
    if (!taskId || taskId.trim() === '') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('task_subtasks')
        .select('*')
        .eq('task_id', taskId)
        .order('sort_order');

      if (error) throw error;
      setSubtasks(data || []);
    } catch (err) {
      console.error('Error fetching subtasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subtasks');
    } finally {
      setLoading(false);
    }
  };

  // Create a new subtask
  const createSubtask = async (title: string, description?: string) => {
    if (!taskId || taskId.trim() === '') return null;

    try {
      const maxOrder = Math.max(...subtasks.map(st => st.sort_order), -1);
      
      const { data, error } = await supabase
        .from('task_subtasks')
        .insert({
          task_id: taskId,
          title,
          description,
          sort_order: maxOrder + 1
        })
        .select()
        .single();

      if (error) throw error;
      
      setSubtasks(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error creating subtask:', err);
      setError(err instanceof Error ? err.message : 'Failed to create subtask');
      return null;
    }
  };

  // Update a subtask
  const updateSubtask = async (subtaskId: string, updates: Partial<Subtask>) => {
    try {
      const { data, error } = await supabase
        .from('task_subtasks')
        .update(updates)
        .eq('id', subtaskId)
        .select()
        .single();

      if (error) throw error;

      setSubtasks(prev => prev.map(st => 
        st.id === subtaskId ? { ...st, ...data } : st
      ));
      
      return data;
    } catch (err) {
      console.error('Error updating subtask:', err);
      setError(err instanceof Error ? err.message : 'Failed to update subtask');
      return null;
    }
  };

  // Delete a subtask
  const deleteSubtask = async (subtaskId: string) => {
    try {
      const { error } = await supabase
        .from('task_subtasks')
        .delete()
        .eq('id', subtaskId);

      if (error) throw error;
      
      setSubtasks(prev => prev.filter(st => st.id !== subtaskId));
      return true;
    } catch (err) {
      console.error('Error deleting subtask:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete subtask');
      return false;
    }
  };

  // Toggle subtask completion
  const toggleSubtask = async (subtaskId: string) => {
    const subtask = subtasks.find(st => st.id === subtaskId);
    if (!subtask) return null;

    return updateSubtask(subtaskId, { completed: !subtask.completed });
  };

  useEffect(() => {
    if (taskId && taskId.trim() !== '') {
      fetchSubtasks();
    }
  }, [taskId]);

  return {
    subtasks,
    loading,
    error,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    toggleSubtask,
    refreshSubtasks: fetchSubtasks
  };
};