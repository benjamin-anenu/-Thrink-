
import React, { ReactNode, useEffect } from 'react';
import { useEnhancedSecurity } from '@/hooks/useEnhancedSecurity';
import { toast } from 'sonner';

interface SecureFormWrapperProps {
  children: ReactNode;
  formId: string;
  maxSubmissions?: number;
  timeWindow?: number;
  onSecurityViolation?: (violation: string) => void;
}

const SecureFormWrapper: React.FC<SecureFormWrapperProps> = ({
  children,
  formId,
  maxSubmissions = 5,
  timeWindow = 300000, // 5 minutes
  onSecurityViolation
}) => {
  const { 
    checkRateLimit, 
    addSecurityAlert, 
    logSecurityEvent,
    validateAndSanitizeInput 
  } = useEnhancedSecurity();

  useEffect(() => {
    // Log form access
    logSecurityEvent('form_accessed', 'data_access', formId, {
      formId,
      timestamp: new Date().toISOString()
    });
  }, [formId, logSecurityEvent]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const rateLimitCheck = checkRateLimit(
      `form_${formId}`,
      maxSubmissions,
      timeWindow,
      true
    );

    if (!rateLimitCheck.allowed) {
      event.preventDefault();
      
      const violation = `Form submission rate limit exceeded for ${formId}`;
      
      addSecurityAlert(
        'rate_limit_exceeded',
        'high',
        violation,
        {
          formId,
          remainingAttempts: rateLimitCheck.remainingAttempts,
          resetTime: rateLimitCheck.resetTime
        }
      );

      toast.error('Too many submissions. Please wait before trying again.');
      
      if (onSecurityViolation) {
        onSecurityViolation(violation);
      }

      return;
    }

    // Validate form inputs
    const formData = new FormData(event.currentTarget);
    const invalidInputs: string[] = [];

    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        const validation = validateAndSanitizeInput(value, 2000);
        if (!validation.isValid) {
          invalidInputs.push(`${key}: ${validation.error}`);
        }
      }
    }

    if (invalidInputs.length > 0) {
      event.preventDefault();
      
      const violation = `Invalid input detected in form ${formId}: ${invalidInputs.join(', ')}`;
      
      addSecurityAlert(
        'suspicious_activity',
        'high',
        violation,
        {
          formId,
          invalidInputs,
          formData: Object.fromEntries(formData.entries())
        }
      );

      toast.error('Invalid input detected. Please check your entries.');
      
      if (onSecurityViolation) {
        onSecurityViolation(violation);
      }

      return;
    }

    // Log successful form submission
    logSecurityEvent('form_submitted', 'data_access', formId, {
      formId,
      fieldsCount: formData.size,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {children}
    </form>
  );
};

export default SecureFormWrapper;
