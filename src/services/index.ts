
import { initializeRealTimeEvents } from './RealTimeEventService';
import { initializeRealTimeDataSync } from './RealTimeDataSync';
import { initializeNotificationIntegration } from './NotificationIntegrationService';

// Initialize all real-time services
export const initializeRealTimeServices = () => {
  console.log('[Services] Initializing real-time services...');
  
  // Initialize in correct order
  const realTimeService = initializeRealTimeEvents();
  const dataSyncService = initializeRealTimeDataSync();
  const notificationService = initializeNotificationIntegration();
  
  console.log('[Services] All real-time services initialized');
  
  return {
    realTimeService,
    dataSyncService,
    notificationService
  };
};
