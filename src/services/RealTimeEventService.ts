
import { EventBus } from './EventBus';
import { PerformanceTracker } from './PerformanceTracker';
import { EmailReminderService } from './EmailReminderService';
import { NotificationIntegrationService } from './NotificationIntegrationService';

export class RealTimeEventService {
  private static instance: RealTimeEventService;
  private eventBus: EventBus;
  private performanceTracker: PerformanceTracker;
  private emailService: EmailReminderService;
  private notificationService: NotificationIntegrationService;
  private isInitialized = false;

  public static getInstance(): RealTimeEventService {
    if (!RealTimeEventService.instance) {
      RealTimeEventService.instance = new RealTimeEventService();
    }
    return RealTimeEventService.instance;
  }

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.performanceTracker = PerformanceTracker.getInstance();
    this.emailService = EmailReminderService.getInstance();
    this.notificationService = NotificationIntegrationService.getInstance();
  }

  public initialize(): void {
    if (this.isInitialized) {
      console.log('[Real-time Event Service] Already initialized');
      return;
    }

    console.log('[Real-time Event Service] Initializing...');
    
    this.setupEventListeners();
    this.startPerformanceMonitoring();
    this.initializeNotifications();
    
    this.isInitialized = true;
    console.log('[Real-time Event Service] Initialized successfully');
  }

  private setupEventListeners(): void {
    // Task completion events
    this.eventBus.subscribe('task_completed', (event) => {
      console.log('[Real-time Events] Task completed:', event.payload);
      this.handleTaskCompletion(event.payload);
    });

    // Task creation events
    this.eventBus.subscribe('task_created', (event) => {
      console.log('[Real-time Events] Task created:', event.payload);
      this.handleTaskCreation(event.payload);
    });

    // Project update events
    this.eventBus.subscribe('project_updated', (event) => {
      console.log('[Real-time Events] Project updated:', event.payload);
      this.handleProjectUpdate(event.payload);
    });

    // Resource assignment events
    this.eventBus.subscribe('resource_assigned', (event) => {
      console.log('[Real-time Events] Resource assigned:', event.payload);
      this.handleResourceAssignment(event.payload);
    });

    // Deadline approaching events
    this.eventBus.subscribe('deadline_approaching', (event) => {
      console.log('[Real-time Events] Deadline approaching:', event.payload);
      this.handleDeadlineApproaching(event.payload);
    });

    // Context update events
    this.eventBus.subscribe('context_updated', (event) => {
      console.log('[Real-time Events] Context updated:', event.payload);
      this.handleContextUpdate(event.payload);
    });
  }

  private handleTaskCompletion(payload: any): void {
    const { taskId, projectId, assignedTo, completionTime } = payload;
    
    // Track performance metrics
    this.performanceTracker.trackTaskCompletion(taskId, assignedTo, completionTime);
    
    // Send completion notifications
    this.notificationService.addNotification({
      id: `task-completion-${Date.now()}`,
      type: 'success',
      title: 'Task Completed',
      message: `Task has been successfully completed`,
      timestamp: new Date(),
      read: false,
      priority: 'medium',
      category: 'task',
      projectId
    });

    // Emit milestone check event
    this.eventBus.emit('milestone_reached', {
      projectId,
      taskId,
      timestamp: new Date()
    }, 'real_time_service');
  }

  private handleTaskCreation(payload: any): void {
    const { task, projectId, assignedTo } = payload;
    
    // Set up deadline reminders
    if (task.endDate) {
      this.emailService.scheduleReminder({
        taskId: task.id,
        taskName: task.name,
        projectId,
        dueDate: new Date(task.endDate),
        assignedTo,
        reminderTypes: ['3_days', '1_day']
      });
    }

    // Send creation notification
    this.notificationService.addNotification({
      id: `task-creation-${Date.now()}`,
      type: 'info',
      title: 'New Task Created',
      message: `New task "${task.name}" has been created`,
      timestamp: new Date(),
      read: false,
      priority: 'low',
      category: 'task',
      projectId
    });
  }

  private handleProjectUpdate(payload: any): void {
    const { projectId, updates, timestamp } = payload;
    
    // Track project performance changes
    this.performanceTracker.updateProjectMetrics(projectId, updates);
    
    // Send update notification
    this.notificationService.addNotification({
      id: `project-update-${Date.now()}`,
      type: 'info',
      title: 'Project Updated',
      message: `Project has been updated`,
      timestamp: new Date(timestamp),
      read: false,
      priority: 'medium',
      category: 'project',
      projectId
    });
  }

  private handleResourceAssignment(payload: any): void {
    const { resourceId, projectId, taskId, assignmentDate } = payload;
    
    // Track resource utilization
    this.performanceTracker.trackResourceAssignment(resourceId, projectId, assignmentDate);
    
    // Send assignment notification
    this.notificationService.addNotification({
      id: `resource-assignment-${Date.now()}`,
      type: 'info',
      title: 'Resource Assigned',
      message: `Resource has been assigned to project`,
      timestamp: new Date(),
      read: false,
      priority: 'medium',
      category: 'resource',
      projectId
    });
  }

  private handleDeadlineApproaching(payload: any): void {
    const { taskId, taskName, projectId, dueDate, daysRemaining } = payload;
    
    // Send urgent notification
    this.notificationService.addNotification({
      id: `deadline-${taskId}-${Date.now()}`,
      type: 'warning',
      title: 'Deadline Approaching',
      message: `Task "${taskName}" is due in ${daysRemaining} day(s)`,
      timestamp: new Date(),
      read: false,
      priority: 'high',
      category: 'deadline',
      projectId,
      actionRequired: true
    });

    // Trigger email reminder
    this.emailService.sendUrgentReminder(taskId, taskName, projectId, new Date(dueDate));
  }

  private handleContextUpdate(payload: any): void {
    const { type, data } = payload;
    
    // Log context changes for debugging
    console.log(`[Real-time Events] Context updated - ${type}:`, data);
    
    // Update performance metrics based on context changes
    if (type === 'stakeholder_updated' || type === 'stakeholder_created') {
      this.performanceTracker.updateStakeholderMetrics(data);
    }
    
    if (type === 'resource_updated' || type === 'resource_created') {
      this.performanceTracker.updateResourceMetrics(data);
    }
  }

  private startPerformanceMonitoring(): void {
    // Start real-time performance tracking
    this.performanceTracker.startMonitoring();
    
    // Set up periodic performance alerts
    setInterval(() => {
      const alerts = this.performanceTracker.checkPerformanceAlerts();
      alerts.forEach(alert => {
        this.notificationService.addNotification({
          id: `performance-alert-${Date.now()}`,
          type: 'warning',
          title: 'Performance Alert',
          message: alert.message,
          timestamp: new Date(),
          read: false,
          priority: 'high',
          category: 'performance',
          actionRequired: true
        });
      });
    }, 300000); // Check every 5 minutes
  }

  private initializeNotifications(): void {
    // Initialize notification channels
    this.notificationService.initialize();
    
    // Set up cross-tab notification sync
    this.eventBus.subscribe('data_sync', (event) => {
      if (event.payload.key === 'notifications') {
        this.notificationService.syncNotifications(event.payload.newValue);
      }
    });
  }

  public getServiceStatus(): Record<string, boolean> {
    return {
      eventBus: !!this.eventBus,
      performanceTracker: !!this.performanceTracker,
      emailService: !!this.emailService,
      notificationService: !!this.notificationService,
      initialized: this.isInitialized
    };
  }

  public shutdown(): void {
    console.log('[Real-time Event Service] Shutting down...');
    this.performanceTracker.stopMonitoring();
    this.isInitialized = false;
  }
}

// Export singleton instance
export const realTimeEventService = RealTimeEventService.getInstance();
