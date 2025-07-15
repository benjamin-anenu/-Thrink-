import { EventBus, EventType } from './EventBus';
import { PerformanceProfile } from '@/types/performance';

export class RealTimeEventService {
  private static instance: RealTimeEventService;
  private eventBus: EventBus;
  private isConnected: boolean = false;
  private connectionStatus: string = 'disconnected';
  private queuedEvents: any[] = [];
  private maxQueueSize: number = 100;
  private retryInterval: number = 5000; // Retry every 5 seconds
  private retryTimeoutId: NodeJS.Timeout | null = null;

  public static getInstance(): RealTimeEventService {
    if (!RealTimeEventService.instance) {
      RealTimeEventService.instance = new RealTimeEventService();
    }
    return RealTimeEventService.instance;
  }

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.connect();
  }

  public connect() {
    // Simulate connection logic
    this.isConnected = true;
    this.connectionStatus = 'connected';
    console.log('[Real-time Service] Connected to real-time event stream');

    // Process any queued events
    this.processEventQueue();

    // Simulate system heartbeat every 30 seconds
    setInterval(() => {
      this.eventBus.emit('system_heartbeat' as EventType, {
        status: 'active',
        timestamp: new Date()
      }, 'realtime_service');
    }, 30000);
  }

  public disconnect() {
    this.isConnected = false;
    this.connectionStatus = 'disconnected';
    console.log('[Real-time Service] Disconnected from real-time event stream');
  }

  public isRealTimeConnected(): boolean {
    return this.isConnected;
  }

  public getConnectionStatus(): string {
    return this.connectionStatus;
  }

  public getQueuedEventCount(): number {
    return this.queuedEvents.length;
  }

  private queueEvent(eventType: EventType, payload: any, source: string) {
    if (this.queuedEvents.length >= this.maxQueueSize) {
      this.queuedEvents.shift(); // Remove the oldest event
    }

    this.queuedEvents.push({
      eventType,
      payload,
      source
    });

    console.log(`[Real-time Service] Event ${eventType} queued (Size: ${this.queuedEvents.length})`);

    // Attempt to process the queue immediately
    this.processEventQueue();
  }

  private processEventQueue() {
    if (!this.isConnected) {
      console.log('[Real-time Service] Not connected. Event queue processing paused.');
      
      // Ensure retry mechanism is active
      if (!this.retryTimeoutId) {
        this.retryConnection();
      }
      return;
    }

    while (this.queuedEvents.length > 0) {
      const event = this.queuedEvents.shift();
      if (event) {
        this.emitEvent(event.eventType, event.payload, event.source);
      }
    }

    console.log('[Real-time Service] Event queue processed.');
  }

  private retryConnection() {
    if (this.retryTimeoutId) return;

    this.retryTimeoutId = setTimeout(() => {
      console.log('[Real-time Service] Attempting to reconnect...');
      this.connect(); // Attempt to reconnect
      this.retryTimeoutId = null; // Clear timeout ID

      if (!this.isConnected) {
        this.retryConnection(); // If still not connected, retry again
      }
    }, this.retryInterval);
  }

  private emitEvent(eventType: EventType, payload: any, source: string) {
    if (!this.isConnected) {
      console.warn(`[Real-time Service] Dropped event ${eventType} (not connected)`);
      return;
    }

    try {
      this.eventBus.emit(eventType, payload, source);
      console.log(`[Real-time Service] Emitted ${eventType} from ${source}:`, payload);
    } catch (error) {
      console.error(`[Real-time Service] Error emitting ${eventType}:`, error);
      this.queueEvent(eventType, payload, source); // Re-queue on failure
    }
  }

  // Example event emitters
  public emitTaskCompleted(taskId: string, taskName: string, projectId: string, projectName: string, resourceId: string, resourceName: string) {
    const payload = {
      taskId,
      taskName,
      projectId,
      projectName,
      resourceId,
      resourceName,
      timestamp: new Date()
    };
    this.queueEvent('task_completed', payload, 'task_service');
  }

  public emitResourceAssigned(resourceId: string, resourceName: string, projectId: string, projectName: string, taskName: string) {
    const payload = {
      resourceId,
      resourceName,
      projectId,
      projectName,
      taskName,
      timestamp: new Date()
    };
    this.queueEvent('resource_assigned', payload, 'resource_service');
  }

  public emitProjectUpdated(projectId: string, projectName: string, updateType: string, details: any) {
    const payload = {
      projectId,
      projectName,
      updateType,
      details,
      timestamp: new Date()
    };
    this.queueEvent('project_updated', payload, 'project_service');
  }

  public emitDeadlineApproaching(taskId: string, taskName: string, projectId: string, projectName: string, daysRemaining: number) {
    const payload = {
      taskId,
      taskName,
      projectId,
      projectName,
      daysRemaining,
      timestamp: new Date()
    };
    this.queueEvent('deadline_approaching', payload, 'deadline_service');
  }

  public getPerformanceProfile(resourceId: string): PerformanceProfile {
    // Mock performance profile data
    const mockData = this.generateMockPerformanceData();
    return mockData as PerformanceProfile;
  }

  private generateMockPerformanceData(): any {
    return {
      resourceId: '1',
      resourceName: 'John Doe',
      currentScore: Math.floor(Math.random() * 40) + 60, // 60-100
      monthlyScore: Math.floor(Math.random() * 30) + 70, // 70-100
      trend: ['improving', 'stable', 'declining'][Math.floor(Math.random() * 3)],
      riskLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
      lastUpdated: new Date()
    };
  }
}

// Initialize the real-time event service
export const initializeRealTimeEvents = () => {
  const service = RealTimeEventService.getInstance();
  console.log('[Real-time Event Service] Service initialized');
  return service;
};
