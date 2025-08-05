
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Resource } from '@/types/resource';

interface ResourceStatsProps {
  resources: Resource[];
  loading: boolean;
}

const ResourceStats = ({ resources, loading }: ResourceStatsProps) => {

  // Calculate real metrics from actual database data
  const totalResources = resources.length;
  
  // Resources with complete basic information (name and email)
  const activeResources = resources.filter(r => r.name && r.email).length;
  
  // Resources with roles assigned
  const resourcesWithRoles = resources.filter(r => r.role && r.role.trim() !== '').length;
  
  // Resources with hourly rates defined (indicates they're billable/configured)
  const billableResources = resources.filter(r => r.hourly_rate && r.hourly_rate > 0).length;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
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
          <div className="text-2xl font-bold">{totalResources}</div>
          <p className="text-xs text-muted-foreground">Total Resources</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-green-500">{activeResources}</div>
          <p className="text-xs text-muted-foreground">Active Resources</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-blue-500">{resourcesWithRoles}</div>
          <p className="text-xs text-muted-foreground">With Assigned Roles</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-purple-500">{billableResources}</div>
          <p className="text-xs text-muted-foreground">Billable Resources</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceStats;
