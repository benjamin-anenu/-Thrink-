
import React, { useState } from 'react';
import { useResources } from '@/hooks/useResources';
import ResourceGrid from '@/components/ResourceGrid';
import ResourceListView from '@/components/ResourceListView';
import ResourceStats from '@/components/ResourceStats';
import ResourceFilters from '@/components/ResourceFilters';
import ResourceCreationWizard from '@/components/ResourceCreationWizard';
import ViewToggle from '@/components/ViewToggle';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Resources = () => {
  const { resources, loading, addResource } = useResources();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreationWizard, setShowCreationWizard] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    availability: 'all',
    skills: []
  });

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         resource.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRole = filters.role === 'all' || resource.role === filters.role;
    const matchesAvailability = filters.availability === 'all' || resource.availability === filters.availability;
    
    return matchesSearch && matchesRole && matchesAvailability;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Resources</h1>
          <p className="text-muted-foreground">
            Manage your team members and their allocations
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <ViewToggle 
            viewMode={viewMode} 
            onViewModeChange={setViewMode} 
          />
          <Button 
            onClick={() => setShowCreationWizard(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Resource
          </Button>
        </div>
      </div>

      {/* Stats */}
      <ResourceStats resources={resources} />

      {/* Filters */}
      <ResourceFilters 
        filters={filters} 
        onFiltersChange={setFilters} 
      />

      {/* Resources Display */}
      {viewMode === 'grid' ? (
        <ResourceGrid resources={filteredResources} />
      ) : (
        <ResourceListView resources={filteredResources} />
      )}

      {/* Creation Wizard */}
      {showCreationWizard && (
        <ResourceCreationWizard
          isOpen={showCreationWizard}
          onClose={() => setShowCreationWizard(false)}
          onResourceCreate={addResource}
        />
      )}
    </div>
  );
};

export default Resources;
