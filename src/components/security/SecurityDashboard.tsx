
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSecurityAudit } from '@/hooks/useSecurityAudit';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const SecurityDashboard: React.FC = () => {
  const { metrics, loading } = useSecurityAudit();

  const getSecurityScore = () => {
    const totalEvents = metrics.failedLoginAttempts + metrics.privilegeEscalationAttempts + metrics.suspiciousActivity;
    if (totalEvents === 0) return { score: 100, status: 'excellent' };
    if (totalEvents < 5) return { score: 85, status: 'good' };
    if (totalEvents < 15) return { score: 65, status: 'warning' };
    return { score: 30, status: 'critical' };
  };

  const securityScore = getSecurityScore();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Security Dashboard</h2>
      </div>

      {/* Security Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {securityScore.status === 'excellent' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : securityScore.status === 'critical' ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
            Security Score: {securityScore.score}/100
          </CardTitle>
          <CardDescription>
            Overall security health of your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          {securityScore.status === 'critical' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                High number of security events detected. Please review recent activity.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Security Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Login Attempts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.failedLoginAttempts}</div>
            <p className="text-xs text-muted-foreground">Last 50 events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Privilege Escalation</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.privilegeEscalationAttempts}</div>
            <p className="text-xs text-muted-foreground">Attempts blocked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.suspiciousActivity}</div>
            <p className="text-xs text-muted-foreground">Events flagged</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>Latest security-related activities</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.recentEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent security events</p>
          ) : (
            <div className="space-y-2">
              {metrics.recentEvents.slice(0, 10).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{event.action}</span>
                    {event.resourceType && (
                      <Badge variant="outline" className="text-xs">
                        {event.resourceType}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {event.createdAt.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
