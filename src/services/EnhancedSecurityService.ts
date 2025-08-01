
import { supabase } from '@/integrations/supabase/client';

export interface SecurityValidationResult {
  isValid: boolean;
  error?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  sanitizedValue?: any; // Changed from string to any to handle different types
}

export interface SecurityAlert {
  id: string;
  type: 'authentication_failure' | 'privilege_escalation' | 'suspicious_activity' | 'rate_limit_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

export class EnhancedSecurityService {
  private static readonly UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  private static readonly EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly PHONE_PATTERN = /^[\+]?[1-9][\d]{0,15}$/;

  /**
   * Enhanced UUID validation with sanitization
   */
  static validateUUID(input: string | undefined | null): SecurityValidationResult {
    if (!input || input === 'undefined' || input === 'null') {
      return {
        isValid: false,
        error: 'UUID cannot be empty, undefined, or null',
        riskLevel: 'medium'
      };
    }

    const cleanInput = input.trim();
    
    if (!this.UUID_PATTERN.test(cleanInput)) {
      return {
        isValid: false,
        error: 'Invalid UUID format',
        riskLevel: 'medium',
        sanitizedValue: ''
      };
    }

    return {
      isValid: true,
      riskLevel: 'low',
      sanitizedValue: cleanInput.toLowerCase()
    };
  }

  /**
   * Enhanced email validation
   */
  static validateEmail(email: string): SecurityValidationResult {
    if (!email || email.trim().length === 0) {
      return {
        isValid: false,
        error: 'Email is required',
        riskLevel: 'low'
      };
    }

    const cleanEmail = email.trim().toLowerCase();
    
    if (cleanEmail.length > 254) {
      return {
        isValid: false,
        error: 'Email too long',
        riskLevel: 'medium'
      };
    }

    if (!this.EMAIL_PATTERN.test(cleanEmail)) {
      return {
        isValid: false,
        error: 'Invalid email format',
        riskLevel: 'medium'
      };
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /<script/i,
      /\+.*@/,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(cleanEmail)) {
        return {
          isValid: false,
          error: 'Email contains suspicious patterns',
          riskLevel: 'high'
        };
      }
    }

    return {
      isValid: true,
      riskLevel: 'low',
      sanitizedValue: cleanEmail
    };
  }

  /**
   * Enhanced input validation with comprehensive sanitization
   */
  static validateAndSanitizeInput(
    input: string, 
    maxLength: number = 1000,
    allowHtml: boolean = false
  ): SecurityValidationResult {
    if (!input) {
      return {
        isValid: true,
        riskLevel: 'low',
        sanitizedValue: ''
      };
    }

    // Length validation
    if (input.length > maxLength) {
      return {
        isValid: false,
        error: `Input exceeds maximum length of ${maxLength} characters`,
        riskLevel: 'medium'
      };
    }

    // SQL injection patterns (enhanced)
    const sqlInjectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
      /(UNION\s+(ALL\s+)?SELECT)/gi,
      /(\b(OR|AND)\s+\w+\s*(=|LIKE|IN|EXISTS)\s*)/gi,
      /(--|\*\/|\/\*|;)/g,
      /(\bSCRIPT\b)/gi,
      /(\b(DECLARE|CAST|CONVERT|CHAR|ASCII)\b)/gi,
      /(xp_|sp_)/gi,
      /(\b(INFORMATION_SCHEMA|SYSOBJECTS|SYSCOLUMNS)\b)/gi
    ];

    // XSS patterns (enhanced)
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^>]*>/gi,
      /<link\b[^>]*>/gi,
      /<meta\b[^>]*>/gi,
      /javascript:/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi, // Event handlers like onclick, onload, etc.
    ];

    // Check for SQL injection
    for (const pattern of sqlInjectionPatterns) {
      if (pattern.test(input)) {
        return {
          isValid: false,
          error: 'Input contains potentially dangerous SQL patterns',
          riskLevel: 'critical'
        };
      }
    }

    // Check for XSS if HTML is not allowed
    if (!allowHtml) {
      for (const pattern of xssPatterns) {
        if (pattern.test(input)) {
          return {
            isValid: false,
            error: 'Input contains potentially dangerous script patterns',
            riskLevel: 'critical'
          };
        }
      }
    }

    // Sanitize the input
    let sanitizedInput = input;
    
    if (!allowHtml) {
      sanitizedInput = sanitizedInput
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/\\/g, '&#x5C;');
    }

    // Remove null bytes and other control characters
    sanitizedInput = sanitizedInput.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    return {
      isValid: true,
      riskLevel: 'low',
      sanitizedValue: sanitizedInput
    };
  }

  /**
   * File upload validation
   */
  static validateFileUpload(file: File): SecurityValidationResult {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    // Check file size
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size exceeds maximum allowed size of 10MB',
        riskLevel: 'medium'
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'File type not allowed',
        riskLevel: 'high'
      };
    }

    // Check filename for suspicious patterns
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|scr|vbs|js|jar|com|pif)$/i,
      /[<>:"|?*]/,
      /^\./,
      /\.\./
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(file.name)) {
        return {
          isValid: false,
          error: 'File name contains suspicious patterns',
          riskLevel: 'high'
        };
      }
    }

    return {
      isValid: true,
      riskLevel: 'low',
      sanitizedValue: file
    };
  }

  /**
   * Enhanced rate limiting with progressive delays
   */
  static checkRateLimit(
    key: string, 
    maxAttempts: number, 
    windowMs: number,
    progressiveDelay: boolean = true
  ): { allowed: boolean; remainingAttempts: number; resetTime: number } {
    const storageKey = `rate_limit_${key}`;
    const now = Date.now();
    
    let attempts: { count: number; firstAttempt: number; lastAttempt: number };
    try {
      const stored = localStorage.getItem(storageKey);
      attempts = stored ? JSON.parse(stored) : { 
        count: 0, 
        firstAttempt: now, 
        lastAttempt: now 
      };
    } catch {
      attempts = { count: 0, firstAttempt: now, lastAttempt: now };
    }

    // Reset if window expired
    if (now - attempts.firstAttempt > windowMs) {
      attempts = { count: 0, firstAttempt: now, lastAttempt: now };
    }

    // Progressive delay logic
    if (progressiveDelay && attempts.count > 0) {
      const timeSinceLastAttempt = now - attempts.lastAttempt;
      const requiredDelay = Math.min(1000 * Math.pow(2, attempts.count - 1), 30000); // Max 30 seconds
      
      if (timeSinceLastAttempt < requiredDelay) {
        return {
          allowed: false,
          remainingAttempts: Math.max(0, maxAttempts - attempts.count),
          resetTime: attempts.lastAttempt + requiredDelay
        };
      }
    }

    attempts.count++;
    attempts.lastAttempt = now;
    localStorage.setItem(storageKey, JSON.stringify(attempts));

    const allowed = attempts.count <= maxAttempts;
    
    if (!allowed) {
      this.logSecurityEvent('rate_limit_exceeded', 'authentication', undefined, {
        key,
        attempts: attempts.count,
        window: windowMs,
        progressiveDelay
      });
    }

    return {
      allowed,
      remainingAttempts: Math.max(0, maxAttempts - attempts.count),
      resetTime: attempts.firstAttempt + windowMs
    };
  }

  /**
   * Enhanced security event logging with categorization
   */
  static async logSecurityEvent(
    action: string,
    category: 'authentication' | 'authorization' | 'data_access' | 'system' = 'system',
    resourceId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const eventData = {
        action,
        resource_type: category,
        resource_id: resourceId,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          url: window.location.href,
          referrer: document.referrer || null
        }
      };

      await supabase.from('audit_logs').insert([eventData]);
      
      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[Security Event] ${action}:`, eventData);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Validate database operation parameters
   */
  static validateDatabaseParams(params: Record<string, any>): SecurityValidationResult {
    const errors: string[] = [];
    const sanitizedParams: Record<string, any> = {};

    for (const [key, value] of Object.entries(params)) {
      if (key.includes('id') && typeof value === 'string') {
        const uuidValidation = this.validateUUID(value);
        if (!uuidValidation.isValid) {
          errors.push(`Invalid ${key}: ${uuidValidation.error}`);
        } else {
          sanitizedParams[key] = uuidValidation.sanitizedValue;
        }
      } else if (key.includes('email') && typeof value === 'string') {
        const emailValidation = this.validateEmail(value);
        if (!emailValidation.isValid) {
          errors.push(`Invalid ${key}: ${emailValidation.error}`);
        } else {
          sanitizedParams[key] = emailValidation.sanitizedValue;
        }
      } else if (typeof value === 'string') {
        const inputValidation = this.validateAndSanitizeInput(value, 2000);
        if (!inputValidation.isValid) {
          errors.push(`Invalid ${key}: ${inputValidation.error}`);
        } else {
          sanitizedParams[key] = inputValidation.sanitizedValue;
        }
      } else {
        sanitizedParams[key] = value;
      }
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        error: errors.join('; '),
        riskLevel: 'high'
      };
    }

    return {
      isValid: true,
      riskLevel: 'low',
      sanitizedValue: sanitizedParams
    };
  }

  /**
   * Generate security alerts for monitoring
   */
  static generateSecurityAlert(
    type: SecurityAlert['type'],
    severity: SecurityAlert['severity'],
    message: string,
    metadata: Record<string, any> = {}
  ): SecurityAlert {
    return {
      id: crypto.randomUUID(),
      type,
      severity,
      message,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      timestamp: new Date()
    };
  }
}
