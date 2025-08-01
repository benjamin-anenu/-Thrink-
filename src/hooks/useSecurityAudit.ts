
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SecurityEvent {
  id: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: any;
  createdAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

interface SecurityMetrics {
  failedLoginAttempts: number;
  privilegeEscalationAttempts: number;
  suspiciousActivity: number;
  recentEvents: SecurityEvent[];
}

export const useSecurityAudit = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    failedLoginAttempts: 0,
    privilegeEscalationAttempts: 0,
    suspiciousActivity: 0,
    recentEvents: []
  });
  const [loading, setLoading] = useState(false);

  const fetchSecurityMetrics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch recent audit logs
      const { data: auditLogs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const events: SecurityEvent[] = (auditLogs || []).map(log => ({
        id: log.id,
        action: log.action,
        resourceType: log.resource_type,
        resourceId: log.resource_id,
        metadata: log.metadata,
        createdAt: new Date(log.created_at),
        ipAddress: log.ip_address || undefined, // Fix type mismatch
        userAgent: log.user_agent || undefined
      }));

      // Calculate metrics
      const failedLoginAttempts = events.filter(e => 
        e.action.includes('login_failed') || 
        e.action.includes('authentication_failed')
      ).length;

      const privilegeEscalationAttempts = events.filter(e =>
        e.action.includes('role_change_attempt') ||
        e.action.includes('unauthorized_access')
      ).length;

      const suspiciousActivity = events.filter(e =>
        e.action.includes('suspicious') ||
        e.action.includes('blocked') ||
        e.action.includes('violation')
      ).length;

      setMetrics({
        failedLoginAttempts,
        privilegeEscalationAttempts,
        suspiciousActivity,
        recentEvents: events.slice(0, 20)
      });
    } catch (error) {
      console.error('Error fetching security metrics:', error);
      toast.error('Failed to load security metrics');
    } finally {
      setLoading(false);
    }
  };

  const logSecurityEvent = async (action: string, metadata?: any) => {
    if (!user) return;

    try {
      await supabase
        .from('audit_logs')
        .insert([{
          user_id: user.id,
          action,
          metadata: metadata || {},
          ip_address: null, // Client-side IP detection would require additional setup
          user_agent: navigator.userAgent
        }]);
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSecurityMetrics();
    }
  }, [user]);

  return {
    metrics,
    loading,
    refreshMetrics: fetchSecurityMetrics,
    logSecurityEvent
  };
};
