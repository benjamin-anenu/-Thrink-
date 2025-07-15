
import { initializeRealTimeEvents } from './RealTimeEventService';
import { initializeRealTimeDataSync } from './RealTimeDataSync';
import { initializeNotificationIntegration } from './NotificationIntegrationService';
import { initializePerformanceTracking } from './PerformanceTracker';
import { startEmailReminderService } from './EmailReminderService';
import { dataPersistence } from './DataPersistence';
import { contextSynchronizer } from './ContextSynchronizer';
import { eventBus } from './EventBus';

// Initialize all services with full cross-component communication
export const initializeRealTimeServices = () => {
  console.log('[Services] Initializing comprehensive real-time system...');
  
  // Initialize core infrastructure first
  const dataService = dataPersistence;
  const syncService = contextSynchronizer;
  const eventService = eventBus;
  
  // Initialize real-time services in dependency order
  const realTimeService = initializeRealTimeEvents();
  const performanceService = initializePerformanceTracking();
  const emailService = startEmailReminderService();
  const dataSyncService = initializeRealTimeDataSync();
  const notificationService = initializeNotificationIntegration();
  
  // Start system monitoring
  startSystemMonitoring();
  
  console.log('[Services] Full real-time system initialized with cross-component communication');
  
  return {
    realTimeService,
    performanceService,
    emailService,
    dataSyncService,
    notificationService,
    dataService,
    syncService,
    eventService
  };
};

// System monitoring and health checks
const startSystemMonitoring = () => {
  // Monitor system health every 5 minutes
  setInterval(() => {
    const stats = {
      eventBus: eventBus.getListenerStats(),
      contextSync: contextSynchronizer.getSyncStats(),
      dataStorage: dataPersistence.getStorageStats(),
      timestamp: new Date()
    };
    
    eventBus.emit('system_heartbeat', {
      type: 'health_check',
      stats,
      status: 'healthy'
    }, 'system_monitor');
    
    console.log('[System Monitor] Health check completed:', stats);
  }, 5 * 60 * 1000);

  // Initial health check
  console.log('[System Monitor] Started system health monitoring');
};

// Export individual services for direct access
export {
  dataPersistence,
  contextSynchronizer,
  eventBus
};
