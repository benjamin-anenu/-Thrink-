import { supabase } from '@/integrations/supabase/client';
import { securityMonitor } from './SecurityMonitoringService';

interface SecureSessionOptions {
  deviceFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface SessionInfo {
  id: string;
  createdAt: string;
  expiresAt: string;
  deviceInfo: any;
  isActive: boolean;
}

export class EnhancedSecurityService {
  private static instance: EnhancedSecurityService;
  private sessionCheckInterval?: NodeJS.Timeout;
  private lastActivityTime: Date = new Date();

  private constructor() {
    this.initializeSecurityMonitoring();
  }

  static getInstance(): EnhancedSecurityService {
    if (!EnhancedSecurityService.instance) {
      EnhancedSecurityService.instance = new EnhancedSecurityService();
    }
    return EnhancedSecurityService.instance;
  }

  // Initialize comprehensive security monitoring
  private initializeSecurityMonitoring(): void {
    // Track user activity for session timeout
    this.setupActivityTracking();
    
    // Start session validation checks
    this.startSessionValidation();
    
    // Monitor for suspicious patterns
    this.setupThreatDetection();
    
    console.log('[Security] Enhanced security monitoring initialized');
  }

  // Activity tracking for session timeout
  private setupActivityTracking(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => {
      this.lastActivityTime = new Date();
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });
  }

  // Session validation and timeout management
  private startSessionValidation(): void {
    this.sessionCheckInterval = setInterval(async () => {
      await this.validateActiveSession();
    }, 60000); // Check every minute
  }

  private async validateActiveSession(): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const now = new Date();
      const timeSinceActivity = now.getTime() - this.lastActivityTime.getTime();
      const thirtyMinutes = 30 * 60 * 1000;

      // Check for session timeout
      if (timeSinceActivity > thirtyMinutes) {
        await this.handleSessionTimeout();
        return;
      }

      // Refresh session if it's close to expiry
      const sessionExpiry = new Date(session.expires_at! * 1000);
      const fiveMinutes = 5 * 60 * 1000;
      
      if (sessionExpiry.getTime() - now.getTime() < fiveMinutes) {
        await supabase.auth.refreshSession();
      }

    } catch (error) {
      console.error('[Security] Session validation error:', error);
    }
  }

  private async handleSessionTimeout(): Promise<void> {
    console.warn('[Security] Session timed out due to inactivity');
    
    // Log the timeout using valid event type
    await securityMonitor.logSecurityEvent({
      event_type: 'suspicious_activity',
      severity: 'medium',
      description: 'User session timed out due to inactivity',
      metadata: {
        last_activity: this.lastActivityTime.toISOString(),
        timeout_duration: '30_minutes',
        reason: 'session_timeout'
      }
    });

    // Sign out the user
    await supabase.auth.signOut();
    
    // Redirect to login
    window.location.href = '/auth';
  }

  // Create secure session with device tracking
  async createSecureSession(workspaceId: string, options: SecureSessionOptions = {}): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const deviceFingerprint = options.deviceFingerprint || this.generateDeviceFingerprint();
      
      // Use existing RPC function with correct parameter structure
      const { error } = await supabase.rpc('track_user_session', {
        session_id_param: session.access_token.substring(0, 32),
        workspace_id_param: workspaceId,
        ip_address_param: options.ipAddress,
        user_agent_param: options.userAgent,
        device_info_param: {
          device_fingerprint: deviceFingerprint,
          workspace_id: workspaceId
        }
      });

      if (error) {
        console.error('[Security] Failed to create secure session:', error);
      }

    } catch (error) {
      console.error('[Security] Session creation error:', error);
    }
  }

  // Generate device fingerprint for tracking
  private generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('fingerprint', 10, 10);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return btoa(fingerprint).substring(0, 32);
  }

  // Get active sessions for user
  async getActiveSessions(): Promise<SessionInfo[]> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(session => ({
        id: session.id,
        createdAt: session.created_at,
        expiresAt: session.expires_at,
        deviceInfo: session.device_info,
        isActive: true
      })) || [];

    } catch (error) {
      console.error('[Security] Failed to fetch active sessions:', error);
      return [];
    }
  }

  // Terminate specific session
  async terminateSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId);

      if (!error) {
        await securityMonitor.logSecurityEvent({
          event_type: 'suspicious_activity',
          severity: 'low',
          description: 'User terminated an active session',
          metadata: { 
            session_id: sessionId,
            action: 'session_terminated'
          }
        });
      }

      return !error;
    } catch (error) {
      console.error('[Security] Failed to terminate session:', error);
      return false;
    }
  }

  // Terminate all other sessions
  async terminateAllOtherSessions(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const currentSessionToken = session.access_token.substring(0, 32);
      
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .neq('session_id', currentSessionToken)
        .eq('user_id', session.user.id);

      if (!error) {
        await securityMonitor.logSecurityEvent({
          event_type: 'suspicious_activity',
          severity: 'medium',
          description: 'User terminated all other active sessions',
          metadata: { 
            action: 'bulk_session_termination'
          }
        });
      }

      return !error;
    } catch (error) {
      console.error('[Security] Failed to terminate other sessions:', error);
      return false;
    }
  }

  // Setup threat detection patterns
  private setupThreatDetection(): void {
    // Monitor for rapid form submissions (potential bot activity)
    let formSubmissionCount = 0;
    let formSubmissionWindow = Date.now();

    const originalSubmit = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = function() {
      const now = Date.now();
      
      // Reset counter every minute
      if (now - formSubmissionWindow > 60000) {
        formSubmissionCount = 0;
        formSubmissionWindow = now;
      }
      
      formSubmissionCount++;
      
      // Flag suspicious activity
      if (formSubmissionCount > 10) {
        securityMonitor.logSecurityEvent({
          event_type: 'suspicious_activity',
          severity: 'high',
          description: 'Rapid form submission detected - possible bot activity',
          metadata: {
            submission_count: formSubmissionCount,
            time_window: '1_minute'
          }
        });
      }
      
      return originalSubmit.call(this);
    };

    // Monitor for suspicious URL patterns
    const originalPushState = history.pushState;
    history.pushState = function(data, title, url) {
      if (url && typeof url === 'string') {
        if (url.includes('../') || url.includes('..\\') || url.includes('%2e%2e')) {
          securityMonitor.logSecurityEvent({
            event_type: 'suspicious_activity',
            severity: 'high',
            description: 'Path traversal attempt detected in URL',
            metadata: { attempted_url: url }
          });
        }
      }
      
      return originalPushState.call(this, data, title, url);
    };
  }

  // Enhanced input sanitization
  sanitizeInput(input: string, context: 'html' | 'text' | 'email' | 'url' = 'text'): string {
    if (!input || typeof input !== 'string') return '';

    let sanitized = input.trim();

    switch (context) {
      case 'html':
        // Remove script tags and event handlers
        sanitized = sanitized
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
        break;

      case 'email':
        // Basic email validation and sanitization
        sanitized = sanitized.replace(/[<>]/g, '');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) {
          return '';
        }
        break;

      case 'url':
        // URL sanitization
        try {
          const url = new URL(sanitized);
          if (!['http:', 'https:'].includes(url.protocol)) {
            return '';
          }
          sanitized = url.toString();
        } catch {
          return '';
        }
        break;

      default:
        // Text sanitization
        sanitized = sanitized
          .replace(/[<>]/g, '')
          .replace(/javascript:/gi, '')
          .substring(0, 1000); // Limit length
    }

    return sanitized;
  }

  // Validate Content Security Policy compliance
  validateCSPCompliance(): boolean {
    const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    
    if (!meta) {
      console.warn('[Security] Content Security Policy not found');
      return false;
    }

    const csp = meta.getAttribute('content');
    const requiredDirectives = [
      'default-src',
      'script-src',
      'style-src',
      'img-src',
      'connect-src',
      'frame-ancestors'
    ];

    const hasRequired = requiredDirectives.every(directive => 
      csp?.includes(directive)
    );

    if (!hasRequired) {
      console.warn('[Security] CSP missing required directives');
    }

    return hasRequired;
  }

  // Cleanup on service destruction
  destroy(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
  }
}

// Export singleton instance
export const enhancedSecurity = EnhancedSecurityService.getInstance();
