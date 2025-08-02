
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useResources } from '@/hooks/useResources';

const ResourceStats = () => {
  const { resources } = useResources();

  // Calculate real metrics from context data
  const totalResources = resources.length;
  const availableResources = resources.filter(r => r.status === 'Available').length;
  const busyResources = resources.filter(r => r.status === 'Busy').length;
  const overallocatedResources = resources.filter(r => r.status === 'Overallocated').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{totalResources}</div>
          <p className="text-xs text-muted-foreground">Total Resources</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-green-500">{availableResources}</div>
          <p className="text-xs text-muted-foreground">Available</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-yellow-500">{busyResources}</div>
          <p className="text-xs text-muted-foreground">Busy</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-red-500">{overallocatedResources}</div>
          <p className="text-xs text-muted-foreground">Overallocated</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceStats;
