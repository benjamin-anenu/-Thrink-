
import React, { createContext, useContext, ReactNode } from 'react';
import { useEnhancedSecurity } from '@/hooks/useEnhancedSecurity';
import { SecurityAlert } from '@/services/EnhancedSecurityService';

interface SecurityAlertsContextType {
  addAlert: (type: SecurityAlert['type'], severity: SecurityAlert['severity'], message: string, metadata?: Record<string, any>) => void;
  validateInput: (input: string, maxLength?: number, allowHtml?: boolean) => { isValid: boolean; error?: string; sanitizedValue?: string };
  validateUUID: (uuid: string | undefined | null) => { isValid: boolean; error?: string; sanitizedValue?: string };
  checkRateLimit: (key: string, maxAttempts: number, windowMs: number) => { allowed: boolean; remainingAttempts: number; resetTime: number };
  logSecurityEvent: (action: string, category?: string, resourceId?: string, metadata?: Record<string, any>) => Promise<void>;
}

const SecurityAlertsContext = createContext<SecurityAlertsContextType | undefined>(undefined);

interface SecurityAlertsProviderProps {
  children: ReactNode;
}

export const SecurityAlertsProvider: React.FC<SecurityAlertsProviderProps> = ({ children }) => {
  const {
    addSecurityAlert,
    validateAndSanitizeInput,
    validateUUID,
    checkRateLimit,
    logSecurityEvent
  } = useEnhancedSecurity();

  const contextValue: SecurityAlertsContextType = {
    addAlert: addSecurityAlert,
    validateInput: validateAndSanitizeInput,
    validateUUID,
    checkRateLimit,
    logSecurityEvent: logSecurityEvent as any
  };

  return (
    <SecurityAlertsContext.Provider value={contextValue}>
      {children}
    </SecurityAlertsContext.Provider>
  );
};

export const useSecurityAlerts = () => {
  const context = useContext(SecurityAlertsContext);
  if (context === undefined) {
    throw new Error('useSecurityAlerts must be used within a SecurityAlertsProvider');
  }
  return context;
};
