
export type EventType = 
  | 'task_completed'
  | 'task_created'
  | 'task_updated'
  | 'task_assigned'
  | 'deadline_approaching'
  | 'milestone_reached'
  | 'resource_assigned'
  | 'resource_availability_changed'
  | 'project_updated'
  | 'performance_alert'
  | 'system_heartbeat'
  | 'data_sync'
  | 'context_updated'
  | 'storage_changed';

export interface EventData {
  type: EventType;
  payload: any;
  timestamp: Date;
  source: string;
  propagate?: boolean;
}

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<EventType, ((data: EventData) => void)[]> = new Map();
  private eventHistory: EventData[] = [];
  private maxHistorySize = 100;

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  private constructor() {
    this.setupCrossTabCommunication();
    this.startHeartbeat();
  }

  private setupCrossTabCommunication() {
    // Listen for cross-tab communication via localStorage
    window.addEventListener('storage', (event) => {
      if (event.key === 'event-bus-message' && event.newValue) {
        try {
          const eventData: EventData = JSON.parse(event.newValue);
          eventData.timestamp = new Date(eventData.timestamp);
          
          // Only process events from other tabs
          if (eventData.source !== `tab-${window.name}`) {
            this.processEvent(eventData, false); // Don't propagate again
          }
        } catch (error) {
          console.error('[Event Bus] Error processing cross-tab event:', error);
        }
      }
    });

    // Assign unique tab identifier
    if (!window.name) {
      window.name = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  private startHeartbeat() {
    // Send heartbeat every 30 seconds for connection monitoring
    setInterval(() => {
      this.emit('system_heartbeat', {
        tabId: window.name,
        timestamp: new Date(),
        activeListeners: this.getActiveListenerCount()
      }, 'event_bus');
    }, 30000);
  }

  public subscribe(eventType: EventType, callback: (data: EventData) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    this.listeners.get(eventType)!.push(callback);
    
    console.log(`[Event Bus] Subscribed to ${eventType}, total listeners: ${this.getActiveListenerCount()}`);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  public emit(eventType: EventType, payload: any, source: string = 'unknown', propagate: boolean = true) {
    const eventData: EventData = {
      type: eventType,
      payload,
      timestamp: new Date(),
      source: source.includes('tab-') ? source : `${source}-${window.name}`,
      propagate
    };

    this.processEvent(eventData, propagate);
  }

  private processEvent(eventData: EventData, shouldPropagate: boolean = true) {
    // Add to history
    this.eventHistory.push(eventData);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Process local listeners
    const callbacks = this.listeners.get(eventData.type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(eventData);
        } catch (error) {
          console.error(`Error in event listener for ${eventData.type}:`, error);
        }
      });
    }

    // Propagate to other tabs if needed
    if (shouldPropagate && eventData.propagate !== false) {
      try {
        localStorage.setItem('event-bus-message', JSON.stringify(eventData));
        // Clear immediately to allow for subsequent events
        setTimeout(() => localStorage.removeItem('event-bus-message'), 100);
      } catch (error) {
        console.error('[Event Bus] Error propagating event:', error);
      }
    }

    console.log(`[Event Bus] Processed ${eventData.type} from ${eventData.source}:`, eventData.payload);
  }

  public getEventHistory(eventType?: EventType, limit?: number): EventData[] {
    let history = eventType 
      ? this.eventHistory.filter(e => e.type === eventType)
      : this.eventHistory;
    
    if (limit) {
      history = history.slice(-limit);
    }
    
    return history;
  }

  public getActiveListenerCount(): number {
    return Array.from(this.listeners.values()).reduce((total, callbacks) => total + callbacks.length, 0);
  }

  public removeAllListeners(eventType?: EventType) {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  public getListenerStats(): Record<EventType, number> {
    const stats: Record<string, number> = {};
    this.listeners.forEach((callbacks, eventType) => {
      stats[eventType] = callbacks.length;
    });
    return stats as Record<EventType, number>;
  }
}

// Initialize event bus
export const eventBus = EventBus.getInstance();
