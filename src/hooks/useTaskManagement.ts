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

// Helper function to validate and convert UUID
const validateUUID = (value: string | null | undefined): string | null => {
  if (!value || value === '' || value === 'undefined' || value === 'null') {
    return null;
  }
  
  // UUID regex pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (uuidPattern.test(value)) {
    return value;
  }
  
  // If not a valid UUID, return null
  console.warn(`Invalid UUID format: ${value}`);
  return null;
};

// Helper function to validate project ID
const validateProjectId = (projectId: string): string => {
  if (!projectId || projectId === '') {
    throw new Error('Project ID is required');
  }
  
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidPattern.test(projectId)) {
    throw new Error(`Invalid project ID format: ${projectId}`);
  }
  
  return projectId;
};

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

  // Enhanced dependency validation with automatic date adjustment
  const validateAndAdjustDependencies = async (taskId: string, updates: Partial<ProjectTask>) => {
    if (!updates.dependencies) return updates;

    // Parse dependencies
    const parseDependency = (depString: string) => {
      const parts = depString.split(':');
      return {
        taskId: parts[0],
        type: parts[1] || 'finish-to-start',
        lag: parseInt(parts[2]) || 0
      };
    };

    const dependencies = updates.dependencies.map(parseDependency);
    let suggestedStartDate = new Date(updates.startDate || tasks.find(t => t.id === taskId)?.startDate || Date.now());
    let shouldAdjustDates = false;

    for (const dep of dependencies) {
      const depTask = tasks.find(t => t.id === dep.taskId);
      if (!depTask) continue;

      let requiredStartDate: Date;
      const depStartDate = new Date(depTask.startDate);
      const depEndDate = new Date(depTask.endDate);

      switch (dep.type) {
        case 'finish-to-start':
          requiredStartDate = new Date(depEndDate);
          requiredStartDate.setDate(requiredStartDate.getDate() + 1 + dep.lag);
          break;
        case 'start-to-start':
          requiredStartDate = new Date(depStartDate);
          requiredStartDate.setDate(requiredStartDate.getDate() + dep.lag);
          break;
        case 'finish-to-finish':
          const taskDuration = updates.duration || tasks.find(t => t.id === taskId)?.duration || 1;
          requiredStartDate = new Date(depEndDate);
          requiredStartDate.setDate(requiredStartDate.getDate() - taskDuration + 1 + dep.lag);
          break;
        case 'start-to-finish':
          const taskDuration2 = updates.duration || tasks.find(t => t.id === taskId)?.duration || 1;
          requiredStartDate = new Date(depStartDate);
          requiredStartDate.setDate(requiredStartDate.getDate() - taskDuration2 + 1 + dep.lag);
          break;
        default:
          continue;
      }

      if (requiredStartDate > suggestedStartDate) {
        suggestedStartDate = requiredStartDate;
        shouldAdjustDates = true;
      }
    }

    // If dates need adjustment, update them
    if (shouldAdjustDates) {
      const duration = updates.duration || tasks.find(t => t.id === taskId)?.duration || 1;
      const suggestedEndDate = new Date(suggestedStartDate);
      suggestedEndDate.setDate(suggestedEndDate.getDate() + duration - 1);

      return {
        ...updates,
        startDate: suggestedStartDate.toISOString().split('T')[0],
        endDate: suggestedEndDate.toISOString().split('T')[0]
      };
    }

    return updates;
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

  // Create task with proper UUID handling and baseline initialization
  const createTask = async (taskData: Omit<ProjectTask, 'id'>) => {
    try {
      // Validate and format project ID
      const validatedProjectId = validateProjectId(projectId);
      
      // Validate and convert milestone ID
      const validatedMilestoneId = validateUUID(taskData.milestoneId);
      
      // Validate assigned resources and stakeholders arrays
      const validatedAssignedResources = Array.isArray(taskData.assignedResources) 
        ? taskData.assignedResources.filter(id => validateUUID(id) !== null)
        : [];
        
      const validatedAssignedStakeholders = Array.isArray(taskData.assignedStakeholders)
        ? taskData.assignedStakeholders.filter(id => validateUUID(id) !== null)
        : [];

      // Ensure proper UUID formatting and null handling
      const dbTaskData = {
        project_id: validatedProjectId,
        name: taskData.name,
        description: taskData.description,
        start_date: taskData.startDate,
        end_date: taskData.endDate,
        baseline_start_date: taskData.startDate,
        baseline_end_date: taskData.endDate,
        status: taskData.status,
        priority: taskData.priority,
        // Handle milestoneId properly - convert empty string to null for UUID field
        milestone_id: validatedMilestoneId,
        duration: typeof taskData.duration === 'number' ? taskData.duration : 1,
        progress: taskData.progress,
        dependencies: taskData.dependencies,
        assigned_resources: validatedAssignedResources,
        assigned_stakeholders: validatedAssignedStakeholders
      };

      console.log('Creating task with data:', dbTaskData);

      const { data, error } = await supabase
        .from('project_tasks')
        .insert(dbTaskData)
        .select()
        .single();

      if (error) {
        console.error('Database error creating task:', error);
        throw error;
      }

      const newTask = transformTask(data);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      if (error instanceof Error) {
        if (error.message.includes('Invalid project ID') || error.message.includes('uuid')) {
          toast.error('Invalid project or milestone ID format');
        } else {
          toast.error(`Failed to create task: ${error.message}`);
        }
      } else {
        toast.error('Failed to create task');
      }
      throw error;
    }
  };

  // Enhanced update task with dependency date adjustment
  const updateTask = async (taskId: string, updates: Partial<ProjectTask>) => {
    try {
      // Validate task ID
      const validatedTaskId = validateUUID(taskId);
      if (!validatedTaskId) {
        throw new Error('Invalid task ID format');
      }

      // Validate and adjust dependencies
      const adjustedUpdates = await validateAndAdjustDependencies(taskId, updates);

      const dbUpdates: Partial<DatabaseTask> = {};
      
      if (adjustedUpdates.name) dbUpdates.name = adjustedUpdates.name;
      if (adjustedUpdates.description !== undefined) dbUpdates.description = adjustedUpdates.description;
      if (adjustedUpdates.startDate) dbUpdates.start_date = adjustedUpdates.startDate;
      if (adjustedUpdates.endDate) dbUpdates.end_date = adjustedUpdates.endDate;
      if (adjustedUpdates.status) dbUpdates.status = adjustedUpdates.status;
      if (adjustedUpdates.priority) dbUpdates.priority = adjustedUpdates.priority;
      if (adjustedUpdates.milestoneId !== undefined) {
        dbUpdates.milestone_id = validateUUID(adjustedUpdates.milestoneId);
      }
      if (adjustedUpdates.duration) dbUpdates.duration = adjustedUpdates.duration;
      if (adjustedUpdates.progress !== undefined) dbUpdates.progress = adjustedUpdates.progress;
      if (adjustedUpdates.dependencies) {
        // Validate dependencies before updating
        await validateDependencies(taskId, adjustedUpdates.dependencies);
        dbUpdates.dependencies = adjustedUpdates.dependencies;
      }
      if (adjustedUpdates.assignedResources) {
        // Validate assigned resources UUIDs
        const validatedResources = adjustedUpdates.assignedResources.filter(id => validateUUID(id) !== null);
        dbUpdates.assigned_resources = validatedResources;
      }
      if (adjustedUpdates.assignedStakeholders) {
        // Validate assigned stakeholders UUIDs
        const validatedStakeholders = adjustedUpdates.assignedStakeholders.filter(id => validateUUID(id) !== null);
        dbUpdates.assigned_stakeholders = validatedStakeholders;
      }

      const { data, error } = await supabase
        .from('project_tasks')
        .update(dbUpdates)
        .eq('id', validatedTaskId)
        .select()
        .single();

      if (error) throw error;

      const updatedTask = transformTask(data);
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
      
      // Handle resource assignments with validated UUIDs
      if (adjustedUpdates.assignedResources) {
        await updateResourceAssignments(validatedTaskId, adjustedUpdates.assignedResources.filter(id => validateUUID(id) !== null));
      }

      // If dates were automatically adjusted, show notification
      if (adjustedUpdates.startDate !== updates.startDate || adjustedUpdates.endDate !== updates.endDate) {
        toast.info('Task dates were automatically adjusted based on dependencies');
      }

      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      if (error instanceof Error && error.message.includes('Circular dependency')) {
        toast.error('Cannot create circular dependency between tasks');
      } else if (error instanceof Error && error.message.includes('Invalid')) {
        toast.error(`Invalid data format: ${error.message}`);
      } else {
        toast.error('Failed to update task');
      }
      throw error;
    }
  };

  // Enhanced circular dependency validation
  const validateDependencies = async (taskId: string, dependencies: string[]) => {
    if (!dependencies || dependencies.length === 0) return;

    const parseDependency = (depString: string) => depString.split(':')[0];
    const depTaskIds = dependencies.map(parseDependency);

    // Check for self-dependency
    if (depTaskIds.includes(taskId)) {
      throw new Error('Circular dependency detected: Task cannot depend on itself');
    }

    // Check for direct circular dependencies
    for (const depId of depTaskIds) {
      const { data: depTask, error } = await supabase
        .from('project_tasks')
        .select('dependencies')
        .eq('id', depId)
        .single();

      if (error) continue;

      const depTaskDeps = (depTask?.dependencies || []).map(parseDependency);
      if (depTaskDeps.includes(taskId)) {
        throw new Error(`Circular dependency detected: Task ${depId} already depends on task ${taskId}`);
      }
    }

    // Advanced: Check for indirect circular dependencies (A -> B -> C -> A)
    const checkIndirectCircular = (currentTaskId: string, visited: Set<string>): boolean => {
      if (visited.has(currentTaskId)) return true;
      visited.add(currentTaskId);

      const currentTask = tasks.find(t => t.id === currentTaskId);
      if (!currentTask) return false;

      for (const depString of currentTask.dependencies) {
        const depTaskId = parseDependency(depString);
        if (depTaskId === taskId) return true;
        if (checkIndirectCircular(depTaskId, new Set(visited))) return true;
      }

      return false;
    };

    for (const depId of depTaskIds) {
      if (checkIndirectCircular(depId, new Set())) {
        throw new Error(`Indirect circular dependency detected involving task ${depId}`);
      }
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
