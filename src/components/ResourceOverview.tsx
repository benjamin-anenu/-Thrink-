
import React, { useState } from 'react';
import { Resource } from '@/contexts/ResourceContext';
import ResourceCard from './ResourceCard';
import ResourceStats from './ResourceStats';
import ResourceFilters from './ResourceFilters';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

interface ResourceOverviewProps {
  resources: Resource[];
  onViewDetails: (resource: Resource) => void;
  onShowResourceForm: () => void;
  onDeleteResource?: (resource: Resource) => void;
}

const ResourceOverview: React.FC<ResourceOverviewProps> = ({ 
  resources, 
  onViewDetails, 
  onShowResourceForm,
  onDeleteResource 
}) => {
  const [filters, setFilters] = useState({
    search: '',
    department: 'all',
    role: 'all',
    availability: 'all'
  });

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         resource.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesDepartment = filters.department === 'all' || resource.department === filters.department;
    const matchesRole = filters.role === 'all' || resource.role === filters.role;
    const matchesAvailability = filters.availability === 'all' || 
                               (filters.availability === 'available' && resource.availability > 50) ||
                               (filters.availability === 'busy' && resource.availability <= 50);

    return matchesSearch && matchesDepartment && matchesRole && matchesAvailability;
  });

  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <Plus className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No Resources Found</h3>
          <p>Add your first team member to get started with resource management.</p>
        </div>
        <Button onClick={onShowResourceForm}>Add Resource</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ResourceStats resources={resources} />
      
      <ResourceFilters filters={filters} onFiltersChange={setFilters} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(resource => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onViewDetails={onViewDetails}
            onDelete={onDeleteResource}
          />
        ))}
      </div>

      {filteredResources.length === 0 && resources.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No resources match your current filters.</p>
        </div>
      )}
    </div>
  );
};

export default ResourceOverview;
