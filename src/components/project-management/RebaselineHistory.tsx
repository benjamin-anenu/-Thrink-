import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface RebaselineHistoryProps {
  projectId: string;
}

// Disabled version of RebaselineHistory due to missing database table
const RebaselineHistory: React.FC<RebaselineHistoryProps> = ({ projectId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-warning" />
          Rebaseline History Unavailable
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Rebaseline history functionality is temporarily disabled due to missing database configuration.
          This feature will be available once the required database tables are created.
        </p>
      </CardContent>
    </Card>
  );
};

export default RebaselineHistory;