import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProjectTask, ProjectMilestone } from '@/types/project';
import { toast } from 'sonner';

export interface DatabaseTask {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  baseline_start_date?: string;
  baseline_end_date?: string;
  status?: string;
  priority?: string;
  assignee_id?: string;
  milestone_id?: string;
  duration?: number;
  progress?: number;
  dependencies?: string[];
  assigned_resources?: string[];
  assigned_stakeholders?: string[];
  created_at: string;
  updated_at: string;
}

export interface DatabaseMilestone {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  due_date?: string;
  baseline_date?: string;
  status?: string;
  progress?: number;
  task_ids?: string[];
  created_at: string;
  updated_at: string;
}

export const useTaskManagement = (projectId: string) => {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  // Transform database task to frontend task with safe defaults
  const transformTask = (dbTask: DatabaseTask): ProjectTask => {
    const today = new Date().toISOString().split('T')[0];
    const defaultEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return {
      id: dbTask.id,
      name: dbTask.name || 'Untitled Task',
      description: dbTask.description || '',
      startDate: dbTask.start_date || today,
      endDate: dbTask.end_date || defaultEndDate,
      baselineStartDate: dbTask.baseline_start_date || dbTask.start_date || today,
      baselineEndDate: dbTask.baseline_end_date || dbTask.end_date || defaultEndDate,
      progress: typeof dbTask.progress === 'number' ? dbTask.progress : 0,
      assignedResources: Array.isArray(dbTask.assigned_resources) ? dbTask.assigned_resources : [],
      assignedStakeholders: Array.isArray(dbTask.assigned_stakeholders) ? dbTask.assigned_stakeholders : [],
      dependencies: Array.isArray(dbTask.dependencies) ? dbTask.dependencies : [],
      priority: (dbTask.priority as any) || 'Medium',
      status: (dbTask.status as any) || 'Not Started',
      milestoneId: dbTask.milestone_id || undefined,
      duration: typeof dbTask.duration === 'number' ? dbTask.duration : 1
    };
  };

  // Transform database milestone to frontend milestone with safe defaults
  const transformMilestone = (dbMilestone: DatabaseMilestone): ProjectMilestone => {
    const defaultDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return {
      id: dbMilestone.id,
      name: dbMilestone.name || 'Untitled Milestone',
      description: dbMilestone.description || '',
      date: dbMilestone.due_date || defaultDate,
      baselineDate: dbMilestone.baseline_date || dbMilestone.due_date || defaultDate,
      status: (dbMilestone.status as any) || 'upcoming',
      tasks: Array.isArray(dbMilestone.task_ids) ? dbMilestone.task_ids : [],
      progress: typeof dbMilestone.progress === 'number' ? dbMilestone.progress : 0
    };
  };

  // Load tasks and milestones
  const loadData = async () => {
    try {
      setLoading(true);

      // Load tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId);

      if (tasksError) throw tasksError;

      // Load milestones
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', projectId);

      if (milestonesError) throw milestonesError;

      setTasks((tasksData || []).map(transformTask));
      setMilestones((milestonesData || []).map(transformMilestone));
    } catch (error) {
      console.error('Error loading project data:', error);
      toast.error('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  // Create task
  const createTask = async (taskData: Omit<ProjectTask, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('project_tasks')
        .insert({
          project_id: projectId,
          name: taskData.name,
          description: taskData.description,
          start_date: taskData.startDate,
          end_date: taskData.endDate,
          baseline_start_date: taskData.baselineStartDate,
          baseline_end_date: taskData.baselineEndDate,
          status: taskData.status,
          priority: taskData.priority,
          milestone_id: taskData.milestoneId,
          duration: taskData.duration,
          progress: taskData.progress,
          dependencies: taskData.dependencies,
          assigned_resources: taskData.assignedResources,
          assigned_stakeholders: taskData.assignedStakeholders
        })
        .select()
        .single();

      if (error) throw error;

      const newTask = transformTask(data);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      throw error;
    }
  };

  // Update task
  const updateTask = async (taskId: string, updates: Partial<ProjectTask>) => {
    try {
      const dbUpdates: Partial<DatabaseTask> = {};
      
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.startDate) dbUpdates.start_date = updates.startDate;
      if (updates.endDate) dbUpdates.end_date = updates.endDate;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.priority) dbUpdates.priority = updates.priority;
      if (updates.milestoneId !== undefined) dbUpdates.milestone_id = updates.milestoneId;
      if (updates.duration) dbUpdates.duration = updates.duration;
      if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
      if (updates.dependencies) dbUpdates.dependencies = updates.dependencies;
      if (updates.assignedResources) dbUpdates.assigned_resources = updates.assignedResources;
      if (updates.assignedStakeholders) dbUpdates.assigned_stakeholders = updates.assignedStakeholders;

      const { data, error } = await supabase
        .from('project_tasks')
        .update(dbUpdates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      const updatedTask = transformTask(data);
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
      
      // Handle resource assignments
      if (updates.assignedResources) {
        await updateResourceAssignments(taskId, updates.assignedResources);
      }

      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      throw error;
    }
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      throw error;
    }
  };

  // Create milestone
  const createMilestone = async (milestoneData: Omit<ProjectMilestone, 'id'>) => {
    try {
      const { data, error } = await supabase
        .rpc('create_milestone', {
          p_project_id: projectId,
          p_name: milestoneData.name,
          p_description: milestoneData.description,
          p_due_date: milestoneData.date
        });

      if (error) throw error;

      // Reload milestones to get the new one
      await loadData();
      return data;
    } catch (error) {
      console.error('Error creating milestone:', error);
      toast.error('Failed to create milestone');
      throw error;
    }
  };

  // Update milestone
  const updateMilestone = async (milestoneId: string, updates: Partial<ProjectMilestone>) => {
    try {
      const dbUpdates: any = {};
      
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.date) dbUpdates.due_date = updates.date;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.progress !== undefined) dbUpdates.progress = updates.progress;

      const { data, error } = await supabase
        .from('milestones')
        .update(dbUpdates)
        .eq('id', milestoneId)
        .select()
        .single();

      if (error) throw error;

      const updatedMilestone = transformMilestone(data);
      setMilestones(prev => prev.map(milestone => 
        milestone.id === milestoneId ? updatedMilestone : milestone
      ));
      
      return updatedMilestone;
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast.error('Failed to update milestone');
      throw error;
    }
  };

  // Delete milestone
  const deleteMilestone = async (milestoneId: string) => {
    try {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', milestoneId);

      if (error) throw error;

      setMilestones(prev => prev.filter(milestone => milestone.id !== milestoneId));
    } catch (error) {
      console.error('Error deleting milestone:', error);
      toast.error('Failed to delete milestone');
      throw error;
    }
  };

  // Update resource assignments
  const updateResourceAssignments = async (taskId: string, resourceIds: string[]) => {
    try {
      // First, remove existing assignments
      await supabase
        .from('resource_assignments')
        .delete()
        .eq('task_id', taskId);

      // Then add new assignments
      if (resourceIds.length > 0) {
        const assignments = resourceIds.map(resourceId => ({
          task_id: taskId,
          resource_id: resourceId
        }));

        const { error } = await supabase
          .from('resource_assignments')
          .insert(assignments);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating resource assignments:', error);
      throw error;
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!projectId) return;

    loadData();

    // Subscribe to task changes
    const tasksSubscription = supabase
      .channel('project_tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_tasks',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    // Subscribe to milestone changes
    const milestonesSubscription = supabase
      .channel('milestones_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'milestones',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksSubscription);
      supabase.removeChannel(milestonesSubscription);
    };
  }, [projectId]);

  return {
    tasks,
    milestones,
    loading,
    createTask,
    updateTask,
    deleteTask,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    refreshData: loadData
  };
};