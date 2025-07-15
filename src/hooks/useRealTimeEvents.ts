
import { useEffect, useState, useCallback } from 'react';
import { EventBus, EventType, EventData } from '@/services/EventBus';
import { RealTimeEventService } from '@/services/RealTimeEventService';

export interface RealTimeStatus {
  isConnected: boolean;
  connectionStatus: string;
  queuedEvents: number;
  lastHeartbeat?: Date;
}

export const useRealTimeEvents = (eventTypes?: EventType[]) => {
  const [eventBus] = useState(() => EventBus.getInstance());
  const [realTimeService] = useState(() => RealTimeEventService.getInstance());
  const [status, setStatus] = useState<RealTimeStatus>({
    isConnected: false,
    connectionStatus: 'disconnected',
    queuedEvents: 0
  });
  const [lastEvent, setLastEvent] = useState<EventData | null>(null);

  // Subscribe to specific event types
  const subscribe = useCallback((eventType: EventType, callback: (data: EventData) => void) => {
    return eventBus.subscribe(eventType, callback);
  }, [eventBus]);

  // Emit events through the real-time service
  const emit = useCallback((eventType: EventType, payload: any, source?: string) => {
    eventBus.emit(eventType, payload, source || 'component');
  }, [eventBus]);

  // Real-time service methods
  const emitTaskCompleted = useCallback((taskId: string, taskName: string, projectId: string, projectName: string, resourceId: string, resourceName: string) => {
    realTimeService.emitTaskCompleted(taskId, taskName, projectId, projectName, resourceId, resourceName);
  }, [realTimeService]);

  const emitResourceAssigned = useCallback((resourceId: string, resourceName: string, projectId: string, projectName: string, taskName: string) => {
    realTimeService.emitResourceAssigned(resourceId, resourceName, projectId, projectName, taskName);
  }, [realTimeService]);

  const emitProjectUpdated = useCallback((projectId: string, projectName: string, updateType: string, details: any) => {
    realTimeService.emitProjectUpdated(projectId, projectName, updateType, details);
  }, [realTimeService]);

  const emitDeadlineApproaching = useCallback((taskId: string, taskName: string, projectId: string, projectName: string, daysRemaining: number) => {
    realTimeService.emitDeadlineApproaching(taskId, taskName, projectId, projectName, daysRemaining);
  }, [realTimeService]);

  // Update status periodically
  useEffect(() => {
    const updateStatus = () => {
      setStatus({
        isConnected: realTimeService.isRealTimeConnected(),
        connectionStatus: realTimeService.getConnectionStatus(),
        queuedEvents: realTimeService.getQueuedEventCount(),
        lastHeartbeat: new Date()
      });
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, [realTimeService]);

  // Subscribe to specified event types and update lastEvent
  useEffect(() => {
    if (!eventTypes || eventTypes.length === 0) return;

    const unsubscribeFunctions: (() => void)[] = [];

    eventTypes.forEach(eventType => {
      const unsubscribe = eventBus.subscribe(eventType, (eventData) => {
        setLastEvent(eventData);
      });
      unsubscribeFunctions.push(unsubscribe);
    });

    return () => {
      unsubscribeFunctions.forEach(unsub => unsub());
    };
  }, [eventTypes, eventBus]);

  // Subscribe to system heartbeat for connection status
  useEffect(() => {
    const unsubscribe = eventBus.subscribe('system_heartbeat' as EventType, (eventData) => {
      setStatus(prev => ({
        ...prev,
        lastHeartbeat: eventData.timestamp,
        isConnected: true
      }));
    });

    return unsubscribe;
  }, [eventBus]);

  return {
    subscribe,
    emit,
    emitTaskCompleted,
    emitResourceAssigned,
    emitProjectUpdated,
    emitDeadlineApproaching,
    status,
    lastEvent,
    isConnected: status.isConnected
  };
};
