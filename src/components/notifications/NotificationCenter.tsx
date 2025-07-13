
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Mail, Settings, Clock, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface NotificationSettings {
  dailyNotifications: boolean;
  taskNotifications: boolean;
  projectNotifications: boolean;
  automatedReports: boolean;
  milestoneAlerts: boolean;
  delayWarnings: boolean;
}

interface EmailConfig {
  smtpHost: string;
  smtpPort: string;
  username: string;
  password: string;
  senderEmail: string;
  senderName: string;
}

interface NotificationHistory {
  id: string;
  type: string;
  recipient: string;
  subject: string;
  status: 'delivered' | 'failed' | 'pending';
  timestamp: string;
  retryCount: number;
}

const NotificationCenter: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    dailyNotifications: true,
    taskNotifications: true,
    projectNotifications: false,
    automatedReports: true,
    milestoneAlerts: true,
    delayWarnings: true
  });

  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    username: '',
    password: '',
    senderEmail: 'notifications@company.com',
    senderName: 'Project Management System'
  });

  const [isTestingEmail, setIsTestingEmail] = useState(false);

  const notificationHistory: NotificationHistory[] = [
    {
      id: '1',
      type: 'Daily Summary',
      recipient: 'john@company.com',
      subject: 'Daily Project Summary - March 15, 2024',
      status: 'delivered',
      timestamp: '2024-03-15T09:00:00Z',
      retryCount: 0
    },
    {
      id: '2',
      type: 'Task Reminder',
      recipient: 'alice@company.com',
      subject: 'Task Due Tomorrow: UI Design Review',
      status: 'failed',
      timestamp: '2024-03-15T14:30:00Z',
      retryCount: 2
    },
    {
      id: '3',
      type: 'Milestone Alert',
      recipient: 'sarah@company.com',
      subject: 'Milestone Completed: Beta Release',
      status: 'delivered',
      timestamp: '2024-03-15T16:45:00Z',
      retryCount: 0
    }
  ];

  const emailTemplates = [
    { id: 'daily-summary', name: 'Daily Summary', description: 'Morning project summary' },
    { id: 'evening-update', name: 'Evening Update', description: 'End of day progress update' },
    { id: 'task-reminder', name: 'Task Reminder', description: 'Upcoming task notifications' },
    { id: 'weekly-report', name: 'Weekly Report', description: 'Comprehensive weekly analysis' },
    { id: 'milestone-alert', name: 'Milestone Alert', description: 'Milestone completion notifications' },
    { id: 'delay-warning', name: 'Delay Warning', description: 'Potential delay notifications' }
  ];

  const handleSettingChange = (key: keyof NotificationSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEmailConfigChange = (key: keyof EmailConfig, value: string) => {
    setEmailConfig(prev => ({ ...prev, [key]: value }));
  };

  const testEmailConfig = async () => {
    setIsTestingEmail(true);
    // Simulate email test
    setTimeout(() => {
      setIsTestingEmail(false);
      // Would show actual test result
    }, 2000);
  };

  const retryFailedEmail = (id: string) => {
    console.log(`Retrying email ${id}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="email-config">Email Config</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">General Notifications</h4>
                  {Object.entries(settings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={key} className="text-sm">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                      <Switch
                        id={key}
                        checked={value}
                        onCheckedChange={() => handleSettingChange(key as keyof NotificationSettings)}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Blackout Periods</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Weekends</Label>
                      <Switch defaultChecked />
                    </div>
                    <div>
                      <Label className="text-sm">After Hours (6 PM - 8 AM)</Label>
                      <Switch defaultChecked />
                    </div>
                    <div>
                      <Label className="text-sm">Holidays</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email-config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">SMTP Settings</h4>
                  <div className="space-y-3">
                    <div>
                      <Label>SMTP Host</Label>
                      <Input
                        value={emailConfig.smtpHost}
                        onChange={(e) => handleEmailConfigChange('smtpHost', e.target.value)}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div>
                      <Label>SMTP Port</Label>
                      <Input
                        value={emailConfig.smtpPort}
                        onChange={(e) => handleEmailConfigChange('smtpPort', e.target.value)}
                        placeholder="587"
                      />
                    </div>
                    <div>
                      <Label>Username</Label>
                      <Input
                        value={emailConfig.username}
                        onChange={(e) => handleEmailConfigChange('username', e.target.value)}
                        placeholder="your-email@gmail.com"
                      />
                    </div>
                    <div>
                      <Label>Password</Label>
                      <Input
                        type="password"
                        value={emailConfig.password}
                        onChange={(e) => handleEmailConfigChange('password', e.target.value)}
                        placeholder="your-app-password"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Sender Information</h4>
                  <div className="space-y-3">
                    <div>
                      <Label>Sender Email</Label>
                      <Input
                        value={emailConfig.senderEmail}
                        onChange={(e) => handleEmailConfigChange('senderEmail', e.target.value)}
                        placeholder="notifications@company.com"
                      />
                    </div>
                    <div>
                      <Label>Sender Name</Label>
                      <Input
                        value={emailConfig.senderName}
                        onChange={(e) => handleEmailConfigChange('senderName', e.target.value)}
                        placeholder="Project Management System"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={testEmailConfig}
                    disabled={isTestingEmail}
                    className="w-full mt-4"
                  >
                    {isTestingEmail ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      'Test Configuration'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {emailTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <Button variant="outline" size="sm" className="w-full">
                          Edit Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationHistory.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(notification.status)}
                      <div>
                        <div className="font-medium">{notification.subject}</div>
                        <div className="text-sm text-muted-foreground">
                          To: {notification.recipient} • {new Date(notification.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={notification.status === 'delivered' ? 'default' : 'destructive'}>
                        {notification.status}
                      </Badge>
                      {notification.status === 'failed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retryFailedEmail(notification.id)}
                        >
                          <RefreshCw className="mr-1 h-3 w-3" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationCenter;
