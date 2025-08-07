
import React from 'react';
import { Button } from '@/components/ui/button';
import CompactResourceCard from '@/components/CompactResourceCard';
import { Resource } from '@/types/resource';
import { TaskUtilizationMetrics } from '@/types/enhanced-resource';
import { ResourceCardSkeleton } from '@/components/ui/resource-card-skeleton';

interface EnhancedResourceGridProps {
  resources: Resource[];
  utilizationMetrics: Record<string, TaskUtilizationMetrics>;
  onViewDetails: (resource: Resource) => void;
  onEditResource: (resource: Resource) => void;
  onShowResourceForm: () => void;
  showCompareMode?: boolean;
  selectedForComparison?: Set<string>;
  onCompareToggle?: (resourceId: string, selected: boolean) => void;
  loading?: boolean;
}

const EnhancedResourceGrid = ({ 
  resources, 
  utilizationMetrics,
  onViewDetails,
  onEditResource,
  onShowResourceForm,
  showCompareMode = false,
  selectedForComparison = new Set(),
  onCompareToggle,
  loading = false
}: EnhancedResourceGridProps) => {
  if (loading) {
    return <ResourceCardSkeleton count={8} />;
  }
  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No resources found matching your search.</p>
        <Button onClick={onShowResourceForm}>Add New Resource</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {resources.map((resource) => (
        <CompactResourceCard
          key={resource.id}
          resource={resource}
          utilizationMetrics={utilizationMetrics[resource.id]}
          onViewDetails={onViewDetails}
          onEditResource={onEditResource}
        />
      ))}
    </div>
  );
};

export default EnhancedResourceGrid;
