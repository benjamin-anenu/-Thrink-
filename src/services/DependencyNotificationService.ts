import { supabase } from '@/integrations/supabase/client';
import { ProjectTask } from '@/types/project';
import { DependencyCalculationService } from './DependencyCalculationService';
import { toast } from 'sonner';

export interface DependencyNotification {
  id: string;
  type: 'conflict' | 'cascade_update' | 'circular_warning' | 'critical_path_change';
  taskId: string;
  taskName: string;
  message: string;
  details?: any;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

export class DependencyNotificationService {
  private static notifications: DependencyNotification[] = [];
  private static listeners: ((notifications: DependencyNotification[]) => void)[] = [];

  /**
   * Add a new dependency notification
   */
  static addNotification(notification: Omit<DependencyNotification, 'id' | 'timestamp'>) {
    const newNotification: DependencyNotification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    this.notifications.unshift(newNotification);
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    // Notify all listeners
    this.listeners.forEach(listener => listener([...this.notifications]));

    // Show toast notification
    this.showToastNotification(newNotification);
  }

  /**
   * Show appropriate toast notification
   */
  private static showToastNotification(notification: DependencyNotification) {
    switch (notification.severity) {
      case 'high':
        toast.error(notification.message);
        break;
      case 'medium':
        toast.warning(notification.message);
        break;
      case 'low':
        toast.info(notification.message);
        break;
    }
  }

  /**
   * Subscribe to notification updates
   */
  static subscribe(listener: (notifications: DependencyNotification[]) => void) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Get all notifications
   */
  static getNotifications(): DependencyNotification[] {
    return [...this.notifications];
  }

  /**
   * Clear all notifications
   */
  static clearNotifications() {
    this.notifications = [];
    this.listeners.forEach(listener => listener([]));
  }

  /**
   * Check for dependency conflicts and notify
   */
  static async checkAndNotifyConflicts(tasks: ProjectTask[]) {
    try {
      const conflictedTasks = await DependencyCalculationService.getTasksWithScheduleConflicts(tasks);
      
      conflictedTasks.forEach(({ task, conflicts }) => {
        this.addNotification({
          type: 'conflict',
          taskId: task.id,
          taskName: task.name,
          message: `Task "${task.name}" has dependency conflicts`,
          details: {
            currentStartDate: task.startDate,
            suggestedStartDate: conflicts.suggestedStartDate,
            conflictDetails: conflicts.conflictDetails
          },
          severity: 'medium'
        });
      });
    } catch (error) {
      console.error('Error checking dependency conflicts:', error);
    }
  }

  /**
   * Notify about cascading updates
   */
  static notifyCascadeUpdate(updatedTaskId: string, updatedTaskName: string, affectedTaskIds: string[], affectedTaskNames: string[]) {
    if (affectedTaskIds.length === 0) return;

    this.addNotification({
      type: 'cascade_update',
      taskId: updatedTaskId,
      taskName: updatedTaskName,
      message: `Task "${updatedTaskName}" update cascaded to ${affectedTaskIds.length} dependent task(s)`,
      details: {
        affectedTasks: affectedTaskIds.map((id, index) => ({
          id,
          name: affectedTaskNames[index]
        }))
      },
      severity: 'low'
    });
  }

  /**
   * Warn about potential circular dependencies
   */
  static warnCircularDependency(taskId: string, taskName: string, dependencyPath: string[]) {
    this.addNotification({
      type: 'circular_warning',
      taskId,
      taskName,
      message: `Potential circular dependency detected for task "${taskName}"`,
      details: {
        dependencyPath
      },
      severity: 'high'
    });
  }

  /**
   * Notify about critical path changes
   */
  static notifyCriticalPathChange(newCriticalPath: ProjectTask[], previousCriticalPath?: ProjectTask[]) {
    const criticalTaskNames = newCriticalPath.map(t => t.name);
    const previousTaskNames = previousCriticalPath?.map(t => t.name) || [];

    // Check if the critical path actually changed
    if (JSON.stringify(criticalTaskNames) === JSON.stringify(previousTaskNames)) {
      return;
    }

    this.addNotification({
      type: 'critical_path_change',
      taskId: newCriticalPath[0]?.id || '',
      taskName: 'Critical Path',
      message: `Critical path has changed. New path includes ${newCriticalPath.length} tasks`,
      details: {
        newCriticalPath: criticalTaskNames,
        previousCriticalPath: previousTaskNames
      },
      severity: 'medium'
    });
  }

  /**
   * Set up real-time listeners for database changes
   */
  static setupRealtimeListeners(projectId: string) {
    // Listen for task updates that might affect dependencies
    const subscription = supabase
      .channel('dependency_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'project_tasks',
          filter: `project_id=eq.${projectId}`
        },
        async (payload) => {
          const { new: newTask, old: oldTask } = payload;
          
          // Check if dates changed
          if (newTask.start_date !== oldTask.start_date || newTask.end_date !== oldTask.end_date) {
            // Notify about potential cascade updates
            this.addNotification({
              type: 'cascade_update',
              taskId: newTask.id,
              taskName: newTask.name,
              message: `Task "${newTask.name}" dates updated, checking dependent tasks...`,
              severity: 'low'
            });
          }

          // Check if dependencies changed
          if (JSON.stringify(newTask.dependencies) !== JSON.stringify(oldTask.dependencies)) {
            this.addNotification({
              type: 'conflict',
              taskId: newTask.id,
              taskName: newTask.name,
              message: `Dependencies updated for task "${newTask.name}"`,
              severity: 'low'
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }

  /**
   * Get notifications for a specific task
   */
  static getTaskNotifications(taskId: string): DependencyNotification[] {
    return this.notifications.filter(notification => notification.taskId === taskId);
  }

  /**
   * Get notifications by type
   */
  static getNotificationsByType(type: DependencyNotification['type']): DependencyNotification[] {
    return this.notifications.filter(notification => notification.type === type);
  }

  /**
   * Mark notifications as read (remove them)
   */
  static markAsRead(notificationIds: string[]) {
    this.notifications = this.notifications.filter(
      notification => !notificationIds.includes(notification.id)
    );
    this.listeners.forEach(listener => listener([...this.notifications]));
  }
}
