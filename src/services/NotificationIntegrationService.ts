
import { PerformanceTracker } from './PerformanceTracker';
import { EmailReminderService } from './EmailReminderService';

export interface ProjectNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: 'project' | 'deadline' | 'team' | 'system' | 'performance';
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectId?: string;
  projectName?: string;
  resourceId?: string;
  resourceName?: string;
  actionRequired?: boolean;
}

export class NotificationIntegrationService {
  private static instance: NotificationIntegrationService;
  private notifications: ProjectNotification[] = [];
  private listeners: ((notifications: ProjectNotification[]) => void)[] = [];

  public static getInstance(): NotificationIntegrationService {
    if (!NotificationIntegrationService.instance) {
      NotificationIntegrationService.instance = new NotificationIntegrationService();
    }
    return NotificationIntegrationService.instance;
  }

  private constructor() {
    this.initializeServices();
    this.loadNotifications();
  }

  private initializeServices() {
    // Connect to performance tracker events
    this.monitorPerformanceEvents();
    
    // Connect to email reminder events
    this.monitorEmailEvents();
    
    console.log('[Notification Integration] Service initialized and monitoring events');
  }

  private loadNotifications() {
    const saved = localStorage.getItem('project-notifications');
    if (saved) {
      this.notifications = JSON.parse(saved).map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
    }
  }

  private saveNotifications() {
    localStorage.setItem('project-notifications', JSON.stringify(this.notifications));
  }

  private monitorPerformanceEvents() {
    // Simulate performance-based notifications
    setInterval(() => {
      const performanceTracker = PerformanceTracker.getInstance();
      const profiles = performanceTracker.getAllProfiles();
      
      profiles.forEach(profile => {
        if (profile.riskLevel === 'critical' && !this.hasRecentNotification(profile.resourceId, 'performance')) {
          this.addNotification({
            title: 'Performance Alert: Critical Risk Detected',
            message: `${profile.resourceName} shows critical performance indicators. Immediate attention required.`,
            type: 'error',
            category: 'performance',
            priority: 'critical',
            resourceId: profile.resourceId,
            resourceName: profile.resourceName,
            actionRequired: true
          });
        } else if (profile.riskLevel === 'high' && !this.hasRecentNotification(profile.resourceId, 'performance')) {
          this.addNotification({
            title: 'Performance Warning',
            message: `${profile.resourceName} performance metrics require attention.`,
            type: 'warning',
            category: 'performance',
            priority: 'high',
            resourceId: profile.resourceId,
            resourceName: profile.resourceName,
            actionRequired: true
          });
        }
      });
    }, 30000); // Check every 30 seconds
  }

  private monitorEmailEvents() {
    // Monitor email reminder service
    setInterval(() => {
      const emailService = EmailReminderService.getInstance();
      const rebaselineRequests = emailService.getRebaselineRequests();
      
      rebaselineRequests.forEach(request => {
        if (request.status === 'pending' && !this.hasRecentNotification(request.taskId, 'deadline')) {
          this.addNotification({
            title: 'Rebaseline Request Pending',
            message: `Task deadline extension requested: ${request.originalDeadline.toDateString()} → ${request.proposedDeadline.toDateString()}`,
            type: 'warning',
            category: 'deadline',
            priority: 'high',
            actionRequired: true
          });
        }
      });
    }, 60000); // Check every minute
  }

  private hasRecentNotification(entityId: string, category: string): boolean {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.notifications.some(n => 
      (n.resourceId === entityId || n.projectId === entityId) &&
      n.category === category &&
      n.timestamp > fiveMinutesAgo
    );
  }

  public addNotification(notification: Omit<ProjectNotification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: ProjectNotification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };

    this.notifications.unshift(newNotification);
    this.saveNotifications();
    this.notifyListeners();
    
    console.log(`[Notification Integration] Added notification: ${newNotification.title}`);
  }

  public markAsRead(id: string) {
    this.notifications = this.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.saveNotifications();
    this.notifyListeners();
  }

  public markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.saveNotifications();
    this.notifyListeners();
  }

  public deleteNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotifications();
    this.notifyListeners();
  }

  public getNotifications(): ProjectNotification[] {
    return this.notifications;
  }

  public subscribe(listener: (notifications: ProjectNotification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  // Project event handlers
  public onTaskCompleted(taskId: string, taskName: string, projectId: string, projectName: string, resourceId: string, resourceName: string) {
    this.addNotification({
      title: 'Task Completed',
      message: `${taskName} has been completed by ${resourceName}`,
      type: 'success',
      category: 'project',
      priority: 'medium',
      projectId,
      projectName,
      resourceId,
      resourceName
    });

    // Track performance
    const performanceTracker = PerformanceTracker.getInstance();
    performanceTracker.trackPositiveActivity(resourceId, 'task_completion', 8, `Completed task: ${taskName}`, projectId, taskId);
  }

  public onDeadlineApproaching(taskId: string, taskName: string, projectId: string, projectName: string, daysRemaining: number) {
    const priority = daysRemaining <= 1 ? 'critical' : daysRemaining <= 3 ? 'high' : 'medium';
    const type = daysRemaining <= 1 ? 'error' : 'warning';

    this.addNotification({
      title: `Deadline ${daysRemaining <= 1 ? 'Today' : `in ${daysRemaining} days`}`,
      message: `${taskName} deadline is ${daysRemaining <= 1 ? 'today' : `approaching in ${daysRemaining} days`}`,
      type,
      category: 'deadline',
      priority,
      projectId,
      projectName,
      actionRequired: daysRemaining <= 3
    });
  }

  public onResourceAssigned(resourceId: string, resourceName: string, projectId: string, projectName: string, taskName: string) {
    this.addNotification({
      title: 'New Assignment',
      message: `${resourceName} has been assigned to ${taskName}`,
      type: 'info',
      category: 'team',
      priority: 'medium',
      projectId,
      projectName,
      resourceId,
      resourceName
    });
  }

  public onProjectMilestone(milestoneId: string, milestoneName: string, projectId: string, projectName: string, completed: boolean) {
    this.addNotification({
      title: completed ? 'Milestone Completed' : 'Milestone Due',
      message: `${milestoneName} ${completed ? 'has been completed' : 'is due'}`,
      type: completed ? 'success' : 'warning',
      category: 'project',
      priority: completed ? 'medium' : 'high',
      projectId,
      projectName
    });
  }
}

// Initialize the service
export const initializeNotificationIntegration = () => {
  const service = NotificationIntegrationService.getInstance();
  console.log('[Notification Integration] Initialized');
  return service;
};
