
import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  event_type: 'login_attempt' | 'failed_login' | 'suspicious_activity' | 'rate_limit_exceeded' | 'invalid_input' | 'sql_injection_attempt' | 'xss_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
}

interface SecurityMetrics {
  failed_logins_last_hour: number;
  suspicious_activities_today: number;
  blocked_attacks_today: number;
  total_security_events: number;
}

export class SecurityMonitoringService {
  private static instance: SecurityMonitoringService;
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();
  private suspiciousIPs: Set<string> = new Set();

  private constructor() {}

  static getInstance(): SecurityMonitoringService {
    if (!SecurityMonitoringService.instance) {
      SecurityMonitoringService.instance = new SecurityMonitoringService();
    }
    return SecurityMonitoringService.instance;
  }

  // Log security events
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      const userId = user?.user?.id;

      // Enhanced event data
      const eventData = {
        user_id: event.user_id || userId,
        event_type: `security_${event.event_type}`,
        event_category: 'security',
        description: event.description,
        ip_address: event.ip_address,
        user_agent: event.user_agent,
        metadata: {
          severity: event.severity,
          timestamp: new Date().toISOString(),
          ...(event.metadata || {})
        }
      };

      // Log to compliance_logs table
      const { error } = await supabase
        .from('compliance_logs')
        .insert(eventData);

      if (error) {
        console.error('Failed to log security event:', error);
      }

      // For critical events, also log to console
      if (event.severity === 'critical') {
        console.warn(`[SECURITY CRITICAL] ${event.event_type}: ${event.description}`);
      }

      // Track suspicious activities
      if (event.ip_address && (event.severity === 'high' || event.severity === 'critical')) {
        this.markSuspiciousIP(event.ip_address);
      }

    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  // Check if IP is suspicious
  isSuspiciousIP(ip: string): boolean {
    return this.suspiciousIPs.has(ip);
  }

  // Mark IP as suspicious
  private markSuspiciousIP(ip: string): void {
    this.suspiciousIPs.add(ip);
    
    // Auto-remove after 1 hour
    setTimeout(() => {
      this.suspiciousIPs.delete(ip);
    }, 3600000);
  }

  // Rate limiting with security logging
  async checkRateLimit(
    identifier: string, 
    maxRequests: number = 30, 
    windowMs: number = 60000,
    action: string = 'general'
  ): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    const current = this.rateLimitStore.get(identifier);
    
    if (!current || current.resetTime < windowStart) {
      this.rateLimitStore.set(identifier, { count: 1, resetTime: now });
      return true;
    }
    
    if (current.count >= maxRequests) {
      // Log rate limit exceeded
      await this.logSecurityEvent({
        event_type: 'rate_limit_exceeded',
        severity: 'medium',
        description: `Rate limit exceeded for action: ${action}`,
        ip_address: identifier.startsWith('ip:') ? identifier.replace('ip:', '') : undefined,
        metadata: {
          action,
          max_requests: maxRequests,
          window_ms: windowMs,
          current_count: current.count
        }
      });
      
      return false;
    }
    
    current.count++;
    return true;
  }

  // Validate and sanitize user input
  validateInput(input: string, fieldName: string, maxLength: number = 1000): { 
    isValid: boolean; 
    sanitized: string; 
    threats: string[] 
  } {
    const threats: string[] = [];
    
    if (!input || typeof input !== 'string') {
      return { isValid: false, sanitized: '', threats: ['invalid_input_type'] };
    }

    // Check length
    if (input.length > maxLength) {
      threats.push('input_too_long');
    }

    // Check for XSS patterns
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        threats.push('xss_attempt');
        break;
      }
    }

    // Check for SQL injection patterns
    const sqlPatterns = [
      /\b(DROP|DELETE|UPDATE|INSERT|CREATE|ALTER|TRUNCATE|GRANT|REVOKE|EXECUTE|UNION|SCRIPT)\b/gi,
      /;\s*(DROP|DELETE|UPDATE|INSERT|CREATE|ALTER)/gi,
      /'\s*OR\s+.*?=.*?/gi,
      /\bUNION\s+SELECT\b/gi,
      /--.*$/gm
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        threats.push('sql_injection_attempt');
        break;
      }
    }

    // Sanitize input
    let sanitized = input.trim().substring(0, maxLength);
    
    // Remove dangerous HTML tags and attributes
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    sanitized = sanitized.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
    
    // Log threats if found
    if (threats.length > 0) {
      this.logSecurityEvent({
        event_type: threats.includes('xss_attempt') ? 'xss_attempt' : 
                   threats.includes('sql_injection_attempt') ? 'sql_injection_attempt' : 'invalid_input',
        severity: threats.length > 1 ? 'high' : 'medium',
        description: `Security threat detected in field '${fieldName}': ${threats.join(', ')}`,
        metadata: {
          field_name: fieldName,
          threats,
          original_input: input.substring(0, 100), // Only log first 100 chars
          input_length: input.length
        }
      });
    }

    return {
      isValid: threats.length === 0,
      sanitized,
      threats
    };
  }

  // Get security metrics for dashboard
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Failed logins in last hour
      const { data: failedLogins } = await supabase
        .from('compliance_logs')
        .select('id')
        .eq('event_type', 'security_failed_login')
        .gte('created_at', oneHourAgo.toISOString());

      // Suspicious activities today
      const { data: suspiciousActivities } = await supabase
        .from('compliance_logs')
        .select('id')
        .in('event_type', ['security_suspicious_activity', 'security_xss_attempt', 'security_sql_injection_attempt'])
        .gte('created_at', todayStart.toISOString());

      // Blocked attacks today
      const { data: blockedAttacks } = await supabase
        .from('compliance_logs')
        .select('id')
        .in('event_type', ['security_rate_limit_exceeded', 'security_xss_attempt', 'security_sql_injection_attempt'])
        .gte('created_at', todayStart.toISOString());

      // Total security events
      const { data: totalEvents } = await supabase
        .from('compliance_logs')
        .select('id')
        .like('event_type', 'security_%');

      return {
        failed_logins_last_hour: failedLogins?.length || 0,
        suspicious_activities_today: suspiciousActivities?.length || 0,
        blocked_attacks_today: blockedAttacks?.length || 0,
        total_security_events: totalEvents?.length || 0
      };

    } catch (error) {
      console.error('Error fetching security metrics:', error);
      return {
        failed_logins_last_hour: 0,
        suspicious_activities_today: 0,
        blocked_attacks_today: 0,
        total_security_events: 0
      };
    }
  }

  // Monitor for suspicious login patterns
  async monitorLoginAttempt(email: string, success: boolean, ip?: string, userAgent?: string): Promise<void> {
    const eventType = success ? 'login_attempt' : 'failed_login';
    const severity = success ? 'low' : 'medium';

    await this.logSecurityEvent({
      event_type: eventType,
      severity,
      description: `${success ? 'Successful' : 'Failed'} login attempt for ${email}`,
      ip_address: ip,
      user_agent: userAgent,
      metadata: {
        email,
        success,
        timestamp: new Date().toISOString()
      }
    });

    // Check for brute force attempts
    if (!success) {
      const recentFailures = await this.getRecentFailedLogins(email, 15); // Last 15 minutes
      if (recentFailures >= 5) {
        await this.logSecurityEvent({
          event_type: 'suspicious_activity',
          severity: 'high',
          description: `Potential brute force attack detected for email: ${email}`,
          ip_address: ip,
          metadata: {
            email,
            failed_attempts: recentFailures,
            time_window: '15_minutes'
          }
        });

        if (ip) {
          this.markSuspiciousIP(ip);
        }
      }
    }
  }

  // Get recent failed login count
  private async getRecentFailedLogins(email: string, minutesAgo: number): Promise<number> {
    try {
      const since = new Date(Date.now() - (minutesAgo * 60 * 1000));

      const { data } = await supabase
        .from('compliance_logs')
        .select('id')
        .eq('event_type', 'security_failed_login')
        .gte('created_at', since.toISOString())
        .contains('metadata', { email });

      return data?.length || 0;
    } catch (error) {
      console.error('Error counting failed logins:', error);
      return 0;
    }
  }

  // Clean up old security data (call periodically)
  async cleanup(): Promise<void> {
    try {
      // Clear old rate limit data
      const now = Date.now();
      for (const [key, value] of this.rateLimitStore.entries()) {
        if (value.resetTime < now - 3600000) { // 1 hour old
          this.rateLimitStore.delete(key);
        }
      }

      console.log('[Security] Cleanup completed');
    } catch (error) {
      console.error('Error during security cleanup:', error);
    }
  }
}

// Export singleton instance
export const securityMonitor = SecurityMonitoringService.getInstance();
