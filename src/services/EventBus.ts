export type EventType = 
  | 'task_completed'
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'project_updated'
  | 'project_created'
  | 'resource_assigned'
  | 'resource_updated'
  | 'resource_unassigned'
  | 'resource_availability_changed'
  | 'stakeholder_updated'
  | 'stakeholder_created'
  | 'deadline_approaching'
  | 'milestone_reached'
  | 'context_updated'
  | 'data_sync'
  | 'performance_alert'
  | 'performance_updated'
  | 'system_heartbeat'
  | 'email_reminder_sent'
  | 'rebaseline_requested'
  | 'ai_insights_updated'
  | 'ai_insights_requested'
  | 'risk_event'
  | 'system_error'
  | 'escalation_triggered'
  | 'escalation_notification';

export interface Event {
  id: string;
  type: EventType;
  payload: any;
  timestamp: Date;
  source: string;
}

export interface EventListener {
  id: string;
  type: EventType;
  callback: (event: Event) => void;
  source?: string;
}

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<EventType, EventListener[]> = new Map();
  private eventHistory: Event[] = [];
  private maxHistorySize = 1000;
  private recentEvents: Map<string, number> = new Map(); // For deduplication
  private deduplicationWindow = 1000; // 1 second
  private circuitBreakers: Map<string, { failures: number; lastFailure: number; isOpen: boolean }> = new Map();
  private maxFailures = 5;
  private circuitBreakerTimeout = 30000; // 30 seconds

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  private constructor() {
    // Initialize event bus
    console.log('[Event Bus] Initialized with enhanced error handling');
    
    // Clean up old events periodically
    setInterval(() => {
      this.cleanupOldEvents();
    }, 60000); // Every minute
  }

  private cleanupOldEvents(): void {
    const now = Date.now();
    
    // Clean up recent events older than deduplication window
    for (const [key, timestamp] of this.recentEvents.entries()) {
      if (now - timestamp > this.deduplicationWindow) {
        this.recentEvents.delete(key);
      }
    }

    // Reset circuit breakers that have timed out
    for (const [listenerId, breaker] of this.circuitBreakers.entries()) {
      if (breaker.isOpen && now - breaker.lastFailure > this.circuitBreakerTimeout) {
        breaker.isOpen = false;
        breaker.failures = 0;
        console.log(`[Event Bus] Circuit breaker reset for listener ${listenerId}`);
      }
    }
  }

  private generateEventKey(type: EventType, payload: any): string {
    // Create a simple hash for deduplication
    const payloadStr = JSON.stringify(payload);
    return `${type}-${payloadStr}`;
  }

  private isEventDuplicate(type: EventType, payload: any): boolean {
    const eventKey = this.generateEventKey(type, payload);
    const now = Date.now();
    const lastEventTime = this.recentEvents.get(eventKey);
    
    if (lastEventTime && now - lastEventTime < this.deduplicationWindow) {
      return true;
    }
    
    this.recentEvents.set(eventKey, now);
    return false;
  }

  private shouldCircuitBreakerBlock(listenerId: string): boolean {
    const breaker = this.circuitBreakers.get(listenerId);
    return breaker ? breaker.isOpen : false;
  }

  private recordListenerFailure(listenerId: string): void {
    const now = Date.now();
    let breaker = this.circuitBreakers.get(listenerId);
    
    if (!breaker) {
      breaker = { failures: 0, lastFailure: 0, isOpen: false };
      this.circuitBreakers.set(listenerId, breaker);
    }
    
    breaker.failures++;
    breaker.lastFailure = now;
    
    if (breaker.failures >= this.maxFailures) {
      breaker.isOpen = true;
      console.warn(`[Event Bus] Circuit breaker opened for listener ${listenerId} after ${breaker.failures} failures`);
    }
  }

  private recordListenerSuccess(listenerId: string): void {
    const breaker = this.circuitBreakers.get(listenerId);
    if (breaker && breaker.failures > 0) {
      breaker.failures = Math.max(0, breaker.failures - 1);
    }
  }

  public subscribe(type: EventType, callback: (event: Event) => void, source?: string): () => void {
    const listener: EventListener = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      callback,
      source
    };

    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }

    this.listeners.get(type)!.push(listener);

    console.log(`[Event Bus] Subscribed to ${type} (${this.listeners.get(type)!.length} listeners)`);

    // Return unsubscribe function
    return () => {
      const typeListeners = this.listeners.get(type);
      if (typeListeners) {
        const index = typeListeners.findIndex(l => l.id === listener.id);
        if (index > -1) {
          typeListeners.splice(index, 1);
          // Clean up circuit breaker
          this.circuitBreakers.delete(listener.id);
          console.log(`[Event Bus] Unsubscribed from ${type}`);
        }
      }
    };
  }

  public emit(type: EventType, payload: any, source: string = 'unknown'): void {
    // Validate payload
    if (payload === undefined) {
      console.warn(`[Event Bus] Emitting ${type} with undefined payload`);
      payload = {};
    }

    // Check for duplicate events
    if (this.isEventDuplicate(type, payload)) {
      console.debug(`[Event Bus] Skipping duplicate ${type} event`);
      return;
    }

    const event: Event = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: new Date(),
      source
    };

    // Add to history
    this.eventHistory.unshift(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(0, this.maxHistorySize);
    }

    // Notify listeners with error handling and circuit breakers
    const typeListeners = this.listeners.get(type);
    let successCount = 0;
    let failureCount = 0;

    if (typeListeners) {
      typeListeners.forEach(listener => {
        // Check circuit breaker
        if (this.shouldCircuitBreakerBlock(listener.id)) {
          console.debug(`[Event Bus] Circuit breaker blocking listener ${listener.id} for ${type}`);
          return;
        }

        try {
          listener.callback(event);
          this.recordListenerSuccess(listener.id);
          successCount++;
        } catch (error) {
          this.recordListenerFailure(listener.id);
          failureCount++;
          console.error(`[Event Bus] Error in listener ${listener.id} for ${type}:`, error);
          
          // Emit a system error event for monitoring (avoid infinite loops)
          if (type !== 'system_error') {
            setTimeout(() => {
              this.emit('system_error', {
                originalEvent: type,
                listenerId: listener.id,
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date()
              }, 'event_bus_error_handler');
            }, 0);
          }
        }
      });
    }

    const totalListeners = typeListeners?.length || 0;
    console.log(`[Event Bus] Emitted ${type} event (${successCount}/${totalListeners} listeners succeeded, ${failureCount} failed)`);
  }

  public getEventHistory(type?: EventType, limit?: number): Event[] {
    let events = type 
      ? this.eventHistory.filter(e => e.type === type)
      : this.eventHistory;

    return limit ? events.slice(0, limit) : events;
  }

  public getListenerStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.listeners.forEach((listeners, type) => {
      stats[type] = listeners.length;
    });
    return stats;
  }

  public getCircuitBreakerStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    this.circuitBreakers.forEach((breaker, listenerId) => {
      stats[listenerId] = {
        failures: breaker.failures,
        isOpen: breaker.isOpen,
        lastFailure: breaker.lastFailure
      };
    });
    return stats;
  }

  public clearHistory(): void {
    this.eventHistory = [];
    console.log('[Event Bus] Event history cleared');
  }

  public resetCircuitBreakers(): void {
    this.circuitBreakers.clear();
    console.log('[Event Bus] All circuit breakers reset');
  }
}

export const eventBus = EventBus.getInstance();
