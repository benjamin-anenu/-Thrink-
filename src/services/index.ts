
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

// Simple service initialization without complex dynamic imports
export const initializeRealTimeServices = async () => {
  console.log('[Services] Initializing real-time services...');
  
  try {
    // Initialize services in a simple, stable way
    const { RealTimeDataSync } = await import('./RealTimeDataSync');
    const { RealTimeEventService } = await import('./RealTimeEventService');
    const { AIInsightsService } = await import('./AIInsightsService');
    
    // Just ensure services exist, don't force complex initialization
    RealTimeDataSync.getInstance();
    RealTimeEventService.getInstance();
    AIInsightsService.getInstance();
    
    console.log('[Services] Real-time services ready');
    return true;
  } catch (error) {
    console.warn('[Services] Non-critical service initialization issue:', error);
    // Don't throw errors that would cause restarts
    return false;
  }
};
