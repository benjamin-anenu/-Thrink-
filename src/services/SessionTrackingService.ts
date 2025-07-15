import { supabase } from '@/integrations/supabase/client';
import { UserSession, SessionTrackingData } from '@/types/enterprise';

export class SessionTrackingService {
  private static currentSessionId: string | null = null;

  static async trackSession(data: SessionTrackingData): Promise<UserSession> {
    const { data: result, error } = await supabase.rpc('track_user_session', {
      session_id_param: data.sessionId,
      workspace_id_param: data.workspaceId || null,
      ip_address_param: data.ipAddress || null,
      user_agent_param: data.userAgent || navigator.userAgent,
      device_info_param: data.deviceInfo || this.getDeviceInfo()
    });

    if (error) throw error;

    this.currentSessionId = data.sessionId;
    
    // Start periodic activity updates
    this.startActivityTracking();

    return result;
  }

  static async endSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('user_sessions')
      .update({
        is_active: false,
        ended_at: new Date().toISOString()
      })
      .eq('session_id', sessionId);

    if (error) throw error;

    this.currentSessionId = null;
    this.stopActivityTracking();
  }

  static async getUserSessions(userId?: string): Promise<UserSession[]> {
    let query = supabase
      .from('user_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async getWorkspaceSessions(workspaceId: string): Promise<UserSession[]> {
    const { data, error } = await supabase
      .from('user_sessions')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async updateActivity(): Promise<void> {
    if (!this.currentSessionId) return;

    const { error } = await supabase
      .from('user_sessions')
      .update({
        last_activity: new Date().toISOString()
      })
      .eq('session_id', this.currentSessionId);

    if (error) console.error('Failed to update session activity:', error);
  }

  private static activityInterval: NodeJS.Timeout | null = null;

  private static startActivityTracking(): void {
    this.stopActivityTracking();
    
    // Update activity every 5 minutes
    this.activityInterval = setInterval(() => {
      this.updateActivity();
    }, 5 * 60 * 1000);

    // Update on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.updateActivity();
      }
    });

    // Update on user interaction
    ['click', 'keypress', 'scroll'].forEach(event => {
      document.addEventListener(event, this.throttledActivityUpdate);
    });
  }

  private static stopActivityTracking(): void {
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
      this.activityInterval = null;
    }

    ['click', 'keypress', 'scroll'].forEach(event => {
      document.removeEventListener(event, this.throttledActivityUpdate);
    });
  }

  private static lastActivityUpdate = 0;
  private static throttledActivityUpdate = (): void => {
    const now = Date.now();
    if (now - SessionTrackingService.lastActivityUpdate > 60000) { // Throttle to once per minute
      SessionTrackingService.lastActivityUpdate = now;
      SessionTrackingService.updateActivity();
    }
  };

  private static getDeviceInfo(): Record<string, any> {
    return {
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      navigator: {
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  static generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}