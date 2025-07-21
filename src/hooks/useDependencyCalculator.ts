import { useMemo, useCallback } from 'react';
import { ProjectTask } from '@/types/project';
import { DependencyCalculationService, DependencyCalculationResult, ParsedDependency } from '@/services/DependencyCalculationService';

export const useDependencyCalculator = (tasks: ProjectTask[]) => {
  const parseDependency = useCallback((depString: string): ParsedDependency => {
    return DependencyCalculationService.parseDependency(depString);
  }, []);

  const calculateTaskSchedule = useCallback(async (task: ProjectTask): Promise<DependencyCalculationResult> => {
    if (task.dependencies.length === 0) {
      return {
        suggestedStartDate: null,
        suggestedEndDate: null,
        hasConflicts: false,
        conflictDetails: []
      };
    }

    return await DependencyCalculationService.calculateTaskDatesFromDependencies(
      task.id,
      task.duration,
      task.dependencies
    );
  }, []);

  const cascadeDependencyUpdates = useCallback(async (taskId: string) => {
    return await DependencyCalculationService.cascadeDependencyUpdates(taskId);
  }, []);

  const getCriticalPath = useCallback(async (projectId: string) => {
    return await DependencyCalculationService.getCriticalPath(projectId);
  }, []);

  const getTasksWithScheduleConflicts = useCallback(async (): Promise<{
    task: ProjectTask;
    conflicts: DependencyCalculationResult;
  }[]> => {
    return await DependencyCalculationService.getTasksWithScheduleConflicts(tasks);
  }, [tasks]);

  const getDependentTasks = useCallback(async (taskId: string): Promise<ProjectTask[]> => {
    return await DependencyCalculationService.getDependentTasks(taskId, tasks);
  }, [tasks]);

  const checkCircularDependency = useCallback(async (taskId: string, newDependencyId: string): Promise<boolean> => {
    return await DependencyCalculationService.checkCircularDependency(taskId, newDependencyId);
  }, []);

  const validateAndAddDependency = useCallback(async (
    taskId: string,
    dependencyTaskId: string,
    dependencyType: ParsedDependency['type'],
    lagDays: number
  ) => {
    return await DependencyCalculationService.validateAndAddDependency(
      taskId,
      dependencyTaskId,
      dependencyType,
      lagDays
    );
  }, []);

  const setManualOverride = useCallback(async (taskId: string, override: boolean): Promise<void> => {
    return await DependencyCalculationService.setManualOverride(taskId, override);
  }, []);

  return {
    calculateTaskSchedule,
    getTasksWithScheduleConflicts,
    getDependentTasks,
    parseDependency,
    checkCircularDependency,
    validateAndAddDependency,
    cascadeDependencyUpdates,
    getCriticalPath,
    setManualOverride,
    formatDependency: DependencyCalculationService.formatDependency
  };
};
