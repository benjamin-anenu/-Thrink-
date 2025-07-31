
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSecureSession } from '@/hooks/useSecureSession';
import { Smartphone, Monitor, Tablet, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const SessionManagement: React.FC = () => {
  const { 
    activeSessions, 
    loading, 
    terminateSession, 
    terminateAllOtherSessions,
    refreshSessions 
  } = useSecureSession();

  const getDeviceIcon = (deviceInfo: any) => {
    const userAgent = deviceInfo?.fingerprint || '';
    if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
      return <Smartphone className="h-4 w-4" />;
    }
    if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      return <Tablet className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const handleTerminateSession = async (sessionId: string) => {
    if (await terminateSession(sessionId)) {
      toast.success('Session terminated successfully');
    } else {
      toast.error('Failed to terminate session');
    }
  };

  const handleTerminateAllOthers = async () => {
    if (await terminateAllOtherSessions()) {
      toast.success('All other sessions terminated');
    } else {
      toast.error('Failed to terminate sessions');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Active Sessions</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshSessions}
          >
            Refresh
          </Button>
          {activeSessions.length > 1 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleTerminateAllOthers}
            >
              Terminate All Others
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeSessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No active sessions found
            </p>
          ) : (
            activeSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getDeviceIcon(session.deviceInfo)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {session.deviceInfo?.fingerprint ? 'Recognized Device' : 'Unknown Device'}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created: {format(new Date(session.createdAt), 'MMM d, HH:mm')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Expires: {format(new Date(session.expiresAt), 'MMM d, HH:mm')}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTerminateSession(session.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
