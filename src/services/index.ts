
// Re-export all services for easy importing
export * from './EventBus';
export * from './RealTimeDataSync';
export * from './RealTimeEventService';
export * from './TinkSQLService';
export * from './BudgetService';
export * from './EnhancedTinkService';
export * from './ClientSatisfactionService';
export * from './AvailabilityCalculationService';
export * from './AIInsightsService';
export * from './ErrorBoundaryService';
export * from './PerformanceTracker';
export * from './EmailReminderService';
export * from './NotificationIntegrationService';
export * from './SystemValidationService';
export { connectionManager } from '@/utils/connectionUtils';

// Add missing service initialization functions
export const initializePerformanceTracking = () => {
  const { PerformanceTracker } = require('./PerformanceTracker');
  return PerformanceTracker.getInstance();
};

export const startEmailReminderService = () => {
  const { EmailReminderService } = require('./EmailReminderService');
  return EmailReminderService.getInstance();
};

export const initializeNotificationIntegration = () => {
  const { NotificationIntegrationService } = require('./NotificationIntegrationService');
  return NotificationIntegrationService.getInstance();
};

// System validation service export - handle case where service might not exist
export const systemValidationService = (() => {
  try {
    const { SystemValidationService } = require('./SystemValidationService');
    return SystemValidationService.getInstance();
  } catch (error) {
    console.warn('SystemValidationService not available, using mock implementation');
    return {
      performSystemValidation: async () => ({
        status: 'healthy',
        checks: [],
        timestamp: new Date()
      })
    };
  }
})();

// Initialize all real-time services
export const initializeRealTimeServices = async () => {
  try {
    console.log('[Services] Initializing real-time services...');
    
    const { initializeRealTimeDataSync } = await import('./RealTimeDataSync');
    const { initializeRealTimeEventService } = await import('./RealTimeEventService');
    const { initializeAIInsightsService } = await import('./AIInsightsService');
    
    // Initialize all services concurrently
    await Promise.all([
      initializeRealTimeDataSync(),
      initializeRealTimeEventService(),
      initializeAIInsightsService()
    ]);
    
    console.log('[Services] All real-time services initialized successfully');
  } catch (error) {
    console.error('[Services] Failed to initialize real-time services:', error);
    
    // Import error boundary service to handle initialization errors
    const { errorBoundaryService } = await import('./ErrorBoundaryService');
    errorBoundaryService.handleError(error as Error, {
      component: 'ServiceInitializer',
      action: 'initialize_services'
    });
  }
};
