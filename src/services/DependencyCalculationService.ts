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
   * Calculate task dates based on dependencies using database function
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
        conflictDetails: result?.has_conflicts ? ['Multiple dependencies create scheduling conflicts'] : undefined
      };
    } catch (error) {
      console.error('Error calculating task dates from dependencies:', error);
      return {
        suggestedStartDate: null,
        suggestedEndDate: null,
        hasConflicts: false
      };
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
   * Trigger cascade updates for dependent tasks
   */
  static async cascadeDependencyUpdates(updatedTaskId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('cascade_dependency_updates', {
        updated_task_id: updatedTaskId
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error cascading dependency updates:', error);
      throw error;
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
   * Calculate critical path for a project
   */
  static calculateCriticalPath(tasks: ProjectTask[]): ProjectTask[] {
    // Simple critical path calculation - can be enhanced with more sophisticated algorithms
    const taskMap = new Map(tasks.map(task => [task.id, task]));
    const visited = new Set<string>();
    const criticalTasks: ProjectTask[] = [];

    // Find tasks with no successors (end tasks)
    const endTasks = tasks.filter(task => 
      !tasks.some(otherTask => 
        otherTask.dependencies.some(dep => 
          this.parseDependency(dep).taskId === task.id
        )
      )
    );

    // Trace back from end tasks to find longest path
    const findLongestPath = (taskId: string, currentPath: ProjectTask[]): ProjectTask[] => {
      if (visited.has(taskId)) return currentPath;
      
      const task = taskMap.get(taskId);
      if (!task) return currentPath;

      visited.add(taskId);
      const newPath = [task, ...currentPath];

      let longestPath = newPath;

      // Check all dependencies to find the longest path
      for (const depString of task.dependencies) {
        const dep = this.parseDependency(depString);
        const depPath = findLongestPath(dep.taskId, newPath);
        if (depPath.length > longestPath.length) {
          longestPath = depPath;
        }
      }

      return longestPath;
    };

    // Find the longest path from all end tasks
    let longestCriticalPath: ProjectTask[] = [];
    for (const endTask of endTasks) {
      visited.clear();
      const path = findLongestPath(endTask.id, []);
      if (path.length > longestCriticalPath.length) {
        longestCriticalPath = path;
      }
    }

    return longestCriticalPath;
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