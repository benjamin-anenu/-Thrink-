
import { EventBus, EventType, EventData } from './EventBus';
import { NotificationIntegrationService } from './NotificationIntegrationService';
import { PerformanceTracker } from './PerformanceTracker';

export interface RealTimeEvent extends EventData {
  userId?: string;
  sessionId?: string;
  broadcast?: boolean;
}

export class RealTimeEventService {
  private static instance: RealTimeEventService;
  private eventBus: EventBus;
  private notificationService: NotificationIntegrationService;
  private performanceTracker: PerformanceTracker;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private eventQueue: RealTimeEvent[] = [];

  public static getInstance(): RealTimeEventService {
    if (!RealTimeEventService.instance) {
      RealTimeEventService.instance = new RealTimeEventService();
    }
    return RealTimeEventService.instance;
  }

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.notificationService = NotificationIntegrationService.getInstance();
    this.performanceTracker = PerformanceTracker.getInstance();
    this.initialize();
  }

  private initialize() {
    // Simulate WebSocket connection
    this.simulateConnection();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Start real-time data sync
    this.startRealTimeSync();
    
    console.log('[Real-time Event Service] Initialized');
  }

  private simulateConnection() {
    // Simulate WebSocket connection with periodic reconnection
    this.isConnected = true;
    console.log('[Real-time Event Service] Connected to event stream');
    
    // Simulate occasional disconnections for testing
    setInterval(() => {
      if (Math.random() < 0.05) { // 5% chance of disconnection
        this.handleDisconnection();
      }
    }, 30000);
  }

  private handleDisconnection() {
    this.isConnected = false;
    console.warn('[Real-time Event Service] Connection lost, attempting to reconnect...');
    
    setTimeout(() => {
      this.reconnect();
    }, 1000 * Math.pow(2, this.reconnectAttempts));
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.isConnected = true;
      console.log('[Real-time Event Service] Reconnected successfully');
      
      // Process queued events
      this.processEventQueue();
    }
  }

  private processEventQueue() {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        this.broadcastEvent(event);
      }
    }
  }

  private setupEventListeners() {
    // Listen to all event types and handle real-time broadcasting
    const eventTypes: EventType[] = [
      'task_completed',
      'task_created',
      'task_updated',
      'task_assigned',
      'deadline_approaching',
      'milestone_reached',
      'resource_assigned',
      'resource_availability_changed',
      'project_updated',
      'performance_alert'
    ];

    eventTypes.forEach(eventType => {
      this.eventBus.subscribe(eventType, (eventData) => {
        this.handleRealTimeEvent({
          ...eventData,
          broadcast: true,
          sessionId: this.generateSessionId()
        });
      });
    });
  }

  private startRealTimeSync() {
    // Sync data every 5 seconds
    setInterval(() => {
      this.syncRealTimeData();
    }, 5000);

    // Emit periodic heartbeat
    setInterval(() => {
      this.emitHeartbeat();
    }, 30000);
  }

  private syncRealTimeData() {
    if (!this.isConnected) return;

    // Sync performance data
    const profiles = this.performanceTracker.getAllProfiles();
    profiles.forEach(profile => {
      if (profile.lastUpdated && new Date().getTime() - profile.lastUpdated.getTime() < 10000) {
        this.broadcastEvent({
          type: 'performance_alert',
          payload: {
            resourceId: profile.resourceId,
            resourceName: profile.resourceName,
            riskLevel: profile.riskLevel,
            score: profile.score
          },
          timestamp: new Date(),
          source: 'performance_tracker',
          broadcast: true
        });
      }
    });

    // Sync resource utilization
    this.broadcastResourceUpdate();
  }

  private broadcastResourceUpdate() {
    const savedResources = localStorage.getItem('resources');
    if (savedResources) {
      try {
        const resources = JSON.parse(savedResources);
        this.broadcastEvent({
          type: 'resource_availability_changed',
          payload: {
            resources: resources.map((r: any) => ({
              id: r.id,
              name: r.name,
              status: r.status,
              utilization: r.utilization
            }))
          },
          timestamp: new Date(),
          source: 'resource_context',
          broadcast: true
        });
      } catch (error) {
        console.error('[Real-time Event Service] Error parsing resources:', error);
      }
    }
  }

  private emitHeartbeat() {
    if (this.isConnected) {
      this.eventBus.emit('system_heartbeat', {
        timestamp: new Date(),
        connectionStatus: 'connected',
        queuedEvents: this.eventQueue.length
      }, 'realtime_service');
    }
  }

  private handleRealTimeEvent(event: RealTimeEvent) {
    if (!this.isConnected) {
      this.eventQueue.push(event);
      return;
    }

    this.broadcastEvent(event);
    
    // Handle specific event types
    switch (event.type) {
      case 'task_completed':
        this.handleTaskCompletion(event);
        break;
      case 'resource_assigned':
        this.handleResourceAssignment(event);
        break;
      case 'deadline_approaching':
        this.handleDeadlineAlert(event);
        break;
      case 'performance_alert':
        this.handlePerformanceAlert(event);
        break;
    }
  }

  private handleTaskCompletion(event: RealTimeEvent) {
    if (event.payload.resourceId && event.payload.taskName) {
      this.notificationService.onTaskCompleted(
        event.payload.taskId || 'unknown',
        event.payload.taskName,
        event.payload.projectId || 'unknown',
        event.payload.projectName || 'Unknown Project',
        event.payload.resourceId,
        event.payload.resourceName || 'Unknown Resource'
      );
    }
  }

  private handleResourceAssignment(event: RealTimeEvent) {
    if (event.payload.resourceId && event.payload.resourceName) {
      this.notificationService.onResourceAssigned(
        event.payload.resourceId,
        event.payload.resourceName,
        event.payload.projectId || 'unknown',
        event.payload.projectName || 'Unknown Project',
        event.payload.taskName || 'Unknown Task'
      );
    }
  }

  private handleDeadlineAlert(event: RealTimeEvent) {
    if (event.payload.taskId && event.payload.daysRemaining !== undefined) {
      this.notificationService.onDeadlineApproaching(
        event.payload.taskId,
        event.payload.taskName || 'Unknown Task',
        event.payload.projectId || 'unknown',
        event.payload.projectName || 'Unknown Project',
        event.payload.daysRemaining
      );
    }
  }

  private handlePerformanceAlert(event: RealTimeEvent) {
    console.log(`[Real-time Event Service] Performance alert: ${event.payload.resourceName} - ${event.payload.riskLevel} risk`);
  }

  private broadcastEvent(event: RealTimeEvent) {
    // Simulate broadcasting to other connected clients
    console.log(`[Real-time Event Service] Broadcasting ${event.type}:`, event.payload);
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for components to emit events
  public emitTaskCompleted(taskId: string, taskName: string, projectId: string, projectName: string, resourceId: string, resourceName: string) {
    this.eventBus.emit('task_completed', {
      taskId,
      taskName,
      projectId,
      projectName,
      resourceId,
      resourceName
    }, 'user_action');
  }

  public emitResourceAssigned(resourceId: string, resourceName: string, projectId: string, projectName: string, taskName: string) {
    this.eventBus.emit('resource_assigned', {
      resourceId,
      resourceName,
      projectId,
      projectName,
      taskName
    }, 'user_action');
  }

  public emitProjectUpdated(projectId: string, projectName: string, updateType: string, details: any) {
    this.eventBus.emit('project_updated', {
      projectId,
      projectName,
      updateType,
      details
    }, 'user_action');
  }

  public emitDeadlineApproaching(taskId: string, taskName: string, projectId: string, projectName: string, daysRemaining: number) {
    this.eventBus.emit('deadline_approaching', {
      taskId,
      taskName,
      projectId,
      projectName,
      daysRemaining
    }, 'system_check');
  }

  public isRealTimeConnected(): boolean {
    return this.isConnected;
  }

  public getConnectionStatus(): string {
    return this.isConnected ? 'connected' : 'disconnected';
  }

  public getQueuedEventCount(): number {
    return this.eventQueue.length;
  }
}

// Initialize the real-time service
export const initializeRealTimeEvents = () => {
  const service = RealTimeEventService.getInstance();
  console.log('[Real-time Event Service] Service initialized');
  return service;
};
