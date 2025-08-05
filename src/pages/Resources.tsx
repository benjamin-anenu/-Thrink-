import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ResourceListView from '@/components/ResourceListView';
import EnhancedResourceGrid from '@/components/EnhancedResourceGrid';
import ResourceQuickInsights from '@/components/resources/ResourceQuickInsights';
import ResourceDashboard from '@/components/ResourceDashboard';
import { ResourceCreationWizard } from '@/components/ResourceCreationWizard';
import ResourceDetailsModal from '@/components/ResourceDetailsModal';
import ViewToggle from '@/components/ViewToggle';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BarChart3, Users } from 'lucide-react';
import { useEnhancedResourcesWithUtilization } from '@/hooks/useEnhancedResourcesWithUtilization';
import { Resource } from '@/types/resource';
import ResourceEditModal from '@/components/ResourceEditModal';
import { AppInitializationLoader } from '@/components/AppInitializationLoader';
import { useAppInitialization } from '@/hooks/useAppInitialization';

const Resources: React.FC = () => {
  const { isFullyLoaded } = useAppInitialization();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('list');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedResourceForEdit, setSelectedResourceForEdit] = useState<Resource | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'resources'>('dashboard');

  const { resources, loading, utilizationMetrics, refreshResources } = useEnhancedResourcesWithUtilization();

  const handleShowResourceForm = () => {
    setIsWizardOpen(true);
  };

  const handleCloseWizard = () => {
    setIsWizardOpen(false);
  };

  const handleViewDetails = (resource: Resource) => {
    setSelectedResource(resource);
    setIsDetailsModalOpen(true);
  };

  const handleEditResource = (resource: Resource) => {
    setSelectedResourceForEdit(resource);
    setIsEditModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedResource(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedResourceForEdit(null);
  };

  const handleResourceUpdated = () => {
    // Refresh the enhanced resources data
    refreshResources();
    // Close details modal to force refresh when reopened
    if (isDetailsModalOpen) {
      setIsDetailsModalOpen(false);
      setSelectedResource(null);
    }
  };

  // Resources are already properly formatted from useEnhancedResources
  const transformedResources = resources;

  return (
    <AppInitializationLoader>
      {isFullyLoaded && (
        <Layout>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Resource Management</h1>
                <p className="text-muted-foreground">
                  Manage your team members and track their availability
                </p>
              </div>
              <Button onClick={handleShowResourceForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'dashboard' | 'resources')}>
              <TabsList>
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
                  <ViewToggle 
                    view={currentView} 
                    onViewChange={setCurrentView}
                  />
                </div>

                <ResourceQuickInsights />

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

            {/* Modals */}
            <ResourceCreationWizard 
              open={isWizardOpen}
              onOpenChange={setIsWizardOpen}
            />

            {isDetailsModalOpen && (
              <ResourceDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={handleCloseDetailsModal}
                resource={selectedResource}
              />
            )}

            {isEditModalOpen && (
              <ResourceEditModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                resource={selectedResourceForEdit}
                onResourceUpdated={handleResourceUpdated}
              />
            )}
          </div>
        </Layout>
      )}
    </AppInitializationLoader>
  );
};

export default Resources;