
import React from 'react';
import { Button } from '@/components/ui/button';
import ResourceCard from '@/components/ResourceCard';
import { Resource } from '@/contexts/ResourceContext';

interface ResourceGridProps {
  resources: Resource[];
  onViewDetails: (resource: Resource) => void;
  onShowResourceForm: () => void;
}

const ResourceGrid = ({ resources, onViewDetails, onShowResourceForm }: ResourceGridProps) => {
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
        />
      ))}
    </div>
  );
};

export default ResourceGrid;
