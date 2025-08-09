
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import ResourceStats from '@/components/ResourceStats';
import ResourceGrid from '@/components/ResourceGrid';
import ResourceFilters from '@/components/ResourceFilters';
import { Resource } from '@/types/resource';

interface ResourceOverviewProps {
  resources: Resource[];
  loading?: boolean;
  onViewDetails: (resource: Resource) => void;
  onShowResourceForm: () => void;
}

const ResourceOverview = ({ resources, loading = false, onViewDetails, onShowResourceForm }: ResourceOverviewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredResources = resources.filter(resource =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleFiltersChange = (filters: any) => {
    console.log('Filters changed:', filters);
    // Apply filters to resources
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, role, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <ResourceFilters
          onFiltersChange={handleFiltersChange}
          isOpen={showFilters}
          onToggle={() => setShowFilters(!showFilters)}
        />
      </div>

      {showFilters && (
        <ResourceFilters
          onFiltersChange={handleFiltersChange}
          isOpen={true}
          onToggle={() => setShowFilters(false)}
        />
      )}

      {/* Resource Summary */}
      <ResourceStats resources={resources} loading={loading} />

      {/* Resources Grid */}
      <ResourceGrid
        resources={filteredResources}
        onViewDetails={onViewDetails}
        onShowResourceForm={onShowResourceForm}
        loading={loading}
      />
    </div>
  );
};

export default ResourceOverview;
