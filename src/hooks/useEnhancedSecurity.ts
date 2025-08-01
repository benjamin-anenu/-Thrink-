
import { useState, useEffect, useCallback } from 'react';
import { EnhancedSecurityService, SecurityAlert } from '@/services/EnhancedSecurityService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SecurityMetrics {
  failedLogins: number;
  suspiciousActivities: number;
  rateLimit: number;
  privilegeEscalation: number;
  totalAlerts: number;
  lastUpdated: Date;
}

interface SecurityState {
  metrics: SecurityMetrics;
  alerts: SecurityAlert[];
  isMonitoring: boolean;
  loading: boolean;
}

export const useEnhancedSecurity = () => {
  const { user } = useAuth();
  const [securityState, setSecurityState] = useState<SecurityState>({
    metrics: {
      failedLogins: 0,
      suspiciousActivities: 0,
      rateLimit: 0,
      privilegeEscalation: 0,
      totalAlerts: 0,
      lastUpdated: new Date()
    },
    alerts: [],
    isMonitoring: false,
    loading: false
  });

  const validateAndSanitizeInput = useCallback((
    input: string,
    maxLength?: number,
    allowHtml?: boolean
  ) => {
    return EnhancedSecurityService.validateAndSanitizeInput(input, maxLength, allowHtml);
  }, []);

  const validateUUID = useCallback((uuid: string | undefined | null) => {
    return EnhancedSecurityService.validateUUID(uuid);
  }, []);

  const validateEmail = useCallback((email: string) => {
    return EnhancedSecurityService.validateEmail(email);
  }, []);

  const checkRateLimit = useCallback((
    key: string,
    maxAttempts: number,
    windowMs: number,
    progressiveDelay?: boolean
  ) => {
    return EnhancedSecurityService.checkRateLimit(key, maxAttempts, windowMs, progressiveDelay);
  }, []);

  const logSecurityEvent = useCallback(async (
    action: string,
    category?: 'authentication' | 'authorization' | 'data_access' | 'system',
    resourceId?: string,
    metadata?: Record<string, any>
  ) => {
    await EnhancedSecurityService.logSecurityEvent(action, category, resourceId, metadata);
    
    // Refresh metrics after logging
    if (securityState.isMonitoring) {
      refreshMetrics();
    }
  }, [securityState.isMonitoring]);

  const validateDatabaseParams = useCallback((params: Record<string, any>) => {
    return EnhancedSecurityService.validateDatabaseParams(params);
  }, []);

  const addSecurityAlert = useCallback((
    type: SecurityAlert['type'],
    severity: SecurityAlert['severity'],
    message: string,
    metadata?: Record<string, any>
  ) => {
    const alert = EnhancedSecurityService.generateSecurityAlert(type, severity, message, metadata);
    
    setSecurityState(prev => ({
      ...prev,
      alerts: [alert, ...prev.alerts.slice(0, 49)], // Keep last 50 alerts
      metrics: {
        ...prev.metrics,
        totalAlerts: prev.metrics.totalAlerts + 1,
        [type === 'authentication_failure' ? 'failedLogins' : 
         type === 'privilege_escalation' ? 'privilegeEscalation' :
         type === 'rate_limit_exceeded' ? 'rateLimit' : 'suspiciousActivities']: 
         prev.metrics[type === 'authentication_failure' ? 'failedLogins' : 
                     type === 'privilege_escalation' ? 'privilegeEscalation' :
                     type === 'rate_limit_exceeded' ? 'rateLimit' : 'suspiciousActivities'] + 1,
        lastUpdated: new Date()
      }
    }));

    // Show toast for high/critical severity alerts
    if (severity === 'high' || severity === 'critical') {
      toast.error(`Security Alert: ${message}`);
    }

    // Log to audit system
    logSecurityEvent(`security_alert_${type}`, 'system', undefined, {
      severity,
      message,
      alertId: alert.id,
      ...metadata
    });
  }, [logSecurityEvent]);

  const refreshMetrics = useCallback(async () => {
    if (!user) return;
    
    setSecurityState(prev => ({ ...prev, loading: true }));
    
    try {
      // This would typically fetch from your audit logs
      // For now, we'll update the timestamp
      setSecurityState(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          lastUpdated: new Date()
        },
        loading: false
      }));
    } catch (error) {
      console.error('Failed to refresh security metrics:', error);
      setSecurityState(prev => ({ ...prev, loading: false }));
    }
  }, [user]);

  const startMonitoring = useCallback(() => {
    setSecurityState(prev => ({ ...prev, isMonitoring: true }));
    refreshMetrics();
  }, [refreshMetrics]);

  const stopMonitoring = useCallback(() => {
    setSecurityState(prev => ({ ...prev, isMonitoring: false }));
  }, []);

  const clearAlerts = useCallback(() => {
    setSecurityState(prev => ({
      ...prev,
      alerts: [],
      metrics: {
        ...prev.metrics,
        totalAlerts: 0,
        lastUpdated: new Date()
      }
    }));
  }, []);

  // Auto-refresh metrics every 30 seconds when monitoring
  useEffect(() => {
    if (!securityState.isMonitoring) return;

    const interval = setInterval(refreshMetrics, 30000);
    return () => clearInterval(interval);
  }, [securityState.isMonitoring, refreshMetrics]);

  return {
    ...securityState,
    validateAndSanitizeInput,
    validateUUID,
    validateEmail,
    validateDatabaseParams,
    checkRateLimit,
    logSecurityEvent,
    addSecurityAlert,
    refreshMetrics,
    startMonitoring,
    stopMonitoring,
    clearAlerts
  };
};
