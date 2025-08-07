
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
  
  try {
    // Initialize core infrastructure first (these are already singletons)
    console.log('[Services] Initializing core infrastructure...');
    const dataService = dataPersistence;
    const eventService = eventBus;
    
    // Initialize context synchronizer (must be done before other services)
    console.log('[Services] Initializing context synchronizer...');
    contextSynchronizer.initialize();
    const syncService = contextSynchronizer;
    
    // Initialize real-time services in dependency order
    console.log('[Services] Initializing real-time services...');
    const realTimeService = initializeRealTimeEvents();
    const performanceService = initializePerformanceTracking();
    const emailService = startEmailReminderService();
    const dataSyncService = initializeRealTimeDataSync();
    const notificationService = initializeNotificationIntegration();
    
    // Start system monitoring
    console.log('[Services] Starting system monitoring...');
    startSystemMonitoring();
    
    console.log('[Services] Full real-time system initialized successfully');
    
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
  } catch (error) {
    console.error('[Services] Error initializing real-time system:', error);
    throw error;
  }
};

// System monitoring and health checks with enhanced error handling
const startSystemMonitoring = () => {
  try {
    // Monitor system health every 5 minutes
    const healthCheckInterval = setInterval(() => {
      try {
        const stats = {
          eventBus: eventBus.getListenerStats(),
          contextSync: contextSynchronizer.getSyncStats(),
          dataStorage: dataPersistence.getStorageStats(),
          circuitBreakers: eventBus.getCircuitBreakerStats(),
          timestamp: new Date()
        };
        
        // Validate storage integrity periodically
        const storageValidation = dataPersistence.validateStorageIntegrity();
        if (!storageValidation.isValid) {
          console.warn('[System Monitor] Storage integrity issues detected:', storageValidation.errors);
        }
        
        eventBus.emit('system_heartbeat', {
          type: 'health_check',
          stats,
          storageIntegrity: storageValidation,
          status: storageValidation.isValid ? 'healthy' : 'degraded'
        }, 'system_monitor');
        
        console.log('[System Monitor] Health check completed:', {
          ...stats,
          storageHealth: storageValidation.isValid ? 'ok' : 'issues'
        });
      } catch (error) {
        console.error('[System Monitor] Error in health check:', error);
        
        // Emit error event
        eventBus.emit('system_heartbeat', {
          type: 'health_check_error',
          error: error instanceof Error ? error.message : String(error),
          status: 'error'
        }, 'system_monitor');
      }
    }, 5 * 60 * 1000);

    // Add cleanup for the interval (in case we need to shut down)
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        clearInterval(healthCheckInterval);
      });
    }

    // Initial health check
    console.log('[System Monitor] Started system health monitoring');
    
    // Perform initial health check after a short delay
    setTimeout(() => {
      try {
        const initialStats = {
          eventBus: eventBus.getListenerStats(),
          contextSync: contextSynchronizer.getSyncStats(),
          dataStorage: dataPersistence.getStorageStats()
        };
        
        console.log('[System Monitor] Initial system state:', initialStats);
      } catch (error) {
        console.error('[System Monitor] Error in initial health check:', error);
      }
    }, 1000);
    
  } catch (error) {
    console.error('[System Monitor] Failed to start system monitoring:', error);
  }
};

// Export individual services for direct access
export {
  dataPersistence,
  contextSynchronizer,
  eventBus
};

// Export service initializers
export { initializeRealTimeEvents } from './RealTimeEventService';
export { initializeRealTimeDataSync } from './RealTimeDataSync';
export { initializeNotificationIntegration } from './NotificationIntegrationService';
export { initializePerformanceTracking } from './PerformanceTracker';
export { startEmailReminderService } from './EmailReminderService';
export { aiInsightsService } from './AIInsightsService';
export { systemValidationService } from './SystemValidationService';
export { ProjectHealthService } from './ProjectHealthService';
export { ProjectDateService } from './ProjectDateService';
export { ProjectDataService } from './ProjectDataService';

// Export service status checker
export const getSystemStatus = () => {
  try {
    return {
      eventBus: {
        active: !!eventBus,
        stats: eventBus.getListenerStats(),
        circuitBreakers: eventBus.getCircuitBreakerStats()
      },
      contextSync: {
        active: !!contextSynchronizer,
        stats: contextSynchronizer.getSyncStats()
      },
      dataStorage: {
        active: !!dataPersistence,
        stats: dataPersistence.getStorageStats(),
        integrity: dataPersistence.validateStorageIntegrity()
      },
      timestamp: new Date()
    };
  } catch (error) {
    console.error('[Services] Error getting system status:', error);
    return {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date()
    };
  }
};
