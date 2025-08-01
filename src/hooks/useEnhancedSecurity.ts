
import { useState, useEffect, useCallback } from 'react';
import { securityEnforcement } from '@/services/SecurityEnforcementService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SecurityState {
  isSecureContext: boolean;
  sessionValid: boolean;
  rateLimited: boolean;
  securityWarnings: string[];
}

export const useEnhancedSecurity = () => {
  const { user, signOut } = useAuth();
  const [securityState, setSecurityState] = useState<SecurityState>({
    isSecureContext: true,
    sessionValid: true,
    rateLimited: false,
    securityWarnings: []
  });

  // Validate input with security checks
  const validateInput = useCallback((
    input: string,
    type: 'text' | 'email' | 'password' | 'html' | 'sql' = 'text',
    maxLength = 1000
  ) => {
    return securityEnforcement.validateAndSanitizeInput(input, type, maxLength);
  }, []);

  // Check rate limits for operations
  const checkRateLimit = useCallback((operation: string, maxRequests = 10, windowMs = 60000) => {
    const allowed = securityEnforcement.checkRateLimit(operation, maxRequests, windowMs);
    
    if (!allowed) {
      setSecurityState(prev => ({ ...prev, rateLimited: true }));
      toast.error('Too many requests. Please slow down and try again later.');
      
      // Reset rate limit flag after window
      setTimeout(() => {
        setSecurityState(prev => ({ ...prev, rateLimited: false }));
      }, windowMs);
    }
    
    return allowed;
  }, []);

  // Validate API keys
  const validateApiKey = useCallback((key: string, keyType: 'openai' | 'openrouter') => {
    return securityEnforcement.validateApiKey(key, keyType);
  }, []);

  // Enhanced login with brute force protection
  const secureLogin = useCallback(async (email: string, password: string, loginFn: (email: string, password: string) => Promise<any>) => {
    const identifier = email.toLowerCase();
    
    // Check if user is locked out
    if (!securityEnforcement.checkLoginAttempts(identifier)) {
      toast.error('Account temporarily locked due to too many failed attempts. Please try again later.');
      return { error: new Error('Account locked') };
    }

    // Validate input
    const emailValidation = validateInput(email, 'email');
    const passwordValidation = validateInput(password, 'password');
    
    if (!emailValidation.isValid || !passwordValidation.isValid) {
      const errors = [...emailValidation.errors, ...passwordValidation.errors];
      toast.error(errors[0]);
      return { error: new Error(errors[0]) };
    }

    // Check rate limit
    if (!checkRateLimit('login', 5, 300000)) { // 5 attempts per 5 minutes
      return { error: new Error('Rate limited') };
    }

    try {
      const result = await loginFn(emailValidation.sanitized, password);
      
      if (result.error) {
        securityEnforcement.recordFailedLogin(identifier);
      } else {
        securityEnforcement.recordSuccessfulLogin(identifier);
      }
      
      return result;
    } catch (error) {
      securityEnforcement.recordFailedLogin(identifier);
      return { error };
    }
  }, [validateInput, checkRateLimit]);

  // Monitor security context
  useEffect(() => {
    if (!user) return;

    const checkSecurity = async () => {
      const isSecure = securityEnforcement.validateSecurityContext();
      const sessionResult = await securityEnforcement.validateSession();
      
      setSecurityState(prev => ({
        ...prev,
        isSecureContext: isSecure,
        sessionValid: sessionResult.isValid
      }));

      // Auto-refresh session if needed
      if (sessionResult.shouldRefresh) {
        try {
          await supabase.auth.refreshSession();
        } catch (error) {
          console.error('Failed to refresh session:', error);
          // Force logout on refresh failure
          await signOut();
        }
      }

      // Force logout if session is invalid
      if (!sessionResult.isValid && sessionResult.error) {
        toast.error('Your session has expired. Please log in again.');
        await signOut();
      }
    };

    // Initial check
    checkSecurity();

    // Periodic checks
    const interval = setInterval(checkSecurity, 60000); // Every minute

    return () => clearInterval(interval);
  }, [user, signOut]);

  // Initialize security service
  useEffect(() => {
    securityEnforcement.initialize();
    
    return () => {
      securityEnforcement.destroy();
    };
  }, []);

  return {
    securityState,
    validateInput,
    checkRateLimit,
    validateApiKey,
    secureLogin,
    isSecure: securityState.isSecureContext && securityState.sessionValid && !securityState.rateLimited
  };
};
