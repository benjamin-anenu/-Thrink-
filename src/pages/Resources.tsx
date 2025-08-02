
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import Layout from '@/components/Layout';
import ResourceForm from '@/components/ResourceForm';
import ResourceGrid from '@/components/ResourceGrid';
import ResourceListView from '@/components/ResourceListView';
import ViewToggle from '@/components/ViewToggle';
import ResourceQuickInsights from '@/components/resources/ResourceQuickInsights';
import { useResources } from '@/hooks/useResources';

const Resources = () => {
  const { currentWorkspace } = useWorkspace();
  const { resources, loading } = useResources();
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); // Default to list view
  const [showFilters, setShowFilters] = useState(false);

  // Filter resources based on search
  const filteredResources = resources.filter(resource =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentWorkspace) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">No Workspace Selected</h2>
            <p className="text-muted-foreground">Please select a workspace to view resources.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Resources</h1>
            <p className="text-muted-foreground mt-2">
              Manage your team members and their skills
            </p>
          </div>
          <Button onClick={() => setShowResourceForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Resource
          </Button>
        </div>

        {/* Quick Insights */}
        <ResourceQuickInsights />

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills Matrix</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Search and View Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? 'bg-muted' : ''}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              <ViewToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>

            {/* Resources Display */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading resources...</div>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <ResourceGrid resources={filteredResources} />
                ) : (
                  <ResourceListView resources={filteredResources} />
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="skills">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Skills matrix coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="assignments">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Resource assignments coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Resource Form Modal */}
        {showResourceForm && (
          <ResourceForm onClose={() => setShowResourceForm(false)} />
        )}
      </div>
    </Layout>
  );
};

export default Resources;
