
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface NotificationSettingsState {
  email: boolean;
  push: boolean;
  slack: boolean;
  deadlines: boolean;
  teamUpdates: boolean;
  projectMilestones: boolean;
  systemAlerts: boolean;
}

interface NotificationSettingsProps {
  settings: NotificationSettingsState;
  onSettingChange: (key: keyof NotificationSettingsState, value: boolean) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  onSettingChange
}) => {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Configure how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium">Delivery Methods</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Switch
                id="email-notifications"
                checked={settings.email}
                onCheckedChange={(checked) => onSettingChange('email', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <Switch
                id="push-notifications"
                checked={settings.push}
                onCheckedChange={(checked) => onSettingChange('push', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="slack-notifications">Slack Integration</Label>
              <Switch
                id="slack-notifications"
                checked={settings.slack}
                onCheckedChange={(checked) => onSettingChange('slack', checked)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Notification Types</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="deadline-notifications">Project Deadlines</Label>
              <Switch
                id="deadline-notifications"
                checked={settings.deadlines}
                onCheckedChange={(checked) => onSettingChange('deadlines', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="team-notifications">Team Updates</Label>
              <Switch
                id="team-notifications"
                checked={settings.teamUpdates}
                onCheckedChange={(checked) => onSettingChange('teamUpdates', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="milestone-notifications">Project Milestones</Label>
              <Switch
                id="milestone-notifications"
                checked={settings.projectMilestones}
                onCheckedChange={(checked) => onSettingChange('projectMilestones', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="system-notifications">System Alerts</Label>
              <Switch
                id="system-notifications"
                checked={settings.systemAlerts}
                onCheckedChange={(checked) => onSettingChange('systemAlerts', checked)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
