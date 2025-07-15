
export type EventType = 
  | 'task_completed'
  | 'task_created'
  | 'task_updated'
  | 'project_updated'
  | 'project_created'
  | 'resource_assigned'
  | 'resource_updated'
  | 'resource_availability_changed'
  | 'stakeholder_updated'
  | 'stakeholder_created'
  | 'deadline_approaching'
  | 'milestone_reached'
  | 'context_updated'
  | 'data_sync'
  | 'performance_alert'
  | 'system_heartbeat'
  | 'email_reminder_sent'
  | 'rebaseline_requested';

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

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  private constructor() {
    // Initialize event bus
    console.log('[Event Bus] Initialized');
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
          console.log(`[Event Bus] Unsubscribed from ${type}`);
        }
      }
    };
  }

  public emit(type: EventType, payload: any, source: string = 'unknown'): void {
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

    // Notify listeners
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.forEach(listener => {
        try {
          listener.callback(event);
        } catch (error) {
          console.error(`[Event Bus] Error in listener for ${type}:`, error);
        }
      });
    }

    console.log(`[Event Bus] Emitted ${type} event (${typeListeners?.length || 0} listeners notified)`);
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

  public clearHistory(): void {
    this.eventHistory = [];
    console.log('[Event Bus] Event history cleared');
  }
}

export const eventBus = EventBus.getInstance();
