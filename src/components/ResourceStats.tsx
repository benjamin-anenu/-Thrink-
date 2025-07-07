
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const ResourceStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground">Total Resources</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-green-500">18</div>
          <p className="text-xs text-muted-foreground">Available</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-yellow-500">4</div>
          <p className="text-xs text-muted-foreground">Busy</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-red-500">2</div>
          <p className="text-xs text-muted-foreground">Overallocated</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceStats;
