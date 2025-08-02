
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEnhancedResources } from '@/hooks/useEnhancedResources';

const ResourceStats = () => {
  const { resources } = useEnhancedResources();

  // Calculate real metrics from database data
  const totalResources = resources.length;
  
  // Since we don't have status in the database, we'll calculate based on other metrics
  // For now, we'll use placeholder calculations that make sense
  const activeResources = resources.filter(r => r.name && r.email).length; // Resources with complete info
  const engineeringResources = resources.filter(r => r.department === 'Engineering' || r.role?.toLowerCase().includes('developer') || r.role?.toLowerCase().includes('engineer')).length;
  const designResources = resources.filter(r => r.department === 'Design' || r.role?.toLowerCase().includes('design')).length;

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
          <div className="text-2xl font-bold text-blue-500">{engineeringResources}</div>
          <p className="text-xs text-muted-foreground">Engineering</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-purple-500">{designResources}</div>
          <p className="text-xs text-muted-foreground">Design</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceStats;
