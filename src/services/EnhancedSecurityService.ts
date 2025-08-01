
import { supabase } from '@/integrations/supabase/client';
import { securityMonitor } from './SecurityMonitoringService';
import { securityEnforcement } from './SecurityEnforcementService';

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

  // Initialize comprehensive security monitoring with enhanced validation
  private initializeSecurityMonitoring(): void {
    // Initialize security enforcement first
    securityEnforcement.initialize();
    
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
    }, 60000);
  }

  private async validateActiveSession(): Promise<void> {
    try {
      const result = await securityEnforcement.validateSession();
      
      if (!result.isValid) {
        await this.handleSessionTimeout();
        return;
      }

      if (result.shouldRefresh) {
        try {
          await supabase.auth.refreshSession();
        } catch (error) {
          console.error('[Security] Session refresh failed:', error);
          await this.handleSessionTimeout();
        }
      }

    } catch (error) {
      console.error('[Security] Session validation error:', error);
    }
  }

  private async handleSessionTimeout(): Promise<void> {
    console.warn('[Security] Session timed out due to inactivity');
    
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

    await supabase.auth.signOut();
    window.location.href = '/auth';
  }

  // Enhanced session creation with additional security
  async createSecureSession(workspaceId: string, options: SecureSessionOptions = {}): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      // Validate workspace ID format
      const workspaceValidation = securityEnforcement.validateAndSanitizeInput(workspaceId, 'text', 36);
      if (!workspaceValidation.isValid) {
        throw new Error('Invalid workspace ID format');
      }

      const deviceFingerprint = options.deviceFingerprint || this.generateDeviceFingerprint();
      
      // Enhanced session tracking with security validation
      const { error } = await supabase.rpc('track_user_session', {
        session_id_param: session.access_token.substring(0, 32),
        workspace_id_param: workspaceValidation.sanitized,
        ip_address_param: options.ipAddress,
        user_agent_param: options.userAgent,
        device_info_param: {
          device_fingerprint: deviceFingerprint,
          workspace_id: workspaceValidation.sanitized,
          security_context: {
            secure_context: window.isSecureContext,
            protocol: window.location.protocol,
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) {
        console.error('[Security] Failed to create secure session:', error);
        throw error;
      }

    } catch (error: any) {
      console.error('[Security] Session creation error:', error);
      await securityMonitor.logSecurityEvent({
        event_type: 'suspicious_activity',
        severity: 'medium',
        description: 'Failed to create secure session',
        metadata: { error: error.message, workspace_id: workspaceId }
      });
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
      // Validate session ID
      const sessionValidation = securityEnforcement.validateAndSanitizeInput(sessionId, 'text', 36);
      if (!sessionValidation.isValid) {
        throw new Error('Invalid session ID format');
      }

      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionValidation.sanitized);

      if (!error) {
        await securityMonitor.logSecurityEvent({
          event_type: 'suspicious_activity',
          severity: 'low',
          description: 'User terminated an active session',
          metadata: { 
            session_id: sessionValidation.sanitized,
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

  // Enhanced threat detection with security enforcement integration
  private setupThreatDetection(): void {
    // Monitor for rapid form submissions with enhanced detection
    let formSubmissionCount = 0;
    let formSubmissionWindow = Date.now();

    const originalSubmit = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = function() {
      const now = Date.now();
      
      if (now - formSubmissionWindow > 60000) {
        formSubmissionCount = 0;
        formSubmissionWindow = now;
      }
      
      formSubmissionCount++;
      
      if (formSubmissionCount > 10) {
        securityMonitor.logSecurityEvent({
          event_type: 'suspicious_activity',
          severity: 'high',
          description: 'Rapid form submission detected - possible bot activity',
          metadata: {
            submission_count: formSubmissionCount,
            time_window: '1_minute',
            form_action: this.action,
            form_method: this.method
          }
        });
      }
      
      return originalSubmit.call(this);
    };

    // Enhanced URL monitoring with input validation
    const originalPushState = history.pushState;
    history.pushState = function(data, title, url) {
      if (url && typeof url === 'string') {
        const urlValidation = securityEnforcement.validateAndSanitizeInput(url, 'text', 2000);
        
        if (!urlValidation.isValid || 
            url.includes('../') || 
            url.includes('..\\') || 
            url.includes('%2e%2e')) {
          
          securityMonitor.logSecurityEvent({
            event_type: 'suspicious_activity',
            severity: 'high',
            description: 'Path traversal attempt detected in URL',
            metadata: { 
              attempted_url: url,
              validation_errors: urlValidation.errors
            }
          });
        }
      }
      
      return originalPushState.call(this, data, title, url);
    };
  }

  // Enhanced input sanitization using security enforcement
  sanitizeInput(input: string, context: 'html' | 'text' | 'email' | 'url' = 'text'): string {
    const validation = securityEnforcement.validateAndSanitizeInput(input, context === 'html' ? 'html' : 'text');
    return validation.sanitized;
  }

  // Validate Content Security Policy compliance
  validateCSPCompliance(): boolean {
    return securityEnforcement.validateSecurityContext();
  }

  // Cleanup on service destruction
  destroy(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
    securityEnforcement.destroy();
  }
}

export const enhancedSecurity = EnhancedSecurityService.getInstance();
