
import { initializeRealTimeEvents } from './RealTimeEventService';
import { initializeRealTimeDataSync } from './RealTimeDataSync';
import { initializeNotificationIntegration } from './NotificationIntegrationService';
import { initializePerformanceTracking } from './PerformanceTracker';
import { startEmailReminderService } from './EmailReminderService';

// Initialize all real-time services with real data integration
export const initializeRealTimeServices = () => {
  console.log('[Services] Initializing real-time services with real data integration...');
  
  // Initialize in correct order for dependencies
  const realTimeService = initializeRealTimeEvents();
  const performanceService = initializePerformanceTracking();
  const emailService = startEmailReminderService();
  const dataSyncService = initializeRealTimeDataSync();
  const notificationService = initializeNotificationIntegration();
  
  console.log('[Services] All real-time services initialized with real data monitoring');
  
  return {
    realTimeService,
    performanceService,
    emailService,
    dataSyncService,
    notificationService
  };
};
