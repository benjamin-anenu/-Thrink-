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
        hasConflicts: result?.has_conflicts || false
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
      
      // First call the database function to cascade updates
      const { error: cascadeError } = await supabase.rpc('cascade_dependency_updates', {
        updated_task_id: updatedTaskId
      });

      if (cascadeError) {
        console.error('DependencyCalculationService: Cascade function error:', cascadeError);
        throw cascadeError;
      }

      // Since the database function doesn't return details, we'll simulate the response
      // In a real implementation, you'd modify the database function to return this data
      console.log('DependencyCalculationService: Cascade updates completed successfully');

      // For now, return empty results since the DB function handles the updates
      const result = {
        updatedTasks: [],
        totalUpdated: 0
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
   * Enhanced cascade function that tracks changes
   */
  static async cascadeDependencyUpdatesWithTracking(updatedTaskId: string): Promise<{
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
      console.log('DependencyCalculationService: Starting tracked cascade for task:', updatedTaskId);
      
      const updatedTasks: Array<{
        taskId: string;
        oldStartDate: string | null;
        newStartDate: string | null;
        oldEndDate: string | null;
        newEndDate: string | null;
        updateReason: string;
      }> = [];

      // Get all tasks that might be affected
      const { data: allTasks, error: fetchError } = await supabase
        .from('project_tasks')
        .select('*')
        .not('dependencies', 'is', null);

      if (fetchError) {
        console.error('Error fetching tasks for cascade:', fetchError);
        throw fetchError;
      }

      // Find tasks that depend on the updated task
      const dependentTasks = allTasks?.filter(task => 
        task.dependencies?.some(dep => {
          const depTaskId = dep.split(':')[0];
          return depTaskId === updatedTaskId;
        })
      ) || [];

      console.log('DependencyCalculationService: Found dependent tasks:', dependentTasks.length);

      // Process each dependent task
      for (const dependentTask of dependentTasks) {
        if (dependentTask.manual_override_dates) {
          console.log('DependencyCalculationService: Skipping manually overridden task:', dependentTask.id);
          continue;
        }

        try {
          const oldStartDate = dependentTask.start_date;
          const oldEndDate = dependentTask.end_date;

          // Calculate new dates
          const dateResult = await this.calculateTaskDatesFromDependencies(
            dependentTask.id,
            dependentTask.duration || 1,
            dependentTask.dependencies || []
          );

          if (dateResult.suggestedStartDate && dateResult.suggestedEndDate) {
            // Update the task
            const { error: updateError } = await supabase
              .from('project_tasks')
              .update({
                start_date: dateResult.suggestedStartDate,
                end_date: dateResult.suggestedEndDate,
                updated_at: new Date().toISOString()
              })
              .eq('id', dependentTask.id);

            if (updateError) {
              console.error('Error updating dependent task:', updateError);
              continue;
            }

            updatedTasks.push({
              taskId: dependentTask.id,
              oldStartDate,
              newStartDate: dateResult.suggestedStartDate,
              oldEndDate,
              newEndDate: dateResult.suggestedEndDate,
              updateReason: `Dependency updated for task ${updatedTaskId}`
            });

            console.log('DependencyCalculationService: Updated dependent task:', dependentTask.id);
          }
        } catch (taskError) {
          console.error('Error processing dependent task:', dependentTask.id, taskError);
        }
      }

      const result = {
        updatedTasks,
        totalUpdated: updatedTasks.length
      };

      console.log('DependencyCalculationService: Tracked cascade result:', result);
      return result;
    } catch (error) {
      console.error('Error in tracked cascade updates:', error);
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

      if (error) {
        console.warn('Database critical path function failed, using fallback calculation:', error);
        return await this.calculateCriticalPathFallback(projectId);
      }

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
      return await this.calculateCriticalPathFallback(projectId);
    }
  }

  /**
   * Fallback critical path calculation using client-side algorithm
   */
  private static async calculateCriticalPathFallback(projectId: string): Promise<Array<{
    taskId: string;
    taskName: string;
    startDate: string | null;
    endDate: string | null;
    duration: number;
    totalFloat: number;
    isCritical: boolean;
  }>> {
    try {
      // Get all tasks for the project
      const { data: tasks, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId);

      if (error || !tasks) {
        console.error('Failed to fetch tasks for critical path calculation:', error);
        return [];
      }

      // Build dependency graph
      const taskMap = new Map(tasks.map(task => [task.id, task]));
      const predecessors = new Map<string, string[]>();
      const successors = new Map<string, string[]>();

      // Initialize maps
      tasks.forEach(task => {
        predecessors.set(task.id, []);
        successors.set(task.id, []);
      });

      // Parse dependencies
      tasks.forEach(task => {
        const deps = task.dependencies || [];
        deps.forEach((depString: string) => {
          const parsed = this.parseDependency(depString);
          predecessors.get(task.id)?.push(parsed.taskId);
          successors.get(parsed.taskId)?.push(task.id);
        });
      });

      // Calculate early start/finish times (forward pass)
      const earlyStart = new Map<string, number>();
      const earlyFinish = new Map<string, number>();
      const visited = new Set<string>();

      const calculateEarlyTimes = (taskId: string): number => {
        if (visited.has(taskId)) return earlyFinish.get(taskId) || 0;
        visited.add(taskId);

        const task = taskMap.get(taskId);
        if (!task) return 0;

        const taskPredecessors = predecessors.get(taskId) || [];
        let maxPredecessorFinish = 0;

        taskPredecessors.forEach(predId => {
          if (taskMap.has(predId)) {
            maxPredecessorFinish = Math.max(maxPredecessorFinish, calculateEarlyTimes(predId));
          }
        });

        const es = maxPredecessorFinish;
        const ef = es + (task.duration || 1);

        earlyStart.set(taskId, es);
        earlyFinish.set(taskId, ef);

        return ef;
      };

      // Calculate for all tasks
      tasks.forEach(task => calculateEarlyTimes(task.id));

      // Find project finish time
      const projectFinish = Math.max(...Array.from(earlyFinish.values()));

      // Calculate late start/finish times (backward pass)
      const lateStart = new Map<string, number>();
      const lateFinish = new Map<string, number>();
      const backwardVisited = new Set<string>();

      const calculateLateTimes = (taskId: string): number => {
        if (backwardVisited.has(taskId)) return lateStart.get(taskId) || 0;
        backwardVisited.add(taskId);

        const task = taskMap.get(taskId);
        if (!task) return 0;

        const taskSuccessors = successors.get(taskId) || [];
        let minSuccessorStart = projectFinish;

        if (taskSuccessors.length === 0) {
          // No successors, this is an end task
          minSuccessorStart = projectFinish;
        } else {
          taskSuccessors.forEach(succId => {
            if (taskMap.has(succId)) {
              minSuccessorStart = Math.min(minSuccessorStart, calculateLateTimes(succId));
            }
          });
        }

        const lf = minSuccessorStart;
        const ls = lf - (task.duration || 1);

        lateStart.set(taskId, ls);
        lateFinish.set(taskId, lf);

        return ls;
      };

      // Calculate for all tasks
      tasks.forEach(task => calculateLateTimes(task.id));

      // Calculate total float and identify critical tasks
      return tasks.map(task => {
        const es = earlyStart.get(task.id) || 0;
        const ef = earlyFinish.get(task.id) || 0;
        const ls = lateStart.get(task.id) || 0;
        const lf = lateFinish.get(task.id) || 0;
        const totalFloat = ls - es;

        return {
          taskId: task.id,
          taskName: task.name || 'Unnamed Task',
          startDate: task.start_date,
          endDate: task.end_date,
          duration: task.duration || 1,
          totalFloat,
          isCritical: totalFloat === 0
        };
      }).filter(task => task.isCritical); // Return only critical path tasks

    } catch (error) {
      console.error('Fallback critical path calculation failed:', error);
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
