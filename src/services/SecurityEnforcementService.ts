
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityEvent {
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata?: Record<string, any>;
}

interface SessionValidationResult {
  isValid: boolean;
  shouldRefresh: boolean;
  error?: string;
}

export class SecurityEnforcementService {
  private static instance: SecurityEnforcementService;
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private readonly SESSION_WARNING_THRESHOLD = 5 * 60 * 1000; // 5 minutes
  private loginAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private sessionWarningShown = false;

  static getInstance(): SecurityEnforcementService {
    if (!SecurityEnforcementService.instance) {
      SecurityEnforcementService.instance = new SecurityEnforcementService();
    }
    return SecurityEnforcementService.instance;
  }

  // Enhanced input validation with security focus
  validateAndSanitizeInput(
    input: string,
    type: 'text' | 'email' | 'password' | 'html' | 'sql' = 'text',
    maxLength = 1000
  ): { isValid: boolean; sanitized: string; errors: string[] } {
    const errors: string[] = [];
    
    if (!input || typeof input !== 'string') {
      return { isValid: false, sanitized: '', errors: ['Input must be a non-empty string'] };
    }

    // Length validation
    if (input.length > maxLength) {
      errors.push(`Input exceeds maximum length of ${maxLength} characters`);
    }

    let sanitized = input.trim();

    // Type-specific validation and sanitization
    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitized)) {
          errors.push('Invalid email format');
        }
        sanitized = sanitized.toLowerCase();
        break;

      case 'password':
        if (sanitized.length < 8) {
          errors.push('Password must be at least 8 characters long');
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(sanitized)) {
          errors.push('Password must contain uppercase, lowercase, number, and special character');
        }
        break;

      case 'html':
        // Remove potentially dangerous HTML content
        sanitized = sanitized
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/vbscript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
          .replace(/<object[^>]*>.*?<\/object>/gi, '')
          .replace(/<embed[^>]*>.*?<\/embed>/gi, '');
        break;

      case 'sql':
        // Enhanced SQL injection prevention
        const sqlDangerousPatterns = [
          /(\b(DROP|DELETE|UPDATE|INSERT|CREATE|ALTER|TRUNCATE|GRANT|REVOKE|EXECUTE|UNION|SCRIPT)\b)/gi,
          /(;\s*(DROP|DELETE|UPDATE|INSERT|CREATE|ALTER|TRUNCATE))/gi,
          /(\/\*.*?\*\/)/gi,
          /(--.*$)/gm,
          /(\bEXEC\b|\bSP_)/gi,
          /(javascript:|vbscript:|data:|file:)/gi
        ];
        
        for (const pattern of sqlDangerousPatterns) {
          if (pattern.test(sanitized)) {
            errors.push('Input contains potentially dangerous SQL content');
            this.logSecurityEvent({
              event_type: 'security_input_validation_failed',
              severity: 'high',
              description: 'SQL injection attempt detected',
              metadata: { input_preview: input.substring(0, 100), pattern: pattern.toString() }
            });
            break;
          }
        }
        break;

      default:
        // General text sanitization
        sanitized = sanitized
          .replace(/[<>]/g, '')
          .replace(/javascript:/gi, '')
          .replace(/vbscript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
    }

    // Check for common attack patterns
    const attackPatterns = [
      /%3C|%3E|%22|%27/, // URL encoded < > " '
      /\.\.\//g, // Path traversal
      /\0/, // Null bytes
      /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/ // Control characters
    ];

    for (const pattern of attackPatterns) {
      if (pattern.test(input)) {
        errors.push('Input contains potentially malicious content');
        this.logSecurityEvent({
          event_type: 'security_input_validation_failed',
          severity: 'medium',
          description: 'Malicious input pattern detected',
          metadata: { input_preview: input.substring(0, 100) }
        });
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    };
  }

  // Enhanced brute force protection
  checkLoginAttempts(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.loginAttempts.get(identifier);

    if (!attempts) {
      return true;
    }

    // Reset if lockout period has expired
    if (now - attempts.lastAttempt > this.LOCKOUT_DURATION) {
      this.loginAttempts.delete(identifier);
      return true;
    }

    if (attempts.count >= this.MAX_LOGIN_ATTEMPTS) {
      this.logSecurityEvent({
        event_type: 'security_brute_force_blocked',
        severity: 'high',
        description: 'Login attempt blocked due to too many failed attempts',
        metadata: { identifier, attempts: attempts.count, lockout_remaining: this.LOCKOUT_DURATION - (now - attempts.lastAttempt) }
      });
      return false;
    }

    return true;
  }

  recordFailedLogin(identifier: string): void {
    const now = Date.now();
    const attempts = this.loginAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
    
    attempts.count += 1;
    attempts.lastAttempt = now;
    
    this.loginAttempts.set(identifier, attempts);

    if (attempts.count >= this.MAX_LOGIN_ATTEMPTS) {
      this.logSecurityEvent({
        event_type: 'security_account_locked',
        severity: 'high',
        description: 'Account temporarily locked due to failed login attempts',
        metadata: { identifier, attempts: attempts.count }
      });
      
      toast.error(`Too many failed login attempts. Account locked for ${this.LOCKOUT_DURATION / 60000} minutes.`);
    }
  }

  recordSuccessfulLogin(identifier: string): void {
    this.loginAttempts.delete(identifier);
    this.logSecurityEvent({
      event_type: 'security_successful_login',
      severity: 'low',
      description: 'User successfully authenticated',
      metadata: { identifier }
    });
  }

  // Enhanced session validation
  async validateSession(): Promise<SessionValidationResult> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        this.logSecurityEvent({
          event_type: 'security_session_validation_error',
          severity: 'medium',
          description: 'Session validation failed',
          metadata: { error: error.message }
        });
        return { isValid: false, shouldRefresh: false, error: error.message };
      }

      if (!session) {
        return { isValid: false, shouldRefresh: false };
      }

      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at || 0;
      const timeUntilExpiry = expiresAt - now;

      // Warn user when session is about to expire
      if (timeUntilExpiry <= this.SESSION_WARNING_THRESHOLD / 1000 && !this.sessionWarningShown) {
        this.sessionWarningShown = true;
        toast.warning('Your session will expire soon. Please save your work.');
      }

      // Refresh session if it's close to expiry
      if (timeUntilExpiry <= 300) { // 5 minutes
        return { isValid: true, shouldRefresh: true };
      }

      return { isValid: true, shouldRefresh: false };
    } catch (error) {
      this.logSecurityEvent({
        event_type: 'security_session_validation_error',
        severity: 'medium',
        description: 'Session validation exception',
        metadata: { error: error.message }
      });
      return { isValid: false, shouldRefresh: false, error: error.message };
    }
  }

  // API key validation
  validateApiKey(key: string, keyType: 'openai' | 'openrouter'): boolean {
    if (!key || typeof key !== 'string') {
      return false;
    }

    const patterns = {
      openai: /^sk-[A-Za-z0-9]{48}$/,
      openrouter: /^sk-or-v1-[A-Za-z0-9-_]{64,}$/
    };

    const pattern = patterns[keyType];
    if (!pattern.test(key)) {
      this.logSecurityEvent({
        event_type: 'security_invalid_api_key',
        severity: 'medium',
        description: `Invalid ${keyType} API key format detected`,
        metadata: { keyType, keyPrefix: key.substring(0, 10) }
      });
      return false;
    }

    return true;
  }

  // Content Security Policy enforcement
  enforceCSP(): void {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
      "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' wss: https: https://hkitnfvgxkozfqfpjrcz.supabase.co https://openrouter.ai",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ');

    // Check if CSP meta tag exists
    let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]') as HTMLMetaElement;
    
    if (!cspMeta) {
      cspMeta = document.createElement('meta');
      cspMeta.httpEquiv = 'Content-Security-Policy';
      document.head.appendChild(cspMeta);
    }
    
    cspMeta.content = cspDirectives;
  }

  // Security headers enforcement (client-side checks)
  validateSecurityContext(): boolean {
    const issues: string[] = [];

    // Check HTTPS
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      issues.push('Application should be served over HTTPS');
    }

    // Check for secure context
    if (!window.isSecureContext && location.hostname !== 'localhost') {
      issues.push('Application not running in secure context');
    }

    // Check CSP
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!cspMeta) {
      issues.push('Content Security Policy not implemented');
    }

    if (issues.length > 0) {
      this.logSecurityEvent({
        event_type: 'security_context_warning',
        severity: 'medium',
        description: 'Security context validation found issues',
        metadata: { issues }
      });
      return false;
    }

    return true;
  }

  // Rate limiting for client operations
  private operationCounts: Map<string, { count: number; resetTime: number }> = new Map();

  checkRateLimit(operation: string, maxRequests = 10, windowMs = 60000): boolean {
    const now = Date.now();
    const key = `${operation}_${now - (now % windowMs)}`;
    const current = this.operationCounts.get(key) || { count: 0, resetTime: now + windowMs };

    if (now > current.resetTime) {
      // Reset window
      this.operationCounts.delete(key);
      this.operationCounts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (current.count >= maxRequests) {
      this.logSecurityEvent({
        event_type: 'security_rate_limit_exceeded',
        severity: 'medium',
        description: 'Client-side rate limit exceeded',
        metadata: { operation, count: current.count, maxRequests }
      });
      return false;
    }

    current.count++;
    this.operationCounts.set(key, current);
    return true;
  }

  // Enhanced security event logging
  private async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // Ensure user is authenticated before logging
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const logEntry = {
        user_id: session.user.id,
        event_type: event.event_type,
        event_category: 'security',
        description: event.description,
        metadata: {
          ...event.metadata,
          severity: event.severity,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          url: window.location.href,
          ip_address: await this.getClientIP()
        }
      };

      await supabase
        .from('compliance_logs')
        .insert(logEntry);

      // Show user notification for high/critical events
      if (event.severity === 'high' || event.severity === 'critical') {
        console.warn('[SECURITY EVENT]', event);
        
        if (event.severity === 'critical') {
          toast.error('Security alert: Suspicious activity detected. Please contact support if you did not initiate this action.');
        }
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  private async getClientIP(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json', { 
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      const data = await response.json();
      return data.ip || null;
    } catch {
      return null;
    }
  }

  // Initialize security enforcement
  initialize(): void {
    console.log('[Security] Initializing security enforcement service');
    
    // Enforce CSP
    this.enforceCSP();
    
    // Validate security context
    this.validateSecurityContext();
    
    // Set up periodic session validation
    setInterval(async () => {
      const result = await this.validateSession();
      if (result.shouldRefresh) {
        try {
          await supabase.auth.refreshSession();
          this.sessionWarningShown = false;
        } catch (error) {
          console.error('Failed to refresh session:', error);
        }
      }
    }, 60000); // Check every minute

    // Clean up old rate limit entries
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.operationCounts.entries()) {
        if (now > value.resetTime) {
          this.operationCounts.delete(key);
        }
      }
    }, 300000); // Clean up every 5 minutes

    this.logSecurityEvent({
      event_type: 'security_service_initialized',
      severity: 'low',
      description: 'Security enforcement service initialized successfully'
    });
  }

  // Cleanup method
  destroy(): void {
    this.loginAttempts.clear();
    this.operationCounts.clear();
  }
}

export const securityEnforcement = SecurityEnforcementService.getInstance();
