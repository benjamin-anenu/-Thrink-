
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAvailabilityCalculation } from '@/hooks/useAvailabilityCalculation';

const ResourceStats = () => {
  const { stats, loading } = useAvailabilityCalculation();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{stats.totalResources}</div>
          <p className="text-xs text-muted-foreground">Total Resources</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-green-500">{stats.availableResources}</div>
          <p className="text-xs text-muted-foreground">Available</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-yellow-500">{stats.busyResources}</div>
          <p className="text-xs text-muted-foreground">Busy</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-red-500">{stats.overallocatedResources}</div>
          <p className="text-xs text-muted-foreground">Overallocated</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceStats;
