
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useEnhancedSecurity } from '@/hooks/useEnhancedSecurity';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

interface SecurityContextType {
  validateInput: (input: string, type?: 'text' | 'email' | 'password' | 'html' | 'sql', maxLength?: number) => any;
  checkRateLimit: (operation: string, maxRequests?: number, windowMs?: number) => boolean;
  validateApiKey: (key: string, keyType: 'openai' | 'openrouter') => boolean;
  secureLogin: (email: string, password: string, loginFn: any) => Promise<any>;
  isSecure: boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const {
    securityState,
    validateInput,
    checkRateLimit,
    validateApiKey,
    secureLogin,
    isSecure
  } = useEnhancedSecurity();

  const contextValue: SecurityContextType = {
    validateInput,
    checkRateLimit,
    validateApiKey,
    secureLogin,
    isSecure
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {/* Security warnings display */}
      {(!securityState.isSecureContext || securityState.securityWarnings.length > 0) && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Security Warning</AlertTitle>
          <AlertDescription>
            {!securityState.isSecureContext && (
              <div>This application is not running in a secure context. Some features may be limited.</div>
            )}
            {securityState.securityWarnings.map((warning, index) => (
              <div key={index}>{warning}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Rate limiting notification */}
      {securityState.rateLimited && (
        <Alert variant="destructive" className="mb-4">
          <Shield className="h-4 w-4" />
          <AlertTitle>Rate Limited</AlertTitle>
          <AlertDescription>
            You're making requests too quickly. Please slow down and try again.
          </AlertDescription>
        </Alert>
      )}

      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
