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
}