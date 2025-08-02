
import React from 'react';
import { Button } from '@/components/ui/button';
import EnhancedResourceCard from '@/components/EnhancedResourceCard';
import { Resource } from '@/contexts/ResourceContext';
import { TaskUtilizationMetrics } from '@/types/enhanced-resource';

interface EnhancedResourceGridProps {
  resources: Resource[];
  utilizationMetrics: Record<string, TaskUtilizationMetrics>;
  onViewDetails: (resource: Resource) => void;
  onShowResourceForm: () => void;
  showCompareMode?: boolean;
  selectedForComparison?: Set<string>;
  onCompareToggle?: (resourceId: string, selected: boolean) => void;
}

const EnhancedResourceGrid = ({ 
  resources, 
  utilizationMetrics,
  onViewDetails, 
  onShowResourceForm,
  showCompareMode = false,
  selectedForComparison = new Set(),
  onCompareToggle
}: EnhancedResourceGridProps) => {
  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No resources found matching your search.</p>
        <Button onClick={onShowResourceForm}>Add New Resource</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
      {resources.map((resource) => (
        <EnhancedResourceCard
          key={resource.id}
          resource={resource}
          utilizationMetrics={utilizationMetrics[resource.id]}
          onViewDetails={onViewDetails}
          showCompareCheckbox={showCompareMode}
          isSelectedForComparison={selectedForComparison.has(resource.id)}
          onCompareToggle={onCompareToggle}
        />
      ))}
    </div>
  );
};

export default EnhancedResourceGrid;
