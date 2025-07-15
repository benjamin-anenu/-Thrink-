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

  // Add missing emit methods
  public emitTaskCompleted(taskId: string, taskName: string, projectId: string, projectName: string, resourceId: string, resourceName: string): void {
    this.eventBus.emit('task_completed', {
      taskId,
      taskName,
      projectId,
      projectName,
      resourceId,
      resourceName,
      completionTime: new Date()
    }, 'real_time_service');
  }

  public emitResourceAssigned(resourceId: string, resourceName: string, projectId: string, projectName: string, taskName: string): void {
    this.eventBus.emit('resource_assigned', {
      resourceId,
      resourceName,
      projectId,
      projectName,
      taskName,
      assignmentDate: new Date()
    }, 'real_time_service');
  }

  public emitProjectUpdated(projectId: string, projectName: string, updateType: string, details: any): void {
    this.eventBus.emit('project_updated', {
      projectId,
      projectName,
      updateType,
      details,
      timestamp: new Date()
    }, 'real_time_service');
  }

  public emitDeadlineApproaching(taskId: string, taskName: string, projectId: string, projectName: string, daysRemaining: number): void {
    this.eventBus.emit('deadline_approaching', {
      taskId,
      taskName,
      projectId,
      projectName,
      daysRemaining,
      dueDate: new Date()
    }, 'real_time_service');
  }

  // Add missing status methods
  public isRealTimeConnected(): boolean {
    return this.isInitialized;
  }

  public getConnectionStatus(): string {
    return this.isInitialized ? 'connected' : 'disconnected';
  }

  public getQueuedEventCount(): number {
    return 0; // For now, return 0 as we process events immediately
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
    const { taskId, projectId, resourceId, completionTime } = payload;
    
    // Track performance metrics
    this.performanceTracker.trackPositiveActivity(resourceId, 'task_completion', 8, `Completed task: ${payload.taskName}`, projectId, taskId);
    
    // Send completion notifications
    this.notificationService.addNotification({
      title: 'Task Completed',
      message: `Task has been successfully completed`,
      type: 'success',
      category: 'project',
      priority: 'medium',
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
      this.emailService.scheduleTaskReminders(task, { id: assignedTo }, { id: projectId, name: payload.projectName });
    }

    // Send creation notification
    this.notificationService.addNotification({
      title: 'New Task Created',
      message: `New task "${task.name}" has been created`,
      type: 'info',
      category: 'project',
      priority: 'low',
      projectId
    });
  }

  private handleProjectUpdate(payload: any): void {
    const { projectId, updates } = payload;
    
    // Send update notification
    this.notificationService.addNotification({
      title: 'Project Updated',
      message: `Project has been updated`,
      type: 'info',
      category: 'project',
      priority: 'medium',
      projectId
    });
  }

  private handleResourceAssignment(payload: any): void {
    const { resourceId, projectId, taskId, assignmentDate } = payload;
    
    // Send assignment notification
    this.notificationService.addNotification({
      title: 'Resource Assigned',
      message: `Resource has been assigned to project`,
      type: 'info',
      category: 'team',
      priority: 'medium',
      projectId
    });
  }

  private handleDeadlineApproaching(payload: any): void {
    const { taskId, taskName, projectId, daysRemaining } = payload;
    
    // Send urgent notification
    this.notificationService.addNotification({
      title: 'Deadline Approaching',
      message: `Task "${taskName}" is due in ${daysRemaining} day(s)`,
      type: 'warning',
      category: 'deadline',
      priority: 'high',
      projectId,
      actionRequired: true
    });
  }

  private handleContextUpdate(payload: any): void {
    const { type, data } = payload;
    
    // Log context changes for debugging
    console.log(`[Real-time Events] Context updated - ${type}:`, data);
  }

  private startPerformanceMonitoring(): void {
    // Set up periodic performance alerts
    setInterval(() => {
      const profiles = this.performanceTracker.getAllProfiles();
      profiles.forEach(profile => {
        if (profile.riskLevel === 'critical' || profile.riskLevel === 'high') {
          this.notificationService.addNotification({
            title: 'Performance Alert',
            message: `${profile.resourceName} performance requires attention`,
            type: 'warning',
            category: 'performance',
            priority: 'high',
            actionRequired: true
          });
        }
      });
    }, 300000); // Check every 5 minutes
  }

  private initializeNotifications(): void {
    // Set up cross-tab notification sync
    this.eventBus.subscribe('data_sync', (event) => {
      if (event.payload.key === 'notifications') {
        // Handle notification sync
        console.log('[Real-time Events] Syncing notifications');
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
    this.isInitialized = false;
  }
}

// Export singleton instance and initialization function
export const realTimeEventService = RealTimeEventService.getInstance();

export const initializeRealTimeEvents = () => {
  const service = RealTimeEventService.getInstance();
  service.initialize();
  console.log('[Real-time Event Service] Initialized');
  return service;
};
