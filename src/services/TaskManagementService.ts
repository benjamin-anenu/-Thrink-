import { supabase } from '@/integrations/supabase/client';
import { ProjectTask, ProjectMilestone } from '@/types/project';

export interface TaskCreationData {
  name: string;
  description?: string;
  projectId: string;
  milestoneId?: string;
  assigneeId?: string;
  priority: string;
  status: string;
  startDate: string;
  endDate: string;
  dependencies: string[];
  // New hierarchy fields
  parentTaskId?: string;
  hierarchyLevel?: number;
  sortOrder?: number;
}

export class TaskManagementService {
  static async createTasksFromMilestone(
    projectId: string,
    milestone: ProjectMilestone,
    templateTasks: Partial<ProjectTask>[]
  ): Promise<ProjectTask[]> {
    try {
      const tasksToCreate = templateTasks.map(taskTemplate => ({
        name: taskTemplate.name || 'Untitled Task',
        description: taskTemplate.description || '',
        project_id: projectId,
        assignee_id: templateTasks[0]?.assignedResources?.[0] || null,
        priority: taskTemplate.priority || 'Normal',
        status: taskTemplate.status || 'Pending',
        start_date: taskTemplate.startDate || milestone.date,
        end_date: taskTemplate.endDate || milestone.date,
      }));

      const { data: tasks, error } = await supabase
        .from('project_tasks')
        .insert(tasksToCreate)
        .select();

      if (error) throw error;

      return tasks.map(task => ({
        id: task.id,
        name: task.name,
        description: task.description || '',
        milestoneId: null,
        priority: task.priority as "High" | "Medium" | "Low" | "Critical",
        status: task.status as "Not Started" | "In Progress" | "Completed" | "On Hold" | "Cancelled",
        startDate: task.start_date,
        endDate: task.end_date,
        baselineStartDate: task.start_date,
        baselineEndDate: task.end_date,
        dependencies: [],
        assignedResources: task.assignee_id ? [task.assignee_id] : [],
        assignedStakeholders: [],
        progress: 0,
        duration: 1,
      }));
    } catch (error) {
      console.error('Error creating tasks from milestone:', error);
      throw error;
    }
  }

  static async createTask(taskData: TaskCreationData): Promise<ProjectTask> {
    try {
      const { data: task, error } = await supabase
        .from('project_tasks')
        .insert({
          name: taskData.name,
          description: taskData.description || '',
          project_id: taskData.projectId,
          milestone_id: taskData.milestoneId || null,
          assignee_id: taskData.assigneeId || null,
          priority: taskData.priority,
          status: taskData.status,
          start_date: taskData.startDate,
          end_date: taskData.endDate,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: task.id,
        name: task.name,
        description: task.description || '',
        
        milestoneId: null,
        priority: task.priority as "High" | "Medium" | "Low" | "Critical",
        status: task.status as "Not Started" | "In Progress" | "Completed" | "On Hold" | "Cancelled",
        startDate: task.start_date,
        endDate: task.end_date,
        baselineStartDate: task.start_date,
        baselineEndDate: task.end_date,
        dependencies: taskData.dependencies,
        assignedResources: task.assignee_id ? [task.assignee_id] : [],
        assignedStakeholders: [],
        progress: 0,
        duration: 1,
      };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  static async updateTask(taskId: string, updates: Partial<ProjectTask>): Promise<void> {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({
          name: updates.name,
          description: updates.description,
          assignee_id: updates.assignedResources?.[0] || null,
          priority: updates.priority,
          status: updates.status,
          start_date: updates.startDate,
          end_date: updates.endDate,
        })
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  static async deleteTask(taskId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  static async getProjectTasks(projectId: string): Promise<ProjectTask[]> {
    try {
      const { data: tasks, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at');

      if (error) throw error;

      return tasks.map(task => ({
        id: task.id,
        name: task.name,
        description: task.description || '',
        
        milestoneId: null,
        
        priority: task.priority as "High" | "Medium" | "Low" | "Critical",
        status: task.status as "Not Started" | "In Progress" | "Completed" | "On Hold" | "Cancelled",
        startDate: task.start_date,
        endDate: task.end_date,
        baselineStartDate: task.start_date,
        baselineEndDate: task.end_date,
        dependencies: [],
        assignedResources: task.assignee_id ? [task.assignee_id] : [],
        assignedStakeholders: [],
        progress: 0,
        duration: 1,
      }));
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      throw error;
    }
  }

  static async linkTasksToMilestone(taskIds: string[], milestoneId: string): Promise<void> {
    try {
      // For now, we'll handle milestone linking differently as the current schema doesn't support it directly
      console.log(`Linking tasks ${taskIds.join(', ')} to milestone ${milestoneId}`);
      // This would require updating the milestones table to include task_ids array
    } catch (error) {
      console.error('Error linking tasks to milestone:', error);
      throw error;
    }
  }

  // New hierarchy-related methods
  static async moveTaskToParent(
    taskId: string, 
    newParentId: string | null, 
    newSortOrder?: number
  ): Promise<void> {
    try {
      // Calculate new hierarchy level
      let newHierarchyLevel = 0;
      if (newParentId) {
        const { data: parentTask, error: parentError } = await supabase
          .from('project_tasks')
          .select('hierarchy_level')
          .eq('id', newParentId)
          .single();

        if (parentError) throw parentError;
        newHierarchyLevel = (parentTask?.hierarchy_level || 0) + 1;
      }

      // Get current sort order if not provided
      let finalSortOrder = newSortOrder;
      if (finalSortOrder === undefined) {
        const { data: siblings, error: siblingsError } = await supabase
          .from('project_tasks')
          .select('sort_order')
          .eq('parent_task_id', newParentId || null)
          .order('sort_order', { ascending: false })
          .limit(1);

        if (siblingsError) throw siblingsError;
        finalSortOrder = siblings.length > 0 ? siblings[0].sort_order + 100 : 100;
      }

      // Update the task
      const { error } = await supabase
        .from('project_tasks')
        .update({
          parent_task_id: newParentId,
          hierarchy_level: newHierarchyLevel,
          sort_order: finalSortOrder
        })
        .eq('id', taskId);

      if (error) throw error;

      // Update all descendants' hierarchy levels
      await this.updateDescendantHierarchyLevels(taskId, newHierarchyLevel);
    } catch (error) {
      console.error('Error moving task to parent:', error);
      throw error;
    }
  }

  static async promoteTask(taskId: string): Promise<void> {
    try {
      // Get current task
      const { data: task, error: taskError } = await supabase
        .from('project_tasks')
        .select('parent_task_id, hierarchy_level, project_id')
        .eq('id', taskId)
        .single();

      if (taskError) throw taskError;
      if (!task?.parent_task_id) {
        throw new Error('Task is already at root level');
      }

      // Get parent's parent (grandparent)
      const { data: parentTask, error: parentError } = await supabase
        .from('project_tasks')
        .select('parent_task_id, sort_order')
        .eq('id', task.parent_task_id)
        .single();

      if (parentError) throw parentError;

      // Move task to same level as its current parent
      await this.moveTaskToParent(taskId, parentTask?.parent_task_id || null);
    } catch (error) {
      console.error('Error promoting task:', error);
      throw error;
    }
  }

  static async demoteTask(taskId: string, newParentId?: string): Promise<void> {
    try {
      if (!newParentId) {
        // Find previous sibling to make it the parent
        const { data: task, error: taskError } = await supabase
          .from('project_tasks')
          .select('parent_task_id, sort_order, project_id')
          .eq('id', taskId)
          .single();

        if (taskError) throw taskError;

        // Get siblings with lower sort order
        const { data: previousSiblings, error: siblingsError } = await supabase
          .from('project_tasks')
          .select('id, sort_order')
          .eq('parent_task_id', task?.parent_task_id || null)
          .eq('project_id', task?.project_id)
          .lt('sort_order', task?.sort_order || 0)
          .order('sort_order', { ascending: false })
          .limit(1);

        if (siblingsError) throw siblingsError;
        if (previousSiblings.length === 0) {
          throw new Error('No previous sibling found to demote under');
        }

        newParentId = previousSiblings[0].id;
      }

      await this.moveTaskToParent(taskId, newParentId);
    } catch (error) {
      console.error('Error demoting task:', error);
      throw error;
    }
  }

  static async reorderTasks(taskIds: string[], parentId: string | null): Promise<void> {
    try {
      // Update sort order for each task
      const updates = taskIds.map((taskId, index) => 
        supabase
          .from('project_tasks')
          .update({ sort_order: (index + 1) * 100 })
          .eq('id', taskId)
      );

      await Promise.all(updates);
    } catch (error) {
      console.error('Error reordering tasks:', error);
      throw error;
    }
  }

  static async getTaskHierarchy(projectId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_task_hierarchy', { p_project_id: projectId });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting task hierarchy:', error);
      throw error;
    }
  }

  private static async updateDescendantHierarchyLevels(
    parentTaskId: string, 
    parentHierarchyLevel: number
  ): Promise<void> {
    try {
      // Get all descendants
      const { data: descendants, error } = await supabase
        .from('project_tasks')
        .select('id, hierarchy_level')
        .eq('parent_task_id', parentTaskId);

      if (error) throw error;

      // Update each descendant
      for (const descendant of descendants || []) {
        const newLevel = parentHierarchyLevel + 1;
        
        await supabase
          .from('project_tasks')
          .update({ hierarchy_level: newLevel })
          .eq('id', descendant.id);

        // Recursively update their children
        await this.updateDescendantHierarchyLevels(descendant.id, newLevel);
      }
    } catch (error) {
      console.error('Error updating descendant hierarchy levels:', error);
      throw error;
    }
  }
}
