
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, AlertTriangle, CheckCircle, Clock, Settings, RefreshCw } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { escalationMonitoringService } from '@/services/EscalationMonitoringService';
import { toast } from 'sonner';

interface MonitoringStatus {
  isMonitoring: boolean;
  conditionsCount: number;
  lastCheck: Date | null;
}

const EscalationMonitoringDashboard: React.FC = () => {
  const [monitoringStatus, setMonitoringStatus] = useState<MonitoringStatus>({
    isMonitoring: false,
    conditionsCount: 0,
    lastCheck: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    if (currentWorkspace?.id) {
      loadMonitoringStatus();
    }
  }, [currentWorkspace?.id]);

  const loadMonitoringStatus = () => {
    const status = escalationMonitoringService.getMonitoringStatus();
    setMonitoringStatus(status);
  };

  const handleToggleMonitoring = async () => {
    if (!currentWorkspace?.id) return;

    setIsLoading(true);
    try {
      if (monitoringStatus.isMonitoring) {
        escalationMonitoringService.stopMonitoring();
        toast.success('Escalation monitoring stopped');
      } else {
        await escalationMonitoringService.initialize(currentWorkspace.id);
        toast.success('Escalation monitoring started');
      }
      loadMonitoringStatus();
    } catch (error) {
      console.error('Error toggling monitoring:', error);
      toast.error('Failed to toggle monitoring');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshConditions = async () => {
    if (!currentWorkspace?.id) return;

    setIsLoading(true);
    try {
      await escalationMonitoringService.refreshConditions(currentWorkspace.id);
      loadMonitoringStatus();
      toast.success('Conditions refreshed');
    } catch (error) {
      console.error('Error refreshing conditions:', error);
      toast.error('Failed to refresh conditions');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentWorkspace) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please select a workspace to configure escalation monitoring
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Monitoring Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitoring Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={monitoringStatus.isMonitoring}
                  onCheckedChange={handleToggleMonitoring}
                  disabled={isLoading}
                />
                <span className="text-sm font-medium">
                  {monitoringStatus.isMonitoring ? 'Active' : 'Inactive'}
                </span>
              </div>
              <Badge variant={monitoringStatus.isMonitoring ? 'default' : 'secondary'}>
                {monitoringStatus.isMonitoring ? 'Running' : 'Stopped'}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshConditions}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Monitoring Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Active Conditions</span>
            </div>
            <div className="text-2xl font-bold">{monitoringStatus.conditionsCount}</div>
            <p className="text-xs text-muted-foreground">
              Monitoring conditions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Last Check</span>
            </div>
            <div className="text-2xl font-bold">
              {monitoringStatus.lastCheck ? 
                new Date(monitoringStatus.lastCheck).toLocaleTimeString() : 
                'Never'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Last monitoring cycle
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">System Status</span>
            </div>
            <div className="text-2xl font-bold">Healthy</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monitoring Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Check Interval</div>
                <div className="text-sm text-muted-foreground">
                  How often to evaluate escalation conditions
                </div>
              </div>
              <Badge variant="outline">5 minutes</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Notification Cooldown</div>
                <div className="text-sm text-muted-foreground">
                  Minimum time between duplicate notifications
                </div>
              </div>
              <Badge variant="outline">1 hour</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Real-time Events</div>
                <div className="text-sm text-muted-foreground">
                  Immediate evaluation on project changes
                </div>
              </div>
              <Badge variant="default">Enabled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Escalation Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No recent escalation activity
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Escalation events will appear here when conditions are met
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EscalationMonitoringDashboard;
