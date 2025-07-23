
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, Mail, MessageSquare, Smartphone, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { EventBus } from '@/services/EventBus';
import { toast } from 'sonner';

interface NotificationChannel {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  description: string;
}

interface EscalationNotification {
  id: string;
  type: string;
  projectName: string;
  triggerName: string;
  levelName: string;
  stakeholderName: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'failed';
}

const EscalationNotificationService: React.FC = () => {
  const [notifications, setNotifications] = useState<EscalationNotification[]>([]);
  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      enabled: true,
      description: 'Send escalation notifications via email'
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: Smartphone,
      enabled: false,
      description: 'Send urgent escalations via SMS'
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: MessageSquare,
      enabled: false,
      description: 'Post escalations to Slack channels'
    },
    {
      id: 'webhook',
      name: 'Webhook',
      icon: Bell,
      enabled: false,
      description: 'Send escalations to custom webhook URLs'
    }
  ]);

  const { currentWorkspace } = useWorkspace();
  const eventBus = EventBus.getInstance();

  useEffect(() => {
    // Listen for escalation notifications
    const unsubscribe = eventBus.subscribe('escalation_notification', (event) => {
      handleEscalationNotification(event.payload);
    });

    return unsubscribe;
  }, []);

  const handleEscalationNotification = (payload: any) => {
    const notification: EscalationNotification = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: payload.type,
      projectName: payload.projectName,
      triggerName: payload.triggerName,
      levelName: payload.levelName,
      stakeholderName: payload.stakeholderName,
      timestamp: new Date(),
      status: 'sent'
    };

    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    
    // Process notification through enabled channels
    processNotification(notification, payload);
  };

  const processNotification = async (notification: EscalationNotification, payload: any) => {
    const enabledChannels = channels.filter(c => c.enabled);
    
    for (const channel of enabledChannels) {
      try {
        await sendNotificationViaChannel(channel, notification, payload);
      } catch (error) {
        console.error(`Failed to send notification via ${channel.name}:`, error);
        toast.error(`Failed to send ${channel.name} notification`);
      }
    }
  };

  const sendNotificationViaChannel = async (
    channel: NotificationChannel,
    notification: EscalationNotification,
    payload: any
  ) => {
    switch (channel.id) {
      case 'email':
        await sendEmailNotification(notification, payload);
        break;
      case 'sms':
        await sendSMSNotification(notification, payload);
        break;
      case 'slack':
        await sendSlackNotification(notification, payload);
        break;
      case 'webhook':
        await sendWebhookNotification(notification, payload);
        break;
    }
  };

  const sendEmailNotification = async (notification: EscalationNotification, payload: any) => {
    // This would integrate with the email service
    console.log('Sending email notification:', notification);
    // Implementation would use supabase.functions.invoke('send-escalation-email', {...})
  };

  const sendSMSNotification = async (notification: EscalationNotification, payload: any) => {
    // This would integrate with an SMS service
    console.log('Sending SMS notification:', notification);
  };

  const sendSlackNotification = async (notification: EscalationNotification, payload: any) => {
    // This would integrate with Slack API
    console.log('Sending Slack notification:', notification);
  };

  const sendWebhookNotification = async (notification: EscalationNotification, payload: any) => {
    // This would send to custom webhook URLs
    console.log('Sending webhook notification:', notification);
  };

  const toggleChannel = (channelId: string) => {
    setChannels(prev => prev.map(channel => 
      channel.id === channelId 
        ? { ...channel, enabled: !channel.enabled }
        : channel
    ));
    
    toast.success(`Notification channel ${channelId} ${channels.find(c => c.id === channelId)?.enabled ? 'disabled' : 'enabled'}`);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'sent': return 'default';
      case 'delivered': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  if (!currentWorkspace) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please select a workspace to configure escalation notifications
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {channels.map((channel) => {
              const IconComponent = channel.icon;
              return (
                <div key={channel.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{channel.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {channel.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={channel.enabled ? 'default' : 'secondary'}>
                      {channel.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Switch
                      checked={channel.enabled}
                      onCheckedChange={() => toggleChannel(channel.id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No notifications sent yet
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Escalation notifications will appear here when sent
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <div>
                      <div className="font-medium">
                        {notification.triggerName} - {notification.projectName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Sent to {notification.stakeholderName} ({notification.levelName})
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(notification.status)}>
                      {notification.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {notification.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Quiet Hours</div>
                <div className="text-sm text-muted-foreground">
                  Suppress non-critical notifications during specified hours
                </div>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Escalation Delays</div>
                <div className="text-sm text-muted-foreground">
                  Configure time delays between escalation levels
                </div>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Acknowledgment Tracking</div>
                <div className="text-sm text-muted-foreground">
                  Track when stakeholders acknowledge escalations
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EscalationNotificationService;
