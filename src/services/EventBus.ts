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
  | 'system_heartbeat';

export interface EventData {
  type: EventType;
  payload: any;
  timestamp: Date;
  source: string;
}

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<EventType, ((data: EventData) => void)[]> = new Map();

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public subscribe(eventType: EventType, callback: (data: EventData) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    this.listeners.get(eventType)!.push(callback);
    
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

  public emit(eventType: EventType, payload: any, source: string = 'unknown') {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      const eventData: EventData = {
        type: eventType,
        payload,
        timestamp: new Date(),
        source
      };
      
      callbacks.forEach(callback => {
        try {
          callback(eventData);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }
    
    console.log(`[Event Bus] Emitted ${eventType} from ${source}:`, payload);
  }

  public removeAllListeners(eventType?: EventType) {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }
}

// Initialize event bus
export const eventBus = EventBus.getInstance();
