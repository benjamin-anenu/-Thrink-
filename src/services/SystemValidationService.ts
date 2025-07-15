import { EventBus } from './EventBus';
import { aiInsightsService } from './AIInsightsService';
import { PerformanceTracker } from './PerformanceTracker';

interface SystemHealthMetric {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  details?: any;
}

interface SystemValidationResult {
  isHealthy: boolean;
  overallScore: number;
  metrics: SystemHealthMetric[];
  recommendations: string[];
}

export class SystemValidationService {
  private static instance: SystemValidationService;
  private eventBus: EventBus;
  private validationTimer: NodeJS.Timeout | null = null;
  private lastValidation: SystemValidationResult | null = null;

  public static getInstance(): SystemValidationService {
    if (!SystemValidationService.instance) {
      SystemValidationService.instance = new SystemValidationService();
    }
    return SystemValidationService.instance;
  }

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.startPeriodicValidation();
  }

  private startPeriodicValidation() {
    // Run system validation every 10 minutes
    this.validationTimer = setInterval(() => {
      this.performSystemValidation();
    }, 600000);

    // Run initial validation after 5 seconds
    setTimeout(() => {
      this.performSystemValidation();
    }, 5000);
  }

  public async performSystemValidation(): Promise<SystemValidationResult> {
    const metrics: SystemHealthMetric[] = [];
    let overallScore = 100;

    try {
      // Validate Event Bus
      const eventBusHealth = this.validateEventBus();
      metrics.push(eventBusHealth);
      if (eventBusHealth.status !== 'healthy') overallScore -= 15;

      // Validate Data Persistence
      const dataHealth = this.validateDataPersistence();
      metrics.push(dataHealth);
      if (dataHealth.status !== 'healthy') overallScore -= 20;

      // Validate AI Services
      const aiHealth = this.validateAIServices();
      metrics.push(aiHealth);
      if (aiHealth.status !== 'healthy') overallScore -= 15;

      // Validate Performance Tracking
      const performanceHealth = this.validatePerformanceTracking();
      metrics.push(performanceHealth);
      if (performanceHealth.status !== 'healthy') overallScore -= 10;

      // Validate Real-time Sync
      const syncHealth = this.validateRealTimeSync();
      metrics.push(syncHealth);
      if (syncHealth.status !== 'healthy') overallScore -= 10;

      // Validate Memory Usage
      const memoryHealth = this.validateMemoryUsage();
      metrics.push(memoryHealth);
      if (memoryHealth.status !== 'healthy') overallScore -= 5;

      // Validate Browser Storage
      const storageHealth = this.validateBrowserStorage();
      metrics.push(storageHealth);
      if (storageHealth.status !== 'healthy') overallScore -= 15;

    } catch (error) {
      metrics.push({
        component: 'System Validation',
        status: 'error',
        message: `Validation process failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      });
      overallScore -= 30;
    }

    const result: SystemValidationResult = {
      isHealthy: overallScore >= 70,
      overallScore: Math.max(0, overallScore),
      metrics,
      recommendations: this.generateRecommendations(metrics)
    };

    this.lastValidation = result;

    // Emit system health event
    this.eventBus.emit('system_heartbeat', {
      health: result,
      timestamp: new Date()
    }, 'system_validation');

    if (!result.isHealthy) {
      console.warn('[System Validation] System health issues detected:', result);
      
      // Emit system error for critical issues
      if (result.overallScore < 50) {
        this.eventBus.emit('system_error', {
          severity: 'critical',
          message: `System health score critically low: ${result.overallScore}%`,
          metrics: result.metrics.filter(m => m.status === 'error'),
          timestamp: new Date()
        }, 'system_validation');
      }
    } else {
      console.log(`[System Validation] System healthy (Score: ${result.overallScore}%)`);
    }

    return result;
  }

  private validateEventBus(): SystemHealthMetric {
    try {
      const stats = this.eventBus.getListenerStats();
      const totalListeners = Object.values(stats).reduce((sum, count) => sum + count, 0);
      const circuitBreakerStats = this.eventBus.getCircuitBreakerStats();
      const openBreakers = Object.values(circuitBreakerStats).filter((breaker: any) => breaker.isOpen).length;

      if (openBreakers > 0) {
        return {
          component: 'Event Bus',
          status: 'warning',
          message: `${openBreakers} circuit breakers are open`,
          timestamp: new Date(),
          details: { totalListeners, openBreakers, stats }
        };
      }

      if (totalListeners === 0) {
        return {
          component: 'Event Bus',
          status: 'warning',
          message: 'No event listeners registered',
          timestamp: new Date(),
          details: { totalListeners, stats }
        };
      }

      return {
        component: 'Event Bus',
        status: 'healthy',
        message: `${totalListeners} listeners active, ${openBreakers} breakers open`,
        timestamp: new Date(),
        details: { totalListeners, openBreakers }
      };
    } catch (error) {
      return {
        component: 'Event Bus',
        status: 'error',
        message: `Event bus validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
    }
  }

  private validateDataPersistence(): SystemHealthMetric {
    try {
      // Test localStorage operations
      const testKey = 'system-validation-test';
      const testData = { timestamp: Date.now(), test: true };
      
      localStorage.setItem(testKey, JSON.stringify(testData));
      const retrieved = JSON.parse(localStorage.getItem(testKey) || '{}');
      localStorage.removeItem(testKey);

      if (retrieved.test !== true) {
        return {
          component: 'Data Persistence',
          status: 'error',
          message: 'localStorage read/write test failed',
          timestamp: new Date()
        };
      }

      // Check storage usage
      const usage = this.estimateStorageUsage();
      if (usage > 80) {
        return {
          component: 'Data Persistence',
          status: 'warning',
          message: `High storage usage: ~${usage}%`,
          timestamp: new Date(),
          details: { storageUsage: usage }
        };
      }

      return {
        component: 'Data Persistence',
        status: 'healthy',
        message: `Storage operations working, ~${usage}% usage`,
        timestamp: new Date(),
        details: { storageUsage: usage }
      };
    } catch (error) {
      return {
        component: 'Data Persistence',
        status: 'error',
        message: `Storage validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
    }
  }

  private validateAIServices(): SystemHealthMetric {
    try {
      // Check if AI services are responsive
      const testProjectId = 'validation-test';
      const insights = aiInsightsService.getProjectInsights(testProjectId);
      
      // Services should return empty arrays for non-existent projects without errors
      if (!Array.isArray(insights)) {
        return {
          component: 'AI Services',
          status: 'error',
          message: 'AI insights service returned invalid data',
          timestamp: new Date()
        };
      }

      return {
        component: 'AI Services',
        status: 'healthy',
        message: 'AI services responsive',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        component: 'AI Services',
        status: 'error',
        message: `AI services validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
    }
  }

  private validatePerformanceTracking(): SystemHealthMetric {
    try {
      const performanceTracker = PerformanceTracker.getInstance();
      const profiles = performanceTracker.getAllProfiles();
      
      return {
        component: 'Performance Tracking',
        status: 'healthy',
        message: `Tracking ${profiles.length} performance profiles`,
        timestamp: new Date(),
        details: { profileCount: profiles.length }
      };
    } catch (error) {
      return {
        component: 'Performance Tracking',
        status: 'error',
        message: `Performance tracking validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
    }
  }

  private validateRealTimeSync(): SystemHealthMetric {
    try {
      // Check if real-time data sync is working by checking recent event history
      const recentEvents = this.eventBus.getEventHistory(undefined, 10);
      const recentEventCount = recentEvents.filter(e => 
        Date.now() - e.timestamp.getTime() < 300000 // Last 5 minutes
      ).length;

      if (recentEventCount === 0) {
        return {
          component: 'Real-time Sync',
          status: 'warning',
          message: 'No recent real-time events detected',
          timestamp: new Date(),
          details: { recentEventCount }
        };
      }

      return {
        component: 'Real-time Sync',
        status: 'healthy',
        message: `${recentEventCount} recent events processed`,
        timestamp: new Date(),
        details: { recentEventCount }
      };
    } catch (error) {
      return {
        component: 'Real-time Sync',
        status: 'error',
        message: `Real-time sync validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
    }
  }

  private validateMemoryUsage(): SystemHealthMetric {
    try {
      // Check if performance.memory is available (Chrome)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        if (usagePercent > 90) {
          return {
            component: 'Memory Usage',
            status: 'error',
            message: `Critical memory usage: ${usagePercent.toFixed(1)}%`,
            timestamp: new Date(),
            details: { usagePercent, memory }
          };
        } else if (usagePercent > 70) {
          return {
            component: 'Memory Usage',
            status: 'warning',
            message: `High memory usage: ${usagePercent.toFixed(1)}%`,
            timestamp: new Date(),
            details: { usagePercent, memory }
          };
        } else {
          return {
            component: 'Memory Usage',
            status: 'healthy',
            message: `Memory usage: ${usagePercent.toFixed(1)}%`,
            timestamp: new Date(),
            details: { usagePercent }
          };
        }
      } else {
        return {
          component: 'Memory Usage',
          status: 'healthy',
          message: 'Memory monitoring not available in this browser',
          timestamp: new Date()
        };
      }
    } catch (error) {
      return {
        component: 'Memory Usage',
        status: 'warning',
        message: `Memory validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
    }
  }

  private validateBrowserStorage(): SystemHealthMetric {
    try {
      const keys = ['projects', 'resources', 'workspaces', 'performance-profiles'];
      const missingKeys = keys.filter(key => !localStorage.getItem(key));
      
      if (missingKeys.length === keys.length) {
        return {
          component: 'Browser Storage',
          status: 'warning',
          message: 'No application data found in storage',
          timestamp: new Date(),
          details: { missingKeys }
        };
      } else if (missingKeys.length > 0) {
        return {
          component: 'Browser Storage',
          status: 'warning',
          message: `Missing data: ${missingKeys.join(', ')}`,
          timestamp: new Date(),
          details: { missingKeys }
        };
      } else {
        return {
          component: 'Browser Storage',
          status: 'healthy',
          message: 'All application data present',
          timestamp: new Date(),
          details: { keysPresent: keys.length }
        };
      }
    } catch (error) {
      return {
        component: 'Browser Storage',
        status: 'error',
        message: `Storage validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
    }
  }

  private estimateStorageUsage(): number {
    try {
      let totalSize = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length;
        }
      }
      
      // Estimate as percentage of typical 10MB limit
      const estimatedUsage = (totalSize / (10 * 1024 * 1024)) * 100;
      return Math.round(estimatedUsage);
    } catch (error) {
      return 0;
    }
  }

  private generateRecommendations(metrics: SystemHealthMetric[]): string[] {
    const recommendations: string[] = [];
    
    metrics.forEach(metric => {
      switch (metric.component) {
        case 'Event Bus':
          if (metric.status === 'warning' && metric.message.includes('circuit breakers')) {
            recommendations.push('Reset circuit breakers to restore event processing');
          }
          break;
          
        case 'Data Persistence':
          if (metric.status === 'warning' && metric.message.includes('storage usage')) {
            recommendations.push('Clear old data or optimize storage usage');
          }
          break;
          
        case 'Memory Usage':
          if (metric.status === 'warning' || metric.status === 'error') {
            recommendations.push('Refresh browser to free memory or close unused tabs');
          }
          break;
          
        case 'Real-time Sync':
          if (metric.status === 'warning') {
            recommendations.push('Check network connection and refresh if needed');
          }
          break;
      }
    });

    const errorCount = metrics.filter(m => m.status === 'error').length;
    const warningCount = metrics.filter(m => m.status === 'warning').length;
    
    if (errorCount > 0) {
      recommendations.push('Contact system administrator for critical errors');
    }
    
    if (warningCount > 2) {
      recommendations.push('Consider refreshing the application to reset services');
    }

    return recommendations;
  }

  public getLastValidationResult(): SystemValidationResult | null {
    return this.lastValidation;
  }

  public destroy() {
    if (this.validationTimer) {
      clearInterval(this.validationTimer);
      this.validationTimer = null;
    }
  }
}

export const systemValidationService = SystemValidationService.getInstance();

export const SystemValidationServiceStatic = {
  validateSystem: async () => {
    const instance = SystemValidationService.getInstance();
    const result = await instance.performSystemValidation();
    return {
      overall: result.isHealthy ? 'healthy' : result.overallScore > 50 ? 'warning' : 'critical',
      timestamp: new Date().toISOString(),
      validationResults: result.metrics,
      issues: result.metrics.filter(m => m.status !== 'healthy').map(m => ({
        component: m.component,
        message: m.message,
        severity: m.status,
        timestamp: m.timestamp.toISOString()
      }))
    };
  },
};