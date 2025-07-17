
import { useMemo } from 'react';
import { ProjectTask } from '@/types/project';

interface ParsedDependency {
  taskId: string;
  type: string;
  lag: number;
}

export const useDependencyCalculator = (tasks: ProjectTask[]) => {
  const parseDependency = (depString: string): ParsedDependency => {
    const parts = depString.split(':');
    return {
      taskId: parts[0],
      type: parts[1] || 'finish-to-start',
      lag: parseInt(parts[2]) || 0
    };
  };

  const calculateTaskSchedule = useMemo(() => {
    return (task: ProjectTask): { suggestedStartDate: string; suggestedEndDate: string } | null => {
      if (task.dependencies.length === 0) {
        return null; // No dependencies, no suggestions
      }

      let latestRequiredStart = new Date(task.startDate);

      for (const depString of task.dependencies) {
        const dep = parseDependency(depString);
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
            // Work backwards from dependency end date
            const taskDuration = task.duration || 1;
            requiredStartDate = new Date(depEndDate);
            requiredStartDate.setDate(requiredStartDate.getDate() - taskDuration + 1 + dep.lag);
            break;
          case 'start-to-finish':
            // Work backwards from dependency start date
            const taskDuration2 = task.duration || 1;
            requiredStartDate = new Date(depStartDate);
            requiredStartDate.setDate(requiredStartDate.getDate() - taskDuration2 + 1 + dep.lag);
            break;
          default:
            continue;
        }

        if (requiredStartDate > latestRequiredStart) {
          latestRequiredStart = requiredStartDate;
        }
      }

      // Calculate end date based on duration
      const suggestedEndDate = new Date(latestRequiredStart);
      suggestedEndDate.setDate(suggestedEndDate.getDate() + (task.duration || 1) - 1);

      return {
        suggestedStartDate: latestRequiredStart.toISOString().split('T')[0],
        suggestedEndDate: suggestedEndDate.toISOString().split('T')[0]
      };
    };
  }, [tasks]);

  const getTasksWithScheduleConflicts = useMemo(() => {
    return tasks.filter(task => {
      const suggestion = calculateTaskSchedule(task);
      if (!suggestion) return false;

      const currentStart = new Date(task.startDate);
      const suggestedStart = new Date(suggestion.suggestedStartDate);

      return suggestedStart > currentStart;
    });
  }, [tasks, calculateTaskSchedule]);

  const getDependentTasks = useMemo(() => {
    return (taskId: string): ProjectTask[] => {
      return tasks.filter(task => 
        task.dependencies.some(dep => dep.split(':')[0] === taskId)
      );
    };
  }, [tasks]);

  return {
    calculateTaskSchedule,
    getTasksWithScheduleConflicts,
    getDependentTasks,
    parseDependency
  };
};
