
import React from 'react';
import { ProjectTask, ProjectMilestone } from '@/types/project';
import { differenceInDays, addDays, parseISO } from 'date-fns';

export class TaskAutomationEngine {
  static autoScheduleTasks(tasks: ProjectTask[]): ProjectTask[] {
    const taskMap = new Map(tasks.map(task => [task.id, task]));
    const scheduledTasks = new Map<string, ProjectTask>();

    // Sort tasks by hierarchy level and dependencies
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a.hierarchyLevel !== b.hierarchyLevel) {
        return a.hierarchyLevel - b.hierarchyLevel;
      }
      return a.dependencies.length - b.dependencies.length;
    });

    for (const task of sortedTasks) {
      let earliestStartDate = parseISO(task.startDate);

      // Check dependency constraints
      for (const depId of task.dependencies) {
        const [taskId, relationType = 'finish-to-start', lag = '0'] = depId.split(':');
        const depTask = scheduledTasks.get(taskId) || taskMap.get(taskId);
        
        if (depTask) {
          const depEndDate = parseISO(depTask.endDate);
          const lagDays = parseInt(lag) || 0;
          let requiredStartDate: Date;

          switch (relationType) {
            case 'finish-to-start':
              requiredStartDate = addDays(depEndDate, 1 + lagDays);
              break;
            case 'start-to-start':
              requiredStartDate = addDays(parseISO(depTask.startDate), lagDays);
              break;
            case 'finish-to-finish':
              requiredStartDate = addDays(depEndDate, lagDays - task.duration + 1);
              break;
            case 'start-to-finish':
              requiredStartDate = addDays(parseISO(depTask.startDate), lagDays - task.duration + 1);
              break;
            default:
              requiredStartDate = addDays(depEndDate, 1 + lagDays);
          }

          if (requiredStartDate > earliestStartDate) {
            earliestStartDate = requiredStartDate;
          }
        }
      }

      // Calculate new dates
      const newStartDate = earliestStartDate.toISOString().split('T')[0];
      const newEndDate = addDays(earliestStartDate, task.duration - 1).toISOString().split('T')[0];

      const scheduledTask: ProjectTask = {
        ...task,
        startDate: newStartDate,
        endDate: newEndDate
      };

      scheduledTasks.set(task.id, scheduledTask);
    }

    return Array.from(scheduledTasks.values());
  }

  static calculateParentTaskProgress(taskId: string, allTasks: ProjectTask[]): number {
    const childTasks = allTasks.filter(task => task.parentTaskId === taskId);
    
    if (childTasks.length === 0) {
      return allTasks.find(task => task.id === taskId)?.progress || 0;
    }

    let totalProgress = 0;
    let totalWeight = 0;

    for (const childTask of childTasks) {
      const childProgress = this.calculateParentTaskProgress(childTask.id, allTasks);
      const weight = childTask.duration || 1;
      totalProgress += childProgress * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? Math.round(totalProgress / totalWeight) : 0;
  }

  static suggestMilestoneAssignment(task: ProjectTask, milestones: ProjectMilestone[]): string | undefined {
    const taskEndDate = parseISO(task.endDate);
    
    // Find the closest milestone after the task end date
    const futureMilestones = milestones
      .filter(milestone => parseISO(milestone.date) >= taskEndDate)
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

    return futureMilestones[0]?.id;
  }

  static detectScheduleConflicts(tasks: ProjectTask[]): Array<{
    taskId: string;
    type: 'dependency_violation' | 'resource_overallocation' | 'date_constraint';
    description: string;
    severity: 'low' | 'medium' | 'high';
  }> {
    const conflicts: Array<{
      taskId: string;
      type: 'dependency_violation' | 'resource_overallocation' | 'date_constraint';
      description: string;
      severity: 'low' | 'medium' | 'high';
    }> = [];

    for (const task of tasks) {
      // Check for dependency violations
      for (const depId of task.dependencies) {
        const [taskId] = depId.split(':');
        const depTask = tasks.find(t => t.id === taskId);
        
        if (depTask && parseISO(depTask.endDate) >= parseISO(task.startDate)) {
          conflicts.push({
            taskId: task.id,
            type: 'dependency_violation',
            description: `Task starts before dependency "${depTask.name}" completes`,
            severity: 'high'
          });
        }
      }

      // Check for baseline violations
      if (task.baselineEndDate && parseISO(task.endDate) > parseISO(task.baselineEndDate)) {
        const daysDiff = differenceInDays(parseISO(task.endDate), parseISO(task.baselineEndDate));
        conflicts.push({
          taskId: task.id,
          type: 'date_constraint',
          description: `Task is ${daysDiff} days behind baseline`,
          severity: daysDiff > 7 ? 'high' : daysDiff > 3 ? 'medium' : 'low'
        });
      }
    }

    return conflicts;
  }

  static optimizeTaskSequence(tasks: ProjectTask[]): ProjectTask[] {
    // Critical Path Method (CPM) implementation
    const taskMap = new Map(tasks.map(task => [task.id, task]));
    const optimizedTasks = [...tasks];

    // Calculate earliest start/finish times
    for (const task of optimizedTasks) {
      let earliestStart = parseISO(task.startDate);
      
      for (const depId of task.dependencies) {
        const [taskId] = depId.split(':');
        const depTask = taskMap.get(taskId);
        if (depTask) {
          const depFinish = addDays(parseISO(depTask.endDate), 1);
          if (depFinish > earliestStart) {
            earliestStart = depFinish;
          }
        }
      }

      task.startDate = earliestStart.toISOString().split('T')[0];
      task.endDate = addDays(earliestStart, task.duration - 1).toISOString().split('T')[0];
    }

    return optimizedTasks;
  }

  static generateTaskRecommendations(task: ProjectTask, allTasks: ProjectTask[], milestones: ProjectMilestone[]): string[] {
    const recommendations: string[] = [];

    // Check if task has no dependencies but starts late
    if (task.dependencies.length === 0 && parseISO(task.startDate) > new Date()) {
      recommendations.push("Consider starting this task earlier as it has no dependencies");
    }

    // Check if task duration is very long
    if (task.duration > 30) {
      recommendations.push("This task might benefit from being broken down into smaller subtasks");
    }

    // Check if task has no assigned resources
    if (task.assignedResources.length === 0) {
      recommendations.push("Assign resources to this task to ensure accountability");
    }

    // Check if task is behind schedule
    if (task.baselineEndDate && parseISO(task.endDate) > parseISO(task.baselineEndDate)) {
      recommendations.push("This task is behind schedule - consider adding more resources or reducing scope");
    }

    // Check if task should be linked to a milestone
    if (!task.milestoneId) {
      const suggestedMilestone = this.suggestMilestoneAssignment(task, milestones);
      if (suggestedMilestone) {
        const milestone = milestones.find(m => m.id === suggestedMilestone);
        recommendations.push(`Consider linking this task to milestone "${milestone?.name}"`);
      }
    }

    return recommendations;
  }
}
