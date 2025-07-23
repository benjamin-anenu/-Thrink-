
import React from 'react';
import { Button } from '@/components/ui/button';
import ResourceCard from '@/components/ResourceCard';
import { Resource } from '@/contexts/ResourceContext';

interface ResourceGridProps {
  resources: Resource[];
  onViewDetails: (resource: Resource) => void;
  onShowResourceForm: () => void;
  showCompareMode?: boolean;
  selectedForComparison?: Set<string>;
  onCompareToggle?: (resourceId: string, selected: boolean) => void;
}

const ResourceGrid = ({ 
  resources, 
  onViewDetails, 
  onShowResourceForm,
  showCompareMode = false,
  selectedForComparison = new Set(),
  onCompareToggle
}: ResourceGridProps) => {
  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No resources found matching your search.</p>
        <Button onClick={onShowResourceForm}>Add New Resource</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onViewDetails={onViewDetails}
          showCompareCheckbox={showCompareMode}
          isSelectedForComparison={selectedForComparison.has(resource.id)}
          onCompareToggle={onCompareToggle}
        />
      ))}
    </div>
  );
};

export default ResourceGrid;
