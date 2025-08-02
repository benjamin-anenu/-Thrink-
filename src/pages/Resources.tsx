
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ResourceListView from '@/components/ResourceListView';
import EnhancedResourceGrid from '@/components/EnhancedResourceGrid';
import ResourceDashboard from '@/components/ResourceDashboard';
import { ResourceCreationWizard } from '@/components/ResourceCreationWizard';
import ResourceDetailsModal from '@/components/ResourceDetailsModal';
import ViewToggle from '@/components/ViewToggle';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BarChart3, Users } from 'lucide-react';
import { useEnhancedResources } from '@/hooks/useEnhancedResources';
import type { Resource as ContextResource } from '@/contexts/ResourceContext';
import ResourceEditModal from '@/components/ResourceEditModal';

const Resources: React.FC = () => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('list');
  const [selectedResource, setSelectedResource] = useState<ContextResource | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState<ContextResource | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { resources, utilizationMetrics } = useEnhancedResources();

  const handleResourceCreated = () => {
    setIsWizardOpen(false);
  };

  const handleViewDetails = (resource: ContextResource) => {
    console.log('View details for resource:', resource.id);
    setSelectedResource(resource);
    setIsDetailsModalOpen(true);
  };

  const handleEditResource = (resource: ContextResource) => {
    console.log('Edit resource:', resource.id);
    setResourceToEdit(resource);
    setIsEditModalOpen(true);
  };

  const handleShowResourceForm = () => {
    setIsWizardOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedResource(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setResourceToEdit(null);
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
          <Button onClick={() => setIsWizardOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Resource
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              View Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <ResourceDashboard />
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                <Button
                  variant={currentView === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={currentView === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('list')}
                >
                  List
                </Button>
              </div>
            </div>
            
            {currentView === 'grid' ? (
              <EnhancedResourceGrid 
                resources={transformedResources}
                utilizationMetrics={utilizationMetrics}
                onViewDetails={handleViewDetails}
                onEditResource={handleEditResource}
                onShowResourceForm={handleShowResourceForm}
              />
            ) : (
              <ResourceListView 
                resources={transformedResources}
                onViewDetails={handleViewDetails}
                onEditResource={handleEditResource}
                onShowResourceForm={handleShowResourceForm}
              />
            )}
          </TabsContent>
        </Tabs>

        {isWizardOpen && (
          <ResourceCreationWizard
            open={isWizardOpen}
            onOpenChange={setIsWizardOpen}
          />
        )}

        {selectedResource && (
          <ResourceDetailsModal
            resource={selectedResource}
            isOpen={isDetailsModalOpen}
            onClose={handleCloseDetailsModal}
          />
        )}

        {resourceToEdit && (
          <ResourceEditModal
            resource={resourceToEdit}
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
          />
        )}
      </div>
    </Layout>
  );
};

export default Resources;
