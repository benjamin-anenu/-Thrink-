import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const DisabledRebaselineHistory: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rebaseline History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Rebaseline History feature is temporarily disabled</p>
            <p className="text-sm">This feature requires additional database setup</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DisabledRebaselineHistory;