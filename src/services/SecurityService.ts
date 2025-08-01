
import { supabase } from '@/integrations/supabase/client';

export interface SecurityValidationResult {
  isValid: boolean;
  error?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export class SecurityService {
  /**
   * Validates input for SQL injection patterns
   */
  static validateInput(input: string): SecurityValidationResult {
    const sqlInjectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
      /(UNION\s+SELECT)/gi,
      /(\b(OR|AND)\s+\w+\s*=\s*\w+)/gi,
      /(--|\*\/|\/\*)/g,
      /(\bSCRIPT\b)/gi
    ];

    for (const pattern of sqlInjectionPatterns) {
      if (pattern.test(input)) {
        return {
          isValid: false,
          error: 'Input contains potentially dangerous patterns',
          riskLevel: 'critical'
        };
      }
    }

    return {
      isValid: true,
      riskLevel: 'low'
    };
  }

  /**
   * Validates workspace access permissions
   */
  static async validateWorkspaceAccess(workspaceId: string): Promise<SecurityValidationResult> {
    try {
      const { data, error } = await supabase
        .rpc('validate_workspace_access', { workspace_id_param: workspaceId });

      if (error) {
        return {
          isValid: false,
          error: 'Failed to validate workspace access',
          riskLevel: 'high'
        };
      }

      return {
        isValid: !!data,
        error: data ? undefined : 'Access denied to workspace',
        riskLevel: data ? 'low' : 'high'
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Workspace validation error',
        riskLevel: 'critical'
      };
    }
  }

  /**
   * Logs security events for monitoring
   */
  static async logSecurityEvent(
    action: string,
    resourceType?: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await supabase
        .from('audit_logs')
        .insert([{
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          metadata: metadata || {},
          user_agent: navigator.userAgent
        }]);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Sanitizes user input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validates file upload security
   */
  static validateFileUpload(file: File): SecurityValidationResult {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'File type not allowed',
        riskLevel: 'medium'
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size exceeds limit',
        riskLevel: 'medium'
      };
    }

    // Check for suspicious file names
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|scr|pif|com)$/i,
      /\.(php|asp|jsp|js)$/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(file.name)) {
        return {
          isValid: false,
          error: 'Suspicious file extension detected',
          riskLevel: 'high'
        };
      }
    }

    return {
      isValid: true,
      riskLevel: 'low'
    };
  }

  /**
   * Checks for rate limiting violations
   */
  static checkRateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
    const storageKey = `rate_limit_${key}`;
    const now = Date.now();
    
    let attempts: { count: number; firstAttempt: number };
    try {
      const stored = localStorage.getItem(storageKey);
      attempts = stored ? JSON.parse(stored) : { count: 0, firstAttempt: now };
    } catch {
      attempts = { count: 0, firstAttempt: now };
    }

    // Reset if window expired
    if (now - attempts.firstAttempt > windowMs) {
      attempts = { count: 0, firstAttempt: now };
    }

    attempts.count++;
    localStorage.setItem(storageKey, JSON.stringify(attempts));

    if (attempts.count > maxAttempts) {
      this.logSecurityEvent('rate_limit_exceeded', undefined, undefined, {
        key,
        attempts: attempts.count,
        window: windowMs
      });
      return false;
    }

    return true;
  }
}
