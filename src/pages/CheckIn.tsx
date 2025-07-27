import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

// Disabled version of CheckIn due to missing database table
const CheckIn: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Feature Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The daily check-in functionality is temporarily disabled due to missing database configuration.
            This feature will be available once the required database tables are created.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckIn;