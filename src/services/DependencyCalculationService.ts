import { supabase } from '@/integrations/supabase/client';
import { ProjectTask } from '@/types/project';

export interface DependencyCalculationResult {
  suggestedStartDate: string | null;
  suggestedEndDate: string | null;
  hasConflicts: boolean;
  conflictDetails?: string[];
}

export interface ParsedDependency {
  taskId: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
  lag: number;
}

export class DependencyCalculationService {
  /**
   * Parse a dependency string into its components
   */
  static parseDependency(depString: string): ParsedDependency {
    const parts = depString.split(':');
    return {
      taskId: parts[0],
      type: (parts[1] as ParsedDependency['type']) || 'finish-to-start',
      lag: parseInt(parts[2]) || 0
    };
  }

  /**
   * Format a dependency object into a string
   */
  static formatDependency(dep: ParsedDependency): string {
    return `${dep.taskId}:${dep.type}:${dep.lag}`;
  }

  /**
   * Calculate task dates based on dependencies using enhanced database function
   */
  static async calculateTaskDatesFromDependencies(
    taskId: string,
    duration: number,
    dependencies: string[]
  ): Promise<DependencyCalculationResult> {
    try {
      const { data, error } = await supabase.rpc('calculate_task_dates_from_dependencies', {
        task_id_param: taskId,
        task_duration: duration,
        task_dependencies: dependencies
      });

      if (error) throw error;

      const result = data[0];
      return {
        suggestedStartDate: result?.suggested_start_date || null,
        suggestedEndDate: result?.suggested_end_date || null,
        hasConflicts: result?.has_conflicts || false,
        conflictDetails: result?.conflict_details || []
      };
    } catch (error) {
      console.error('Error calculating task dates from dependencies:', error);
      return {
        suggestedStartDate: null,
        suggestedEndDate: null,
        hasConflicts: false,
        conflictDetails: []
      };
    }
  }

  /**
   * Trigger cascade updates for dependent tasks with detailed results
   */
  static async cascadeDependencyUpdates(updatedTaskId: string): Promise<{
    updatedTasks: Array<{
      taskId: string;
      oldStartDate: string | null;
      newStartDate: string | null;
      oldEndDate: string | null;
      newEndDate: string | null;
      updateReason: string;
    }>;
    totalUpdated: number;
  }> {
    try {
      const { data, error } = await supabase.rpc('cascade_dependency_updates', {
        updated_task_id: updatedTaskId
      });

      if (error) throw error;

      const updatedTasks = data?.map((row: any) => ({
        taskId: row.updated_task_id,
        oldStartDate: row.old_start_date,
        newStartDate: row.new_start_date,
        oldEndDate: row.old_end_date,
        newEndDate: row.new_end_date,
        updateReason: row.update_reason
      })) || [];

      return {
        updatedTasks,
        totalUpdated: updatedTasks.length
      };
    } catch (error) {
      console.error('Error cascading dependency updates:', error);
      return {
        updatedTasks: [],
        totalUpdated: 0
      };
    }
  }

  /**
   * Get all tasks that depend on a specific task
   */
  static async getDependentTasks(taskId: string, allTasks: ProjectTask[]): Promise<ProjectTask[]> {
    return allTasks.filter(task => 
      task.dependencies.some(dep => {
        const parsed = this.parseDependency(dep);
        return parsed.taskId === taskId;
      })
    );
  }

  /**
   * Get all tasks with schedule conflicts
   */
  static async getTasksWithScheduleConflicts(tasks: ProjectTask[]): Promise<{
    task: ProjectTask;
    conflicts: DependencyCalculationResult;
  }[]> {
    const conflictedTasks: { task: ProjectTask; conflicts: DependencyCalculationResult }[] = [];

    for (const task of tasks) {
      if (task.dependencies.length === 0) continue;

      const calculation = await this.calculateTaskDatesFromDependencies(
        task.id,
        task.duration,
        task.dependencies
      );

      // Check if current dates differ from suggested dates
      const hasDateConflict = calculation.suggestedStartDate && 
        (task.startDate !== calculation.suggestedStartDate || 
         task.endDate !== calculation.suggestedEndDate);

      if (calculation.hasConflicts || hasDateConflict) {
        conflictedTasks.push({ task, conflicts: calculation });
      }
    }

    return conflictedTasks;
  }

  /**
   * Validate and add a new dependency to a task
   */
  static async validateAndAddDependency(
    taskId: string,
    dependencyTaskId: string,
    dependencyType: ParsedDependency['type'],
    lagDays: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check for circular dependency
      const hasCircular = await this.checkCircularDependency(taskId, dependencyTaskId);
      if (hasCircular) {
        return {
          success: false,
          error: 'This dependency would create a circular reference'
        };
      }

      // Check if dependency already exists
      const { data: currentTask, error: fetchError } = await supabase
        .from('project_tasks')
        .select('dependencies')
        .eq('id', taskId)
        .single();

      if (fetchError) throw fetchError;

      const currentDependencies = currentTask.dependencies || [];
      const existingDep = currentDependencies.find(dep => dep.startsWith(dependencyTaskId));
      
      if (existingDep) {
        return {
          success: false,
          error: 'Dependency already exists for this task'
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error validating dependency:', error);
      return {
        success: false,
        error: 'Failed to validate dependency'
      };
    }
  }

  /**
   * Get critical path for a project
   */
  static async getCriticalPath(projectId: string): Promise<Array<{
    taskId: string;
    taskName: string;
    startDate: string | null;
    endDate: string | null;
    duration: number;
    totalFloat: number;
    isCritical: boolean;
  }>> {
    try {
      const { data, error } = await supabase.rpc('get_critical_path', {
        project_id_param: projectId
      });

      if (error) throw error;

      return data?.map((row: any) => ({
        taskId: row.task_id,
        taskName: row.task_name,
        startDate: row.start_date,
        endDate: row.end_date,
        duration: row.duration,
        totalFloat: row.total_float,
        isCritical: row.is_critical
      })) || [];
    } catch (error) {
      console.error('Error getting critical path:', error);
      return [];
    }
  }

  /**
   * Check for circular dependencies using database function
   */
  static async checkCircularDependency(taskId: string, newDependencyId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_circular_dependency', {
        task_id_param: taskId,
        new_dependency_id: newDependencyId
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking circular dependency:', error);
      return false;
    }
  }

  /**
   * Set manual override flag for a task
   */
  static async setManualOverride(taskId: string, override: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ manual_override_dates: override })
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error setting manual override:', error);
      throw error;
    }
  }
}
