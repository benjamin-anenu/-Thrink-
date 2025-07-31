
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Activity, 
  Lock, 
  TrendingUp,
  RefreshCw,
  Download
} from 'lucide-react';
import { securityMonitor } from '@/services/SecurityMonitoringService';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface SecurityMetrics {
  failed_logins_last_hour: number;
  suspicious_activities_today: number;
  blocked_attacks_today: number;
  total_security_events: number;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  description: string;
  created_at: string;
  metadata: any;
  ip_address?: string;
}

const SecurityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    failed_logins_last_hour: 0,
    suspicious_activities_today: 0,
    blocked_attacks_today: 0,
    total_security_events: 0
  });
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSecurityData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      setRefreshing(true);
      
      // Load metrics
      const metricsData = await securityMonitor.getSecurityMetrics();
      setMetrics(metricsData);

      // Load recent security events
      const { data: events, error } = await supabase
        .from('compliance_logs')
        .select('*')
        .like('event_type', 'security_%')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && events) {
        setRecentEvents(events);
      }

    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getSeverityColor = (eventType: string): string => {
    if (eventType.includes('critical') || eventType.includes('sql_injection') || eventType.includes('xss')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (eventType.includes('suspicious') || eventType.includes('failed_login')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    if (eventType.includes('rate_limit') || eventType.includes('invalid_input')) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('login')) return <Lock className="h-4 w-4" />;
    if (eventType.includes('suspicious') || eventType.includes('attack')) return <AlertTriangle className="h-4 w-4" />;
    if (eventType.includes('rate_limit')) return <Activity className="h-4 w-4" />;
    return <Eye className="h-4 w-4" />;
  };

  const exportSecurityData = async () => {
    try {
      const { data: allEvents } = await supabase
        .from('compliance_logs')
        .select('*')
        .like('event_type', 'security_%')
        .order('created_at', { ascending: false });

      if (allEvents) {
        const csv = [
          'Date,Event Type,Description,IP Address,Severity',
          ...allEvents.map(event => [
            format(new Date(event.created_at), 'yyyy-MM-dd HH:mm:ss'),
            event.event_type,
            event.description.replace(/,/g, ';'),
            event.ip_address || 'N/A',
            event.metadata?.severity || 'unknown'
          ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-events-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting security data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading security dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Security Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={loadSecurityData}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            onClick={exportSecurityData}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Security Alert */}
      {(metrics.suspicious_activities_today > 5 || metrics.failed_logins_last_hour > 10) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Security Alert:</strong> High number of security events detected today. 
            Please review the activity below and take appropriate action if necessary.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Failed Logins</CardTitle>
            <Lock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{metrics.failed_logins_last_hour}</div>
            <p className="text-xs text-red-700">Last hour</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Suspicious Activities</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{metrics.suspicious_activities_today}</div>
            <p className="text-xs text-yellow-700">Today</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Blocked Attacks</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.blocked_attacks_today}</div>
            <p className="text-xs text-blue-700">Today</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Events</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{metrics.total_security_events}</div>
            <p className="text-xs text-green-700">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No security events recorded</p>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0 mt-1">
                    {getEventIcon(event.event_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getSeverityColor(event.event_type)}>
                            {event.event_type.replace('security_', '')}
                          </Badge>
                          {event.ip_address && (
                            <span className="text-xs text-gray-500">
                              IP: {event.ip_address}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {format(new Date(event.created_at), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium text-blue-900">Regular Security Reviews</h4>
                <p className="text-sm text-blue-800">Review security events weekly and investigate any suspicious patterns.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Lock className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <h4 className="font-medium text-green-900">Multi-Factor Authentication</h4>
                <p className="text-sm text-green-800">Encourage users to enable MFA for additional account security.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-1" />
              <div>
                <h4 className="font-medium text-yellow-900">Monitor Failed Logins</h4>
                <p className="text-sm text-yellow-800">High numbers of failed logins may indicate brute force attacks.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;
