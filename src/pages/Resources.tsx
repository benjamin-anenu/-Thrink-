
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ResourceListView from '@/components/ResourceListView';
import EnhancedResourceGrid from '@/components/EnhancedResourceGrid';
import { ResourceCreationWizard } from '@/components/ResourceCreationWizard';
import ResourceDetailsModal from '@/components/ResourceDetailsModal';
import ViewToggle from '@/components/ViewToggle';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useEnhancedResources } from '@/hooks/useEnhancedResources';
import type { Resource as ContextResource } from '@/contexts/ResourceContext';

const Resources: React.FC = () => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [selectedResource, setSelectedResource] = useState<ContextResource | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { resources, utilizationMetrics } = useEnhancedResources();

  const handleResourceCreated = () => {
    setIsWizardOpen(false);
  };

  const handleViewDetails = (resource: ContextResource) => {
    console.log('View details for resource:', resource.id);
    setSelectedResource(resource);
    setIsDetailsModalOpen(true);
  };

  const handleShowResourceForm = () => {
    setIsWizardOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedResource(null);
  };

  // Transform database resources to match context interface
  const transformedResources: ContextResource[] = resources.map(resource => ({
    id: resource.id,
    name: resource.name || '',
    role: resource.role || '',
    department: resource.department || '',
    email: resource.email || '',
    phone: '+1 (555) 123-4567', // Default phone number for display
    location: 'Remote',
    skills: ['React', 'TypeScript', 'Node.js'],
    availability: 100,
    currentProjects: ['Project Alpha', 'Project Beta'],
    hourlyRate: resource.hourly_rate ? `$${resource.hourly_rate}/hr` : '$0/hr',
    utilization: 75,
    status: 'Available' as 'Available' | 'Busy' | 'Overallocated',
    workspaceId: resource.workspace_id,
    createdAt: resource.created_at,
    updatedAt: resource.updated_at
  }));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Resource Management</h1>
          <div className="flex items-center gap-4">
            <ViewToggle
              view={currentView}
              onViewChange={setCurrentView}
            />
            <Button onClick={() => setIsWizardOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Resource
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {currentView === 'grid' ? (
            <EnhancedResourceGrid 
              resources={transformedResources}
              utilizationMetrics={utilizationMetrics}
              onViewDetails={handleViewDetails}
              onShowResourceForm={handleShowResourceForm}
            />
          ) : (
            <ResourceListView 
              resources={transformedResources}
              onViewDetails={handleViewDetails}
              onShowResourceForm={handleShowResourceForm}
            />
          )}
        </div>

        {isWizardOpen && (
          <ResourceCreationWizard
            open={isWizardOpen}
            onOpenChange={setIsWizardOpen}
          />
        )}

        {selectedResource && (
          <ResourceDetailsModal
            resource={selectedResource}
            open={isDetailsModalOpen}
            onClose={handleCloseDetailsModal}
          />
        )}
      </div>
    </Layout>
  );
};

export default Resources;
