
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
  parentTaskId?: string;
  hierarchyLevel?: number;
  sortOrder?: number;
}

export class TaskManagementService {
  static async createTask(taskData: TaskCreationData): Promise<ProjectTask> {
    try {
      // Create the basic task data for Supabase
      const supabaseTaskData = {
        name: taskData.name,
        description: taskData.description || '',
        project_id: taskData.projectId,
        milestone_id: taskData.milestoneId || null,
        assignee_id: taskData.assigneeId || null,
        priority: taskData.priority,
        status: taskData.status,
        start_date: taskData.startDate,
        end_date: taskData.endDate,
        parent_task_id: taskData.parentTaskId || null,
        hierarchy_level: taskData.hierarchyLevel || 0,
        sort_order: taskData.sortOrder || 0,
        dependencies: taskData.dependencies,
        assigned_resources: taskData.assigneeId ? [taskData.assigneeId] : [],
        assigned_stakeholders: []
      };

      const { data: task, error } = await supabase
        .from('project_tasks')
        .insert([supabaseTaskData])
        .select()
        .single();

      if (error) {
        console.error('Supabase task creation error:', error);
        throw error;
      }

      // Convert back to ProjectTask format
      return {
        id: task.id,
        name: task.name,
        description: task.description || '',
        milestoneId: task.milestone_id,
        priority: task.priority as "High" | "Medium" | "Low" | "Critical",
        status: task.status as "Not Started" | "In Progress" | "Completed" | "On Hold" | "Cancelled",
        startDate: task.start_date,
        endDate: task.end_date,
        baselineStartDate: task.baseline_start_date || task.start_date,
        baselineEndDate: task.baseline_end_date || task.end_date,
        dependencies: Array.isArray(task.dependencies) ? task.dependencies : [],
        assignedResources: Array.isArray(task.assigned_resources) ? task.assigned_resources : [],
        assignedStakeholders: Array.isArray(task.assigned_stakeholders) ? task.assigned_stakeholders : [],
        progress: task.progress || 0,
        duration: task.duration || 1,
        hierarchyLevel: task.hierarchy_level || 0,
        sortOrder: task.sort_order || 0,
        parentTaskId: task.parent_task_id,
        hasChildren: false
      };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  static async updateTask(taskId: string, updates: Partial<ProjectTask>): Promise<void> {
    try {
      // Convert ProjectTask updates to Supabase format
      const supabaseUpdates: any = {};
      
      if (updates.name !== undefined) supabaseUpdates.name = updates.name;
      if (updates.description !== undefined) supabaseUpdates.description = updates.description;
      if (updates.priority !== undefined) supabaseUpdates.priority = updates.priority;
      if (updates.status !== undefined) supabaseUpdates.status = updates.status;
      if (updates.startDate !== undefined) supabaseUpdates.start_date = updates.startDate;
      if (updates.endDate !== undefined) supabaseUpdates.end_date = updates.endDate;
      if (updates.baselineStartDate !== undefined) supabaseUpdates.baseline_start_date = updates.baselineStartDate;
      if (updates.baselineEndDate !== undefined) supabaseUpdates.baseline_end_date = updates.baselineEndDate;
      if (updates.progress !== undefined) supabaseUpdates.progress = updates.progress;
      if (updates.duration !== undefined) supabaseUpdates.duration = updates.duration;
      if (updates.milestoneId !== undefined) supabaseUpdates.milestone_id = updates.milestoneId;
      if (updates.dependencies !== undefined) supabaseUpdates.dependencies = updates.dependencies;
      if (updates.assignedResources !== undefined) supabaseUpdates.assigned_resources = updates.assignedResources;
      if (updates.assignedStakeholders !== undefined) supabaseUpdates.assigned_stakeholders = updates.assignedStakeholders;

      const { error } = await supabase
        .from('project_tasks')
        .update(supabaseUpdates)
        .eq('id', taskId);

      if (error) {
        console.error('Supabase task update error:', error);
        throw error;
      }
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

      if (error) {
        console.error('Supabase task deletion error:', error);
        throw error;
      }
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
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Supabase task fetch error:', error);
        throw error;
      }

      // Convert to ProjectTask format
      return (tasks || []).map(task => ({
        id: task.id,
        name: task.name,
        description: task.description || '',
        milestoneId: task.milestone_id,
        priority: task.priority as "High" | "Medium" | "Low" | "Critical",
        status: task.status as "Not Started" | "In Progress" | "Completed" | "On Hold" | "Cancelled",
        startDate: task.start_date,
        endDate: task.end_date,
        baselineStartDate: task.baseline_start_date || task.start_date,
        baselineEndDate: task.baseline_end_date || task.end_date,
        dependencies: Array.isArray(task.dependencies) ? task.dependencies : [],
        assignedResources: Array.isArray(task.assigned_resources) ? task.assigned_resources : [],
        assignedStakeholders: Array.isArray(task.assigned_stakeholders) ? task.assigned_stakeholders : [],
        progress: task.progress || 0,
        duration: task.duration || 1,
        hierarchyLevel: task.hierarchy_level || 0,
        sortOrder: task.sort_order || 0,
        parentTaskId: task.parent_task_id,
        hasChildren: false // Will be calculated separately
      }));
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      throw error;
    }
  }
}
