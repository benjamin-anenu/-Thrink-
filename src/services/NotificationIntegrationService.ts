import { PerformanceTracker } from './PerformanceTracker';
import { EmailReminderService } from './EmailReminderService';
import { EventBus } from './EventBus';

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
  private eventBus: EventBus;
  private notificationQueue: ProjectNotification[] = [];
  private isProcessingQueue = false;
  private performanceMonitorTimer: NodeJS.Timeout | null = null;
  private emailMonitorTimer: NodeJS.Timeout | null = null;

  public static getInstance(): NotificationIntegrationService {
    if (!NotificationIntegrationService.instance) {
      NotificationIntegrationService.instance = new NotificationIntegrationService();
    }
    return NotificationIntegrationService.instance;
  }

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.initializeServices();
    this.loadNotifications();
    this.startQueueProcessor();
  }

  private initializeServices() {
    // Connect to real-time events
    this.setupRealTimeEventListeners();
    
    // Connect to performance tracker events
    this.monitorPerformanceEvents();
    
    // Connect to email reminder events
    this.monitorEmailEvents();
    
    console.log('[Notification Integration] Service initialized and monitoring real events');
  }

  private setupRealTimeEventListeners() {
    // Listen for task completion events
    this.eventBus.subscribe('task_completed', (event) => {
      const { taskId, taskName, projectId, projectName, resourceId, resourceName } = event.payload;
      this.onTaskCompleted(taskId, taskName, projectId, projectName, resourceId, resourceName);
    });

    // Listen for deadline approaching events
    this.eventBus.subscribe('deadline_approaching', (event) => {
      const { taskId, taskName, projectId, projectName, daysRemaining } = event.payload;
      this.onDeadlineApproaching(taskId, taskName, projectId, projectName, daysRemaining);
    });

    // Listen for resource assignment events
    this.eventBus.subscribe('resource_assigned', (event) => {
      const { resourceId, resourceName, projectId, projectName, taskName } = event.payload;
      this.onResourceAssigned(resourceId, resourceName, projectId, projectName, taskName);
    });

    // Listen for project updates
    this.eventBus.subscribe('project_updated', (event) => {
      const { projectId, projectName, updateType, details } = event.payload;
      this.addNotification({
        title: 'Project Updated',
        message: `${projectName} has been updated`,
        type: 'info',
        category: 'project',
        priority: 'medium',
        projectId,
        projectName
      });
    });

    // Listen for performance alerts
    this.eventBus.subscribe('performance_alert', (event) => {
      const { resourceId, resourceName, riskLevel, currentScore } = event.payload;
      this.addNotification({
        title: `Performance Alert: ${riskLevel} Risk`,
        message: `${resourceName} performance requires attention (Score: ${Math.round(currentScore)})`,
        type: riskLevel === 'critical' ? 'error' : 'warning',
        category: 'performance',
        priority: riskLevel === 'critical' ? 'critical' : 'high',
        resourceId,
        resourceName,
        actionRequired: true
      });
    });

    // Listen for system heartbeat
    this.eventBus.subscribe('system_heartbeat', (event) => {
      // Update system status notifications if needed
      console.log('[Notification Integration] System heartbeat received');
    });
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

  private startQueueProcessor() {
    // Process notification queue every 2 seconds
    setInterval(() => {
      this.processNotificationQueue();
    }, 2000);
  }

  private async processNotificationQueue() {
    if (this.isProcessingQueue || this.notificationQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    
    try {
      const batchSize = 10;
      const batch = this.notificationQueue.splice(0, batchSize);
      
      batch.forEach(notification => {
        this.notifications.unshift(notification);
      });

      // Keep only the last 200 notifications for better performance
      if (this.notifications.length > 200) {
        this.notifications = this.notifications.slice(0, 200);
      }
      
      this.saveNotifications();
      this.notifyListeners();
      
      if (batch.length > 0) {
        console.log(`[Notification Integration] Processed ${batch.length} notifications`);
      }
    } catch (error) {
      console.error('[Notification Integration] Error processing queue:', error);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  private monitorPerformanceEvents() {
    // Optimized performance monitoring with less frequent checks
    this.performanceMonitorTimer = setInterval(() => {
      try {
        const performanceTracker = PerformanceTracker.getInstance();
        const profiles = performanceTracker.getAllProfiles();
        
        profiles.forEach(profile => {
          const recentNotificationKey = `${profile.resourceId}-performance`;
          if (profile.riskLevel === 'critical' && !this.hasRecentNotification(profile.resourceId, 'performance')) {
            this.queueNotification({
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
            this.queueNotification({
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
      } catch (error) {
        console.error('[Notification Integration] Error in performance monitoring:', error);
      }
    }, 120000); // Check every 2 minutes instead of 30 seconds
  }

  private monitorEmailEvents() {
    // Enhanced email monitoring with error handling
    this.emailMonitorTimer = setInterval(() => {
      try {
        const emailService = EmailReminderService.getInstance();
        const rebaselineRequests = emailService.getRebaselineRequests();
        
        rebaselineRequests.forEach(request => {
          if (request.status === 'pending' && !this.hasRecentNotification(request.taskId, 'deadline')) {
            this.queueNotification({
              title: 'Rebaseline Request Pending',
              message: `Task deadline extension requested: ${request.originalDeadline.toDateString()} → ${request.proposedDeadline.toDateString()}`,
              type: 'warning',
              category: 'deadline',
              priority: 'high',
              actionRequired: true
            });
          }
        });
      } catch (error) {
        console.error('[Notification Integration] Error in email monitoring:', error);
      }
    }, 300000); // Check every 5 minutes
  }

  private hasRecentNotification(entityId: string, category: string): boolean {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.notifications.some(n => 
      (n.resourceId === entityId || n.projectId === entityId) &&
      n.category === category &&
      n.timestamp > fiveMinutesAgo
    );
  }

  private queueNotification(notification: Omit<ProjectNotification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: ProjectNotification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };

    this.notificationQueue.push(newNotification);
    console.log(`[Notification Integration] Queued notification: ${newNotification.title}`);
  }

  public addNotification(notification: Omit<ProjectNotification, 'id' | 'timestamp' | 'read'>) {
    // For immediate notifications (backwards compatibility)
    this.queueNotification(notification);
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
    this.queueNotification({
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

    // Track performance with error handling
    try {
      const performanceTracker = PerformanceTracker.getInstance();
      performanceTracker.trackPositiveActivity(resourceId, 'task_completion', 8, `Completed task: ${taskName}`, projectId, taskId);
    } catch (error) {
      console.error('[Notification Integration] Error tracking performance:', error);
    }
  }

  public onDeadlineApproaching(taskId: string, taskName: string, projectId: string, projectName: string, daysRemaining: number) {
    const priority = daysRemaining <= 1 ? 'critical' : daysRemaining <= 3 ? 'high' : 'medium';
    const type = daysRemaining <= 1 ? 'error' : 'warning';

    this.queueNotification({
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
    this.queueNotification({
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
    this.queueNotification({
      title: completed ? 'Milestone Completed' : 'Milestone Due',
      message: `${milestoneName} ${completed ? 'has been completed' : 'is due'}`,
      type: completed ? 'success' : 'warning',
      category: 'project',
      priority: completed ? 'medium' : 'high',
      projectId,
      projectName
    });
  }

  public destroy() {
    if (this.performanceMonitorTimer) {
      clearInterval(this.performanceMonitorTimer);
    }
    if (this.emailMonitorTimer) {
      clearInterval(this.emailMonitorTimer);
    }
  }
}

// Initialize the service
export const initializeNotificationIntegration = () => {
  const service = NotificationIntegrationService.getInstance();
  console.log('[Notification Integration] Initialized with real-time event monitoring');
  return service;
};
