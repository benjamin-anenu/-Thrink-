import { EventBus } from './EventBus';
import { PerformanceTracker } from './PerformanceTracker';
import { EmailReminderService } from './EmailReminderService';
import { NotificationIntegrationService } from './NotificationIntegrationService';
import { aiInsightsService } from './AIInsightsService';
import { escalationMonitoringService } from './EscalationMonitoringService';

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

    console.log('[Real-time Event Service] Initializing with AI and escalation integration...');
    
    this.setupEventListeners();
    this.setupAIEventListeners();
    this.setupEscalationEventListeners();
    this.startPerformanceMonitoring();
    this.initializeNotifications();
    
    this.isInitialized = true;
    console.log('[Real-time Event Service] Initialized successfully with full integration');
  }

  // Helper method to validate event payloads
  private validatePayload(payload: any, requiredFields: string[]): boolean {
    if (!payload || typeof payload !== 'object') {
      console.warn('[Real-time Events] Invalid payload: not an object');
      return false;
    }

    for (const field of requiredFields) {
      if (!(field in payload) || payload[field] === undefined || payload[field] === null) {
        console.warn(`[Real-time Events] Missing required field: ${field}`);
        return false;
      }
    }

    return true;
  }

  // Helper method to safely get nested properties
  private safeGet(obj: any, path: string, defaultValue: any = null): any {
    try {
      return path.split('.').reduce((current, key) => current && current[key], obj) || defaultValue;
    } catch {
      return defaultValue;
    }
  }

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

  public isRealTimeConnected(): boolean {
    return this.isInitialized;
  }

  public getConnectionStatus(): string {
    return this.isInitialized ? 'connected' : 'disconnected';
  }

  public getQueuedEventCount(): number {
    return 0; // For now, return 0 as we process events immediately
  }

  private setupAIEventListeners(): void {
    // Listen for AI insights updates
    this.eventBus.subscribe('ai_insights_updated', (event) => {
      console.log('[Real-time Events] AI insights updated:', event.payload);
      this.handleAIInsightsUpdate(event.payload);
    });

    // Listen for performance updates that should trigger AI analysis
    this.eventBus.subscribe('performance_updated', (event) => {
      console.log('[Real-time Events] Performance updated, triggering AI analysis:', event.payload);
      this.handlePerformanceBasedAIUpdate(event.payload);
    });

    // Listen for risk events
    this.eventBus.subscribe('risk_event', (event) => {
      console.log('[Real-time Events] Risk event detected:', event.payload);
      this.handleRiskEvent(event.payload);
    });
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

  private setupEscalationEventListeners(): void {
    // Listen for escalation trigger events
    this.eventBus.subscribe('escalation_triggered', (event) => {
      console.log('[Real-time Events] Escalation triggered:', event.payload);
      this.handleEscalationTriggered(event.payload);
    });

    // Listen for escalation notifications
    this.eventBus.subscribe('escalation_notification', (event) => {
      console.log('[Real-time Events] Escalation notification:', event.payload);
      this.handleEscalationNotification(event.payload);
    });

    // Listen for project changes that might affect escalations
    this.eventBus.subscribe('project_updated', (event) => {
      console.log('[Real-time Events] Project updated, checking escalation conditions:', event.payload);
      this.checkEscalationConditions(event.payload);
    });

    // Listen for task changes that might affect escalations
    this.eventBus.subscribe('task_updated', (event) => {
      console.log('[Real-time Events] Task updated, checking escalation conditions:', event.payload);
      this.checkEscalationConditions(event.payload);
    });
  }

  private handleTaskCompletion(payload: any): void {
    if (!this.validatePayload(payload, ['taskId', 'projectId', 'resourceId'])) {
      console.error('[Real-time Events] Invalid task completion payload:', payload);
      return;
    }

    const { taskId, projectId, resourceId, completionTime } = payload;
    const taskName = this.safeGet(payload, 'taskName', 'Unknown Task');
    
    // Track performance metrics
    this.performanceTracker.trackPositiveActivity(resourceId, 'task_completion', 8, `Completed task: ${taskName}`, projectId, taskId);
    
    // Send completion notifications
    this.notificationService.addNotification({
      title: 'Task Completed',
      message: `Task "${taskName}" has been successfully completed`,
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

    // Trigger AI insights update for project progress analysis
    setTimeout(() => {
      this.eventBus.emit('ai_insights_requested', {
        projectId,
        trigger: 'task_completion',
        context: { taskId, resourceId }
      }, 'real_time_service');
    }, 1000);
  }

  private handleTaskCreation(payload: any): void {
    if (!this.validatePayload(payload, ['task', 'projectId'])) {
      console.error('[Real-time Events] Invalid task creation payload:', payload);
      return;
    }

    const { task, projectId, assignedTo } = payload;
    const projectName = this.safeGet(payload, 'projectName', 'Unknown Project');
    
    // Set up deadline reminders
    if (task && task.endDate) {
      this.emailService.scheduleTaskReminders(task, { id: assignedTo }, { id: projectId, name: projectName });
    }

    // Send creation notification
    this.notificationService.addNotification({
      title: 'New Task Created',
      message: `New task "${this.safeGet(task, 'name', 'Unknown Task')}" has been created`,
      type: 'info',
      category: 'project',
      priority: 'low',
      projectId
    });

    // Trigger AI workload analysis
    this.eventBus.emit('ai_insights_requested', {
      projectId,
      trigger: 'task_creation',
      context: { taskId: this.safeGet(task, 'id'), assignedTo }
    }, 'real_time_service');
  }

  private handleProjectUpdate(payload: any): void {
    if (!this.validatePayload(payload, ['projectId'])) {
      console.error('[Real-time Events] Invalid project update payload:', payload);
      return;
    }

    const { projectId, updates = {}, projectName } = payload;
    
    // Send update notification
    this.notificationService.addNotification({
      title: 'Project Updated',
      message: `Project "${projectName || 'Unknown Project'}" has been updated`,
      type: 'info',
      category: 'project',
      priority: 'medium',
      projectId
    });

    // Trigger comprehensive AI re-analysis for significant updates
    const hasSignificantUpdate = updates.status || updates.endDate || updates.resources;
    if (hasSignificantUpdate) {
      this.eventBus.emit('ai_insights_requested', {
        projectId,
        trigger: 'project_update',
        context: { updates }
      }, 'real_time_service');
    }
  }

  private handleResourceAssignment(payload: any): void {
    if (!this.validatePayload(payload, ['resourceId', 'projectId'])) {
      console.error('[Real-time Events] Invalid resource assignment payload:', payload);
      return;
    }

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

    // Trigger AI resource optimization analysis
    this.eventBus.emit('ai_insights_requested', {
      projectId,
      trigger: 'resource_assignment',
      context: { resourceId, taskId }
    }, 'real_time_service');
  }

  private handleDeadlineApproaching(payload: any): void {
    if (!this.validatePayload(payload, ['taskId', 'taskName', 'projectId', 'daysRemaining'])) {
      console.error('[Real-time Events] Invalid deadline approaching payload:', payload);
      return;
    }

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

    // Trigger AI risk assessment update
    this.eventBus.emit('ai_insights_requested', {
      projectId,
      trigger: 'deadline_approaching',
      context: { taskId, daysRemaining }
    }, 'real_time_service');
  }

  private handleContextUpdate(payload: any): void {
    const { type, data } = payload || {};
    
    // Log context changes for debugging
    console.log(`[Real-time Events] Context updated - ${type || 'unknown'}:`, data);
  }

  private handleAIInsightsUpdate(payload: any): void {
    if (!payload) {
      console.warn('[Real-time Events] AI insights update with empty payload');
      return;
    }

    const { projectId, insights, recommendations, riskProfile } = payload;
    
    // Send notifications for high-priority AI insights
    if (insights && Array.isArray(insights)) {
      insights.filter((insight: any) => insight && insight.impact === 'high').forEach((insight: any) => {
        this.notificationService.addNotification({
          title: `AI Insight: ${insight.title || 'Important Update'}`,
          message: insight.description || 'AI has detected an important project insight',
          type: insight.type === 'risk' ? 'warning' : 'info',
          category: 'system',
          priority: 'high',
          projectId,
          actionRequired: insight.type === 'risk'
        });
      });
    }

    // Handle critical risk profile updates
    if (riskProfile && riskProfile.riskLevel === 'critical') {
      this.notificationService.addNotification({
        title: 'Critical Risk Alert',
        message: `Project risk level has escalated to critical. Immediate attention required.`,
        type: 'error',
        category: 'system',
        priority: 'critical',
        projectId,
        actionRequired: true
      });
    }
  }

  private handlePerformanceBasedAIUpdate(payload: any): void {
    const { projectId, trigger } = payload || {};
    
    if (!projectId) {
      console.warn('[Real-time Events] Performance-based AI update without projectId');
      return;
    }
    
    // Schedule AI analysis based on performance changes
    setTimeout(() => {
      console.log(`[Real-time Events] Triggering AI analysis for project ${projectId} due to ${trigger || 'performance update'}`);
      // This would trigger the AI service to re-analyze the project
    }, 2000);
  }

  private handleRiskEvent(payload: any): void {
    const { projectId, riskType } = payload || {};
    
    if (!projectId || !riskType) {
      console.warn('[Real-time Events] Risk event with incomplete data:', payload);
      return;
    }
    
    // Send immediate risk notification
    this.notificationService.addNotification({
      title: 'Risk Event Detected',
      message: `${riskType} risk detected in project`,
      type: 'warning',
      category: 'system',
      priority: 'high',
      projectId,
      actionRequired: true
    });
  }

  private handleEscalationTriggered(payload: any): void {
    if (!this.validatePayload(payload, ['projectId', 'triggerId', 'conditionType'])) {
      console.error('[Real-time Events] Invalid escalation trigger payload:', payload);
      return;
    }

    const { projectId, triggerId, conditionType, workspaceId } = payload;
    
    // Send high-priority notification
    this.notificationService.addNotification({
      title: 'Escalation Triggered',
      message: `${conditionType} condition met for project`,
      type: 'error',
      category: 'escalation',
      priority: 'critical',
      projectId,
      actionRequired: true
    });

    // Trigger AI analysis for escalation impact
    this.eventBus.emit('ai_insights_requested', {
      projectId,
      trigger: 'escalation_triggered',
      context: { triggerId, conditionType }
    }, 'real_time_service');
  }

  private handleEscalationNotification(payload: any): void {
    if (!this.validatePayload(payload, ['projectId', 'stakeholderEmail'])) {
      console.error('[Real-time Events] Invalid escalation notification payload:', payload);
      return;
    }

    const { projectId, stakeholderEmail, triggerName, levelName } = payload;
    
    // Log notification for audit trail
    this.notificationService.addNotification({
      title: 'Escalation Notification Sent',
      message: `${triggerName} escalation sent to ${stakeholderEmail} (${levelName})`,
      type: 'info',
      category: 'escalation',
      priority: 'medium',
      projectId
    });
  }

  private checkEscalationConditions(payload: any): void {
    const { projectId, workspaceId } = payload;
    
    if (!projectId || !workspaceId) {
      console.warn('[Real-time Events] Missing project or workspace ID for escalation check');
      return;
    }

    // Trigger escalation monitoring check
    setTimeout(() => {
      console.log(`[Real-time Events] Triggering escalation check for project ${projectId}`);
      // This would trigger the escalation monitoring service to check conditions
    }, 1000);
  }

  private startPerformanceMonitoring(): void {
    // Set up periodic performance alerts with AI integration
    setInterval(() => {
      try {
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

            // Trigger AI analysis for projects involving this resource
            const recentMetrics = profile.metrics.filter(m => 
              m.projectId && Date.now() - m.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000
            );
            
            const affectedProjects = [...new Set(recentMetrics.map(m => m.projectId).filter(Boolean))];
            affectedProjects.forEach(projectId => {
              this.eventBus.emit('ai_insights_requested', {
                projectId,
                trigger: 'performance_alert',
                context: { resourceId: profile.resourceId, riskLevel: profile.riskLevel }
              }, 'real_time_service');
            });
          }
        });
      } catch (error) {
        console.error('[Real-time Events] Error in performance monitoring:', error);
      }
    }, 300000); // Check every 5 minutes
  }

  private initializeNotifications(): void {
    // Set up cross-tab notification sync
    this.eventBus.subscribe('data_sync', (event) => {
      if (event.payload && event.payload.key === 'notifications') {
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
      aiInsightsService: !!aiInsightsService,
      escalationMonitoringService: !!escalationMonitoringService,
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
  console.log('[Real-time Event Service] Initialized with full integration');
  return service;
};
