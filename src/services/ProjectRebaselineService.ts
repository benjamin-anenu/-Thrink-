import { supabase } from '@/integrations/supabase/client';
import { ProjectTask } from '@/types/project';

export interface RebaselineRequest {
  projectId: string;
  taskId: string;
  newStartDate: string;
  newEndDate: string;
  reason: string;
  affectedTasks: string[];
  rebaselineType: 'manual' | 'auto' | 'bulk';
  cascadeMethod: 'preserve_dependencies' | 'shift_all' | 'manual_select';
}

export interface RebaselineResult {
  success: boolean;
  totalTasksUpdated: number;
  updatedTasks: Array<{
    taskId: string;
    taskName: string;
    oldStartDate: string;
    oldEndDate: string;
    newStartDate: string;
    newEndDate: string;
    updateReason: string;
  }>;
  errors: string[];
  warnings: string[];
}

export class ProjectRebaselineService {
  static async rebaselineTask(request: RebaselineRequest): Promise<RebaselineResult> {
    const result: RebaselineResult = {
      success: false,
      totalTasksUpdated: 0,
      updatedTasks: [],
      errors: [],
      warnings: []
    };
    try {
      const validation = await this.validateRebaselineRequest(request);
      if (!validation.isValid) {
        result.errors = validation.errors;
        return result;
      }
      const { data: allTasks, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', request.projectId);
      if (error) throw error;
      const currentTask = allTasks?.find((t: any) => t.id === request.taskId);
      if (!currentTask) {
        result.errors.push('Task not found');
        return result;
      }
      const rebaselineData = {
        baseline_start_date: request.newStartDate,
        baseline_end_date: request.newEndDate,
        start_date: request.newStartDate,
        end_date: request.newEndDate,
        manual_override_dates: true,
        updated_at: new Date().toISOString()
      };
      const { error: updateError } = await supabase
        .from('project_tasks')
        .update(rebaselineData)
        .eq('id', request.taskId);
      if (updateError) throw updateError;
      result.updatedTasks.push({
        taskId: request.taskId,
        taskName: currentTask.name,
        oldStartDate: currentTask.start_date,
        oldEndDate: currentTask.end_date,
        newStartDate: request.newStartDate,
        newEndDate: request.newEndDate,
        updateReason: `Rebaselined: ${request.reason}`
      });
      const cascadeResult = await this.cascadeRebaselineUpdates(
        request,
        allTasks || [],
        currentTask
      );
      result.updatedTasks.push(...cascadeResult.updatedTasks);
      result.warnings.push(...cascadeResult.warnings);
      await this.logRebaselineAction(request, result);
      result.totalTasksUpdated = result.updatedTasks.length;
      result.success = true;
      return result;
    } catch (error: any) {
      result.errors.push(`Rebaseline failed: ${error.message}`);
      return result;
    }
  }
  static async bulkRebaseline(
    projectId: string,
    rebaselineItems: Array<{
      taskId: string;
      newStartDate: string;
      newEndDate: string;
      reason: string;
    }>
  ): Promise<RebaselineResult> {
    const result: RebaselineResult = {
      success: false,
      totalTasksUpdated: 0,
      updatedTasks: [],
      errors: [],
      warnings: []
    };
    try {
      for (const item of rebaselineItems) {
        const request: RebaselineRequest = {
          projectId,
          taskId: item.taskId,
          newStartDate: item.newStartDate,
          newEndDate: item.newEndDate,
          reason: item.reason,
          affectedTasks: [],
          rebaselineType: 'bulk',
          cascadeMethod: 'preserve_dependencies'
        };
        const itemResult = await this.rebaselineTask(request);
        result.updatedTasks.push(...itemResult.updatedTasks);
        result.errors.push(...itemResult.errors);
        result.warnings.push(...itemResult.warnings);
      }
      result.totalTasksUpdated = result.updatedTasks.length;
      result.success = result.errors.length === 0;
      return result;
    } catch (error: any) {
      result.errors.push(`Bulk rebaseline failed: ${error.message}`);
      return result;
    }
  }
  static async autoRebaselineFromProgress(
    projectId: string,
    reason: string = 'Auto-rebaseline based on actual progress'
  ): Promise<RebaselineResult> {
    const result: RebaselineResult = {
      success: false,
      totalTasksUpdated: 0,
      updatedTasks: [],
      errors: [],
      warnings: []
    };
    try {
      const { data: tasks, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .neq('status', 'Completed');
      if (error) throw error;
      const today = new Date();
      const tasksToRebaseline: Array<{
        taskId: string;
        newStartDate: string;
        newEndDate: string;
        reason: string;
      }> = [];
      tasks?.forEach((task: any) => {
        const currentEndDate = new Date(task.end_date);
        if (currentEndDate < today && task.status !== 'Completed') {
          const daysOverdue = Math.ceil((today.getTime() - currentEndDate.getTime()) / (1000 * 60 * 60 * 24));
          const newStartDate = new Date(today);
          const newEndDate = new Date(today);
          newEndDate.setDate(newEndDate.getDate() + task.duration);
          tasksToRebaseline.push({
            taskId: task.id,
            newStartDate: newStartDate.toISOString().split('T')[0],
            newEndDate: newEndDate.toISOString().split('T')[0],
            reason: `${reason} - ${daysOverdue} days overdue`
          });
        }
      });
      if (tasksToRebaseline.length > 0) {
        return await this.bulkRebaseline(projectId, tasksToRebaseline);
      }
      result.success = true;
      result.warnings.push('No tasks found that need auto-rebaselining');
      return result;
    } catch (error: any) {
      result.errors.push(`Auto-rebaseline failed: ${error.message}`);
      return result;
    }
  }
  static async getRebaselineHistory(projectId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('rebaseline_history')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching rebaseline history:', error);
      return [];
    }
    return data || [];
  }
  private static async validateRebaselineRequest(
    request: RebaselineRequest
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const startDate = new Date(request.newStartDate);
    const endDate = new Date(request.newEndDate);
    if (isNaN(startDate.getTime())) {
      errors.push('Invalid start date');
    }
    if (isNaN(endDate.getTime())) {
      errors.push('Invalid end date');
    }
    if (startDate >= endDate) {
      errors.push('Start date must be before end date');
    }
    if (!request.reason || request.reason.trim().length < 5) {
      errors.push('Rebaseline reason must be at least 5 characters');
    }
    return { isValid: errors.length === 0, errors };
  }
  private static async cascadeRebaselineUpdates(
    request: RebaselineRequest,
    allTasks: any[],
    rebaselinedTask: any
  ): Promise<{ updatedTasks: any[]; warnings: string[] }> {
    const updatedTasks: any[] = [];
    const warnings: string[] = [];
    try {
      const dependentTasks = allTasks.filter((task: any) =>
        task.dependencies &&
        task.dependencies.some((dep: string) => dep.startsWith(rebaselinedTask.id))
      );
      if (dependentTasks.length === 0) {
        return { updatedTasks, warnings };
      }
      const originalEndDate = new Date(rebaselinedTask.baseline_end_date);
      const newEndDate = new Date(request.newEndDate);
      const delayDays = Math.ceil((newEndDate.getTime() - originalEndDate.getTime()) / (1000 * 60 * 60 * 24));
      if (delayDays <= 0) {
        warnings.push('No delay detected, dependent tasks not updated');
        return { updatedTasks, warnings };
      }
      for (const dependentTask of dependentTasks) {
        if (dependentTask.manual_override_dates) {
          warnings.push(`Task "${dependentTask.name}" has manual override - skipping cascade update`);
          continue;
        }
        const currentStartDate = new Date(dependentTask.start_date);
        const currentEndDate = new Date(dependentTask.end_date);
        const newStartDate = new Date(currentStartDate);
        newStartDate.setDate(newStartDate.getDate() + delayDays);
        const newTaskEndDate = new Date(currentEndDate);
        newTaskEndDate.setDate(newTaskEndDate.getDate() + delayDays);
        const { error } = await supabase
          .from('project_tasks')
          .update({
            start_date: newStartDate.toISOString().split('T')[0],
            end_date: newTaskEndDate.toISOString().split('T')[0],
            updated_at: new Date().toISOString()
          })
          .eq('id', dependentTask.id);
        if (error) {
          warnings.push(`Failed to update dependent task "${dependentTask.name}": ${error.message}`);
          continue;
        }
        updatedTasks.push({
          taskId: dependentTask.id,
          taskName: dependentTask.name,
          oldStartDate: dependentTask.start_date,
          oldEndDate: dependentTask.end_date,
          newStartDate: newStartDate.toISOString().split('T')[0],
          newEndDate: newTaskEndDate.toISOString().split('T')[0],
          updateReason: `Cascade update due to rebaseline of "${rebaselinedTask.name}"`
        });
      }
      return { updatedTasks, warnings };
    } catch (error: any) {
      warnings.push(`Cascade update failed: ${error.message}`);
      return { updatedTasks, warnings };
    }
  }
  private static async logRebaselineAction(
    request: RebaselineRequest,
    result: RebaselineResult
  ): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      await supabase.from('rebaseline_history').insert({
        project_id: request.projectId,
        task_id: request.taskId,
        rebaseline_type: request.rebaselineType,
        reason: request.reason,
        old_start_date: result.updatedTasks[0]?.oldStartDate,
        old_end_date: result.updatedTasks[0]?.oldEndDate,
        new_start_date: request.newStartDate,
        new_end_date: request.newEndDate,
        affected_tasks_count: result.totalTasksUpdated,
        affected_task_ids: result.updatedTasks.map(t => t.taskId),
        cascade_method: request.cascadeMethod,
        created_by: user.user?.id,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log rebaseline action:', error);
    }
  }
} 