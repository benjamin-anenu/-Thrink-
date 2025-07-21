
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProjectTask, ProjectMilestone, TaskHierarchyNode } from '@/types/project';
import { toast } from 'sonner';

// Helper function to map database fields to ProjectTask interface
const mapDatabaseTaskToProjectTask = (dbTask: any): ProjectTask => {
  return {
    id: dbTask.id,
    name: dbTask.name,
    description: dbTask.description || '',
    startDate: dbTask.start_date || '',
    endDate: dbTask.end_date || '',
    baselineStartDate: dbTask.baseline_start_date || '',
    baselineEndDate: dbTask.baseline_end_date || '',
    progress: dbTask.progress || 0,
    assignedResources: dbTask.assigned_resources || [],
    assignedStakeholders: dbTask.assigned_stakeholders || [],
    dependencies: dbTask.dependencies || [],
    priority: dbTask.priority || 'Medium',
    status: dbTask.status || 'Not Started',
    milestoneId: dbTask.milestone_id,
    duration: dbTask.duration || 1,
    parentTaskId: dbTask.parent_task_id,
    hierarchyLevel: dbTask.hierarchy_level || 0,
    sortOrder: dbTask.sort_order || 0,
    manualOverrideDates: dbTask.manual_override_dates || false
  };
};

// Helper function to map ProjectTask to database fields
const mapProjectTaskToDatabase = (task: Partial<ProjectTask>): any => {
  const dbTask: any = {};
  
  if (task.name !== undefined) dbTask.name = task.name;
  if (task.description !== undefined) dbTask.description = task.description;
  if (task.startDate !== undefined) dbTask.start_date = task.startDate;
  if (task.endDate !== undefined) dbTask.end_date = task.endDate;
  if (task.baselineStartDate !== undefined) dbTask.baseline_start_date = task.baselineStartDate;
  if (task.baselineEndDate !== undefined) dbTask.baseline_end_date = task.baselineEndDate;
  if (task.progress !== undefined) dbTask.progress = task.progress;
  if (task.assignedResources !== undefined) dbTask.assigned_resources = task.assignedResources;
  if (task.assignedStakeholders !== undefined) dbTask.assigned_stakeholders = task.assignedStakeholders;
  if (task.dependencies !== undefined) dbTask.dependencies = task.dependencies;
  if (task.priority !== undefined) dbTask.priority = task.priority;
  if (task.status !== undefined) dbTask.status = task.status;
  if (task.milestoneId !== undefined) dbTask.milestone_id = task.milestoneId;
  if (task.duration !== undefined) dbTask.duration = task.duration;
  if (task.parentTaskId !== undefined) dbTask.parent_task_id = task.parentTaskId;
  if (task.hierarchyLevel !== undefined) dbTask.hierarchy_level = task.hierarchyLevel;
  if (task.sortOrder !== undefined) dbTask.sort_order = task.sortOrder;
  if (task.manualOverrideDates !== undefined) dbTask.manual_override_dates = task.manualOverrideDates;
  
  return dbTask;
};

// Utility function to convert date strings to a sortable format
const toSortableDate = (dateString: string): string => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? dateString : date.toISOString();
};

export function useTaskManagement(projectId: string) {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
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
        const mappedTasks = tasksData.map(mapDatabaseTaskToProjectTask);
        setTasks(mappedTasks);
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

  const fetchMilestones = async () => {
    try {
      console.log('[useTaskManagement] Fetching milestones for project:', projectId);

      const { data: milestonesData, error: milestonesError } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('due_date', { ascending: true });

      if (milestonesError) {
        console.error('[useTaskManagement] Milestone fetch error:', milestonesError);
        return;
      }

      if (milestonesData) {
        console.log('[useTaskManagement] Fetched milestones:', milestonesData.length);
        const mappedMilestones = milestonesData.map(milestone => ({
          id: milestone.id,
          name: milestone.name,
          description: milestone.description || '',
          date: milestone.due_date || '',
          baselineDate: milestone.baseline_date || '',
          status: milestone.status || 'upcoming',
          tasks: milestone.task_ids || [],
          progress: milestone.progress || 0
        }));
        setMilestones(mappedMilestones);
      } else {
        setMilestones([]);
      }
    } catch (error) {
      console.error('[useTaskManagement] Milestone fetch error:', error);
    }
  };

  const createTask = async (newTask: Omit<ProjectTask, 'id'>) => {
    try {
      console.log('[useTaskManagement] Creating task:', newTask);
      setError(null);

      const dbTask = mapProjectTaskToDatabase(newTask);
      dbTask.project_id = projectId;

      const { data, error } = await supabase
        .from('project_tasks')
        .insert([dbTask])
        .select()
        .single();

      if (error) {
        console.error('[useTaskManagement] Create error:', error);
        handleNetworkError(error, 'create task');
        return;
      }

      console.log('[useTaskManagement] Task created successfully:', data);
      const mappedTask = mapDatabaseTaskToProjectTask(data);
      setTasks(prevTasks => [...prevTasks, mappedTask]);

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
        .eq('id', taskId);

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

      const dbUpdates = mapProjectTaskToDatabase(updates);

      const { data, error } = await supabase
        .from('project_tasks')
        .update(dbUpdates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        console.error('[useTaskManagement] Update error:', error);
        handleNetworkError(error, 'update task');
        return;
      }

      console.log('[useTaskManagement] Task updated successfully:', data);
      
      // Update local state
      const mappedTask = mapDatabaseTaskToProjectTask(data);
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? mappedTask : task
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

  const createMilestone = async (milestone: Omit<ProjectMilestone, 'id'>) => {
    try {
      console.log('[useTaskManagement] Creating milestone:', milestone);
      setError(null);

      const { data, error } = await supabase
        .from('milestones')
        .insert([{
          project_id: projectId,
          name: milestone.name,
          description: milestone.description,
          due_date: milestone.date,
          baseline_date: milestone.baselineDate,
          status: milestone.status,
          task_ids: milestone.tasks,
          progress: milestone.progress
        }])
        .select()
        .single();

      if (error) {
        console.error('[useTaskManagement] Create milestone error:', error);
        handleNetworkError(error, 'create milestone');
        return;
      }

      console.log('[useTaskManagement] Milestone created successfully:', data);
      const mappedMilestone = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        date: data.due_date || '',
        baselineDate: data.baseline_date || '',
        status: data.status || 'upcoming',
        tasks: data.task_ids || [],
        progress: data.progress || 0
      };
      setMilestones(prevMilestones => [...prevMilestones, mappedMilestone]);

      toast.success('Milestone created successfully');
    } catch (error) {
      console.error('[useTaskManagement] Create milestone error:', error);
      handleNetworkError(error, 'create milestone');
    }
  };

  const updateMilestone = async (milestoneId: string, updates: Partial<ProjectMilestone>) => {
    try {
      console.log('[useTaskManagement] Updating milestone:', milestoneId, updates);
      
      if (!validateUUID(milestoneId)) {
        throw new Error('Invalid milestone ID format');
      }

      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.date !== undefined) dbUpdates.due_date = updates.date;
      if (updates.baselineDate !== undefined) dbUpdates.baseline_date = updates.baselineDate;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.tasks !== undefined) dbUpdates.task_ids = updates.tasks;
      if (updates.progress !== undefined) dbUpdates.progress = updates.progress;

      const { data, error } = await supabase
        .from('milestones')
        .update(dbUpdates)
        .eq('id', milestoneId)
        .select()
        .single();

      if (error) {
        console.error('[useTaskManagement] Update milestone error:', error);
        handleNetworkError(error, 'update milestone');
        return;
      }

      console.log('[useTaskManagement] Milestone updated successfully:', data);
      
      const mappedMilestone = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        date: data.due_date || '',
        baselineDate: data.baseline_date || '',
        status: data.status || 'upcoming',
        tasks: data.task_ids || [],
        progress: data.progress || 0
      };
      
      setMilestones(prevMilestones => 
        prevMilestones.map(milestone => 
          milestone.id === milestoneId ? mappedMilestone : milestone
        )
      );

      toast.success('Milestone updated successfully');
    } catch (error) {
      console.error('[useTaskManagement] Update milestone error:', error);
      handleNetworkError(error, 'update milestone');
    }
  };

  const deleteMilestone = async (milestoneId: string) => {
    try {
      console.log('[useTaskManagement] Deleting milestone:', milestoneId);
      setError(null);

      if (!validateUUID(milestoneId)) {
        throw new Error('Invalid milestone ID format');
      }

      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', milestoneId);

      if (error) {
        console.error('[useTaskManagement] Delete milestone error:', error);
        handleNetworkError(error, 'delete milestone');
        return;
      }

      console.log('[useTaskManagement] Milestone deleted successfully:', milestoneId);
      setMilestones(prevMilestones => prevMilestones.filter(milestone => milestone.id !== milestoneId));

      toast.success('Milestone deleted successfully');
    } catch (error) {
      console.error('[useTaskManagement] Delete milestone error:', error);
      handleNetworkError(error, 'delete milestone');
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
    const rootTasks = tasks.filter(task => !task.parentTaskId);
    const hierarchy = rootTasks.map(task => ({
      task,
      children: getSubtasks(task.id),
      depth: 0,
      isExpanded: true,
      path: [task.id]
    }));
    return hierarchy;
  };

  const getSubtasks = (taskId: string): TaskHierarchyNode[] => {
    const subtasks = tasks.filter(task => task.parentTaskId === taskId);
    return subtasks.map(task => ({
      task,
      children: getSubtasks(task.id),
      depth: 1,
      isExpanded: true,
      path: [taskId, task.id]
    }));
  };

  const refreshData = async () => {
    await Promise.all([fetchTasks(), fetchMilestones()]);
  };

  useEffect(() => {
    if (projectId && validateUUID(projectId)) {
      Promise.all([fetchTasks(), fetchMilestones()]);
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
          Promise.all([fetchTasks(), fetchMilestones()]);
        }
      }, retryDelay);

      return () => clearTimeout(timeoutId);
    }
  }, [error, retryCount, projectId]);

  return {
    tasks,
    milestones,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    reorderTasks,
    getTaskHierarchy,
    refreshTasks: fetchTasks,
    refreshData,
    retryCount,
    maxRetries
  };
}
