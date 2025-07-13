
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

const SettingsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Advanced Settings
        </CardTitle>
        <CardDescription>Configure system settings and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-8">
          <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Advanced settings panel coming soon...</p>
          <p className="text-sm">This will include system configuration, integrations, and preferences</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsTab;
