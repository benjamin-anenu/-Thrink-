
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
      console.log('DependencyCalculationService: Calculating dates for task', taskId, 'with dependencies:', dependencies);
      
      const { data, error } = await supabase.rpc('calculate_task_dates_from_dependencies', {
        task_id_param: taskId,
        task_duration: duration,
        task_dependencies: dependencies
      });

      if (error) {
        console.error('DependencyCalculationService: Database function error:', error);
        throw error;
      }

      console.log('DependencyCalculationService: Raw result from database:', data);

      const result = data?.[0];
      const calculationResult = {
        suggestedStartDate: result?.suggested_start_date || null,
        suggestedEndDate: result?.suggested_end_date || null,
        hasConflicts: result?.has_conflicts || false,
        conflictDetails: result?.conflict_details || []
      };

      console.log('DependencyCalculationService: Final calculation result:', calculationResult);
      return calculationResult;
    } catch (error) {
      console.error('Error calculating task dates from dependencies:', error);
      return {
        suggestedStartDate: null,
        suggestedEndDate: null,
        hasConflicts: false,
        conflictDetails: [`Error calculating dates: ${error.message}`]
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
      console.log('DependencyCalculationService: Cascading updates for task:', updatedTaskId);
      
      const { data, error } = await supabase.rpc('cascade_dependency_updates', {
        updated_task_id: updatedTaskId
      });

      if (error) {
        console.error('DependencyCalculationService: Cascade function error:', error);
        throw error;
      }

      console.log('DependencyCalculationService: Cascade result:', data);

      const updatedTasks = (data || []).map((row: any) => ({
        taskId: row.updated_task_id,
        oldStartDate: row.old_start_date,
        newStartDate: row.new_start_date,
        oldEndDate: row.old_end_date,
        newEndDate: row.new_end_date,
        updateReason: row.update_reason
      }));

      const result = {
        updatedTasks,
        totalUpdated: updatedTasks.length
      };

      console.log('DependencyCalculationService: Final cascade result:', result);
      return result;
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
      console.log('DependencyCalculationService: Validating dependency:', {
        taskId,
        dependencyTaskId,
        dependencyType,
        lagDays
      });

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

      if (fetchError) {
        console.error('DependencyCalculationService: Error fetching task:', fetchError);
        throw fetchError;
      }

      const currentDependencies = currentTask.dependencies || [];
      const existingDep = currentDependencies.find(dep => dep.startsWith(dependencyTaskId));
      
      if (existingDep) {
        return {
          success: false,
          error: 'Dependency already exists for this task'
        };
      }

      console.log('DependencyCalculationService: Validation passed');
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
        project_uuid: projectId
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
      console.log('DependencyCalculationService: Checking circular dependency:', taskId, '->', newDependencyId);
      
      const { data, error } = await supabase.rpc('check_circular_dependency', {
        task_id_param: taskId,
        new_dependency_id: newDependencyId
      });

      if (error) {
        console.error('DependencyCalculationService: Circular check error:', error);
        throw error;
      }
      
      const isCircular = data || false;
      console.log('DependencyCalculationService: Circular dependency result:', isCircular);
      return isCircular;
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
      console.log('DependencyCalculationService: Setting manual override for task:', taskId, 'to:', override);
      
      const { error } = await supabase
        .from('project_tasks')
        .update({ manual_override_dates: override })
        .eq('id', taskId);

      if (error) {
        console.error('DependencyCalculationService: Manual override error:', error);
        throw error;
      }
      
      console.log('DependencyCalculationService: Manual override set successfully');
    } catch (error) {
      console.error('Error setting manual override:', error);
      throw error;
    }
  }

  /**
   * Calculate critical path (alias for getCriticalPath for backward compatibility)
   */
  static async calculateCriticalPath(projectId: string) {
    return await this.getCriticalPath(projectId);
  }
}
