import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProjectTask, ProjectMilestone, TaskHierarchyNode } from '@/types/project';
import { toast } from 'sonner';

// Define interfaces for task and milestone
interface Task {
  id: string;
  name: string;
  project_id: string;
  status: string;
  start_date: string;
  end_date: string;
  priority: string;
  description?: string;
  milestone_id?: string | null;
  dependencies?: string[];
  assigned_resource_id?: string;
  estimated_hours?: number;
  actual_hours?: number;
  progress?: number;
  baseline_start_date?: string;
  baseline_end_date?: string;
  created_at?: string;
  updated_at?: string;
}

interface Milestone {
  id: string;
  name: string;
  project_id: string;
  date: string;
  status: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Utility function to convert date strings to a sortable format
const toSortableDate = (dateString: string): string => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? dateString : date.toISOString();
};

export function useTaskManagement(projectId: string) {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Helper function to validate UUID format
  const validateUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  // Helper function to handle network errors
  const handleNetworkError = (error: any, operation: string) => {
    console.error(`[useTaskManagement] ${operation} error:`, error);
    
    if (error?.message?.includes('net::ERR_FAILED') || error?.message?.includes('404')) {
      setError(`Network error during ${operation}. Please check your connection and try again.`);
      return;
    }
    
    if (error?.code === '42883') {
      setError(`Database error during ${operation}. Please contact support if this continues.`);
      return;
    }
    
    setError(`Failed to ${operation}. Please try again.`);
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useTaskManagement] Fetching tasks for project:', projectId);

      const { data: tasksData, error: tasksError } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('end_date', { ascending: true });

      if (tasksError) {
        console.error('[useTaskManagement] Task fetch error:', tasksError);
        handleNetworkError(tasksError, 'fetch tasks');
        return;
      }

      if (tasksData) {
        console.log('[useTaskManagement] Fetched tasks:', tasksData.length);
        setTasks(tasksData as ProjectTask[]);
      } else {
        console.log('[useTaskManagement] No tasks found for project:', projectId);
        setTasks([]);
      }

      // Clear any previous errors
      setError(null);
      setRetryCount(0);
    } catch (error) {
      console.error('[useTaskManagement] Task fetch error:', error);
      handleNetworkError(error, 'fetch tasks');
      
      // Increment retry count for potential automatic retry
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (newTask: Omit<ProjectTask, 'id'>) => {
    try {
      console.log('[useTaskManagement] Creating task:', newTask);
      setError(null);

      const { data, error } = await supabase
        .from('project_tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) {
        console.error('[useTaskManagement] Create error:', error);
        handleNetworkError(error, 'create task');
        return;
      }

      console.log('[useTaskManagement] Task created successfully:', data);
      setTasks(prevTasks => [...prevTasks, data as ProjectTask]);

      // Clear any previous errors
      setError(null);
      setRetryCount(0);

      toast.success('Task created successfully');
    } catch (error) {
      console.error('[useTaskManagement] Create task error:', error);
      handleNetworkError(error, 'create task');
      
      // Increment retry count for potential automatic retry
      setRetryCount(prev => prev + 1);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      console.log('[useTaskManagement] Deleting task:', taskId);
      setError(null);

      // Validate task ID format
      if (!validateUUID(taskId)) {
        throw new Error('Invalid task ID format');
      }

      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', taskId); // Ensure this is a proper UUID

      if (error) {
        console.error('[useTaskManagement] Delete error:', error);
        handleNetworkError(error, 'delete task');
        return;
      }

      console.log('[useTaskManagement] Task deleted successfully:', taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

      // Clear any previous errors
      setError(null);
      setRetryCount(0);

      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('[useTaskManagement] Delete task error:', error);
      handleNetworkError(error, 'delete task');
      
      // Increment retry count for potential automatic retry
      setRetryCount(prev => prev + 1);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<ProjectTask>) => {
    try {
      console.log('[useTaskManagement] Updating task:', taskId, updates);
      
      // Validate task ID format
      if (!validateUUID(taskId)) {
        throw new Error('Invalid task ID format');
      }

      // Process updates to ensure correct data types
      const dbUpdates: Partial<ProjectTask> = {};
      for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
          const value = updates[key];
          switch (key) {
            case 'start_date':
            case 'end_date':
            case 'baseline_start_date':
            case 'baseline_end_date':
              dbUpdates[key] = value ? toSortableDate(value as string) : null;
              break;
            case 'priority':
              if (['Low', 'Medium', 'High', 'Critical'].includes(value as string)) {
                dbUpdates[key] = value;
              } else {
                console.warn(`[useTaskManagement] Invalid priority value: ${value}`);
              }
              break;
            case 'status':
              if (['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'].includes(value as string)) {
                dbUpdates[key] = value;
              } else {
                console.warn(`[useTaskManagement] Invalid status value: ${value}`);
              }
              break;
            case 'estimated_hours':
            case 'actual_hours':
            case 'progress':
              dbUpdates[key] = typeof value === 'number' ? value : null;
              break;
            default:
              dbUpdates[key] = value;
          }
        }
      }

      // Use the proper UUID in the where clause
      const { data, error } = await supabase
        .from('project_tasks')
        .update(dbUpdates)
        .eq('id', taskId) // Ensure this is a proper UUID
        .select()
        .single();

      if (error) {
        console.error('[useTaskManagement] Update error:', error);
        handleNetworkError(error, 'update task');
        return;
      }

      console.log('[useTaskManagement] Task updated successfully:', data);
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        )
      );

      // Clear any previous errors
      setError(null);
      setRetryCount(0);

      toast.success('Task updated successfully');
    } catch (error) {
      console.error('[useTaskManagement] Update task error:', error);
      handleNetworkError(error, 'update task');
      
      // Increment retry count for potential automatic retry
      setRetryCount(prev => prev + 1);
    }
  };

  const reorderTasks = async (startIndex: number, endIndex: number) => {
    try {
      console.log('[useTaskManagement] Reordering tasks from', startIndex, 'to', endIndex);
      setError(null);

      const reorderedTasks = [...tasks];
      const [movedTask] = reorderedTasks.splice(startIndex, 1);
      reorderedTasks.splice(endIndex, 0, movedTask);

      setTasks(reorderedTasks);

      // Clear any previous errors
      setError(null);
      setRetryCount(0);
    } catch (error) {
      console.error('[useTaskManagement] Reorder tasks error:', error);
      handleNetworkError(error, 'reorder tasks');
      
      // Increment retry count for potential automatic retry
      setRetryCount(prev => prev + 1);
    }
  };

  const getTaskHierarchy = (): TaskHierarchyNode[] => {
    const rootTasks = tasks.filter(task => !task.milestone_id);
    const hierarchy = rootTasks.map(task => ({
      ...task,
      children: getSubtasks(task.id),
    }));
    return hierarchy;
  };

  const getSubtasks = (taskId: string): TaskHierarchyNode[] => {
    const subtasks = tasks.filter(task => task.milestone_id === taskId);
    return subtasks.map(task => ({
      ...task,
      children: getSubtasks(task.id),
    }));
  };

  useEffect(() => {
    if (projectId && validateUUID(projectId)) {
      fetchTasks();
    } else {
      setLoading(false);
      if (projectId) {
        setError('Invalid project ID format');
      }
    }
  }, [projectId]);

  // Auto-retry mechanism with exponential backoff
  useEffect(() => {
    if (error && retryCount < maxRetries && retryCount > 0) {
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount - 1), 10000);
      console.log(`[useTaskManagement] Retrying in ${retryDelay}ms (attempt ${retryCount}/${maxRetries})`);
      
      const timeoutId = setTimeout(() => {
        if (projectId && validateUUID(projectId)) {
          fetchTasks();
        }
      }, retryDelay);

      return () => clearTimeout(timeoutId);
    }
  }, [error, retryCount, projectId]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
    getTaskHierarchy,
    refreshTasks: fetchTasks,
    retryCount,
    maxRetries
  };
}
